import fs from 'fs';
import fsPromises from 'fs/promises';
import csv from 'csv-parser';
import * as turf from '@turf/turf';
import arg from 'arg';
import uniqueItems from '../src/helpers/unique-items.js';

const args = arg({
  '--objects-csv-file': String,
  '--population-geo-json-file': String,
});

const results = [];

const headers = new Map([
  ['id Объекта', 'id'],
  ['Объект', 'name'],
  ['Адрес', 'address'],
  ['id Ведомственной Организации', 'ownerId'],
  ['Ведомственная Организация', 'ownerName'],
  ['id Спортзоны', 'zoneId'],
  ['Спортзона', 'zoneName'],
  ['Тип спортзоны', 'zoneType'],
  ['id Доступность', 'valueId'],
  ['Доступность', 'valueName'],
  ['Вид спорта', 'sportName'],
  ['Широта (Latitude)', 'lat'],
  ['Долгота (Longitude)', 'lng'],
  ['Площадь спортзоны', 'square'],
]);

async function processPopulationData(fileName) {
  const populationFileContent = await fsPromises.readFile(fileName);

  const populationData = JSON.parse(populationFileContent.toString());

  return Object.fromEntries(
    populationData
      .map(item => {
        const area = turf.area(item);
        const population = item.properties.population;
        return ({
          id: item.id,
          population,
          area,
          density: population / area,
          geoJSON: item
        });
      })
      .map(item => [item.id, item])
  );
}

const populationsMap = await processPopulationData(args['--population-geo-json-file']);

function filter({
  lat,
  lng,
}) {
  // eslint-disable-next-line yoda
  return (55.76 < lat && lat < 55.79) && (37.45 < lng && lng < 37.51);
}

function getRadius(type) {
  switch (+type) {
    case 1:
      return 5000;
    case 2:
      return 3000;
    case 3:
      return 1000;
    case 4:
      return 200;
    default:
      return 10;
  }
}

function createObject({
  id,
  name,
  ownerId,
  ownerName,
  valueName,
  valueId,
  address,
  lat,
  lng,
}) {
  const radius = getRadius(valueId);
  return {
    id,
    name,
    address,
    ownerId,
    valueId,
    ownerName,
    valueName,
    radius,
    lat: +lat,
    lng: +lng,
    zones: new Map(),
    geoJSON: turf.circle([+lng, +lat], radius / 1000),
  };
}

function createZone({
  zoneType,
  zoneId,
  zoneName,
  square,
}) {
  return {
    zoneType,
    zoneId,
    zoneName,
    square: +square,
    sports: [],
  };
}

function createShard(geoJSON, object, excludes = []) {
  return {
    geoJSON,
    objects: [object.id],
    excludes: excludes
  };
}

function intersect(shard, object) {
  const intersection = turf.intersect(shard.geoJSON, object.geoJSON);
  if (!intersection) {
    return null;
  }
  return {
    geoJSON: intersection,
    objects: [...shard.objects, object.id],
    excludes: shard.excludes
  };
}

function diff(shard, object) {
  const difference = turf.difference(shard.geoJSON, object.geoJSON);
  if (!difference) {
    return null;
  }
  return {
    geoJSON: difference,
    objects: shard.objects,
    excludes: [...shard.excludes, object.id]
  };
}

function calculateIntersections(inputObjects) {
  const objects = inputObjects.slice();
  const firstObject = objects.shift();
  let shards = [createShard(firstObject.geoJSON, firstObject)];
  let union = firstObject.geoJSON;
  const previous = [];
  for (const object of objects) {
    const newShards = [];
    for (const shard of shards) {
      const intersection = intersect(shard, object);

      if (intersection) {
        newShards.push(intersection);
        const difference = diff(shard, object);
        if (difference) {
          newShards.push(difference);
        }
      } else {
        newShards.push(shard);
      }
    }

    const rest = turf.difference(object.geoJSON, union);
    if (rest) {
      newShards.push(createShard(rest, object, previous
        .filter(prev => {
          return turf.intersect(object.geoJSON, prev.geoJSON) !== null;
        })
        .map(item => item.id)
      ));
    }
    shards = newShards.map((shard) => {
      const flatten = turf.flatten(shard.geoJSON);
      return flatten.features.map((feature) => ({
        ...shard,
        geoJSON: feature,
      }));
    })
      .flat();

    union = turf.union(union, object.geoJSON);
    previous.push(object);
  }

  return shards;
}

