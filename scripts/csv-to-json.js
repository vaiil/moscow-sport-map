const fs = require('fs');
const csv = require('csv-parser');
const turf = require('@turf/turf');

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
  return {
    id,
    name,
    address,
    ownerId,
    valueId,
    ownerName,
    valueName,
    lat: +lat,
    lng: +lng,
    zones: new Map(),
    geoJSON: turf.circle([+lng, +lat], getRadius(valueId) / 1000),
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

function createShard(geoJSON, object) {
  return {
    geoJSON,
    objects: [object.id],
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
  };
}

function calculateIntersections(inputObjects) {
  const objects = inputObjects.slice();
  const firstObject = objects.shift();
  let shards = [createShard(firstObject.geoJSON, firstObject)];
  let union = firstObject.geoJSON;
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
      newShards.push(createShard(rest, object));
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
  }

  return shards;
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

  const objects = [...objectMap.entries()].map(([key, value]) => (
    {
      ...value,
      zones: Array.from(value.zones.values()),
    }));

  return {
    owners: Object.fromEntries(owners),
    valueTypes: Object.fromEntries(valueTypes),
    sports: Array.from(sports.values()),
    zoneTypes: Array.from(zoneTypes.values()),
    objects,
    shards: calculateIntersections(objects),
  };
}

fs.createReadStream(process.argv[2])
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
