const fs = require('fs');
const csv = require('csv-parser');

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
  lng
}) {
  // eslint-disable-next-line yoda
  return (55.75 < lat && lat < 55.79) && (37.45 < lng && lng < 37.51);
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

function processItems(lines) {
  const objects = new Map();
  const owners = new Map();
  const valueTypes = new Map();
  const sports = new Set();
  const zoneTypes = new Set();

  for (const line of lines) {
    if (!objects.has(line.id)) {
      objects.set(line.id, createObject(line));
    }

    owners.set(line.ownerId, line.ownerName);
    valueTypes.set(line.valueId, line.valueName);
    sports.add(line.sportName);
    zoneTypes.add(line.zoneType);

    const object = objects.get(line.id);
    if (!object.zones.has(line.zoneId)) {
      object.zones.set(line.zoneId, createZone(line));
    }

    const zone = object.zones.get(line.zoneId);

    zone.sports.push(line.sportName);
  }

  return {
    owners: Object.fromEntries(owners),
    valueTypes: Object.fromEntries(valueTypes),
    sports: Array.from(sports.values()),
    zoneTypes: Array.from(zoneTypes.values()),
    objects: [...objects.entries()].map(([key, value]) => (
      {
        ...value,
        zones: Array.from(value.zones.values()),
      })),
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