function flattenShards(shards) {
  return shards.reduce((result, item) => {
    const collection = turf.flatten(item.geoJSON);
    return result.concat(collection.features.map(feature => {
      return {
        ...item,
        geoJSON: feature
      };
    }));
  }, []);
}

function mapShardsToPopulation(shards, populations) {
  if (populations.length === 0) {
    return shards.map(shard => ({
      ...shard,
      populationId: null,
      density: null
    }));
  }
  const allPopulationRegions = populations.reduce((region, item) => turf.union(region, item.geoJSON), populations[0].geoJSON);
  const result = [];
  for (const shard of shards) {
    for (const population of populations) {
      const intersect = turf.intersect(population.geoJSON, shard.geoJSON);
      if (intersect) {
        result.push({
          ...shard,
          geoJSON: intersect,
          populationId: population.id,
          density: population.density,
        });
      }
    }

    const rest = turf.difference(shard.geoJSON, allPopulationRegions);
    if (rest) {
      result.push({
        ...shard,
        geoJSON: rest,
        populationId: null,
        density: null
      });
    }
  }
  return result;
}

function calculateSquares(shards) {
  return shards.map(shard => ({
    ...shard,
    area: turf.area(shard.geoJSON)
  }));
}

function calculatePopulation(object, populations) {
  return parseInt(populations.reduce((sum, population) => {
    const intersect = turf.intersect(population.geoJSON, object.geoJSON);
    if (!intersect) {
      return sum
    }
    return sum + turf.area(intersect) * population.density
  }, 0), 10);
}

function processItems(lines) {
  const objectMap = new Map();
  const owners = new Map();
  const valueTypes = new Map();
  const sports = new Set();
  const zoneTypes = new Set();

  for (const line of lines) {
    if (!objectMap.has(line.id)) {
      objectMap.set(line.id, createObject(line));
    }

    owners.set(line.ownerId, line.ownerName);
    valueTypes.set(line.valueId, line.valueName);
    sports.add(line.sportName);
    zoneTypes.add(line.zoneType);

    const object = objectMap.get(line.id);
    if (!object.zones.has(line.zoneId)) {
      object.zones.set(line.zoneId, createZone(line));
    }

    const zone = object.zones.get(line.zoneId);

    zone.sports.push(line.sportName);
  }

  const populations =  Array.from(Object.values(populationsMap))
  const objects = [...objectMap.values()].map((object) => {
    const population = calculatePopulation(object, populations)
    const zones = Array.from(object.zones.values()).map(zone => ({
      ...zone,
      population,
      squarePerPerson: zone.square / population
    }))
    const square = zones.reduce((sum, zone) => sum + zone.square, 0)
    const center = [+object.lat, +object.lng];
    return (
      {
        ...object,
        center,
        zones,
        area: turf.area(object.geoJSON),
        population,
        square,
        squarePerPerson: square / population,
        sports: uniqueItems(zones.map((zone) => zone.sports)
          .flat()),
        zoneTypes: uniqueItems(zones.map(({ zoneType }) => zoneType)),
      });
  });

  return {
    owners: Object.fromEntries(owners),
    valueTypes: Object.fromEntries(valueTypes),
    sports: Array.from(sports.values()),
    zoneTypes: Array.from(zoneTypes.values()),
    objects,
    shards: calculateSquares(
      flattenShards(
        mapShardsToPopulation(
          calculateIntersections(objects),
          populations
        )
      )
    ),
    populations: populationsMap
  };
}

fs.createReadStream(args['--objects-csv-file'])
  .pipe(csv({
    mapHeaders: ({ header }) => headers.get(header),
  }))
  .on('data', (data) => {
    if (filter(data)) {
      results.push(data);
    }
  })
  .on('end', () => {
    console.log(JSON.stringify(processItems(results), null, 2));
  });
