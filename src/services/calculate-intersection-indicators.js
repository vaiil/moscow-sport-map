import uniqueItems from '../helpers/unique-items';

export function calculateKeyIndicators(intersectedObjects) {
  const report = {
    objectCount: 0,
    sportObjectArea: 0,
    zoneCount: 0,
    sportTypeCount: 0,
  };

  const per100kReport = {
    objectCount: 0,
    sportObjectArea: 0,
    zoneCount: 0,
    sportTypeCount: 0,
  };

  for (const object of intersectedObjects) {
    report.objectCount += 1;
    report.sportObjectArea += object.square;
    report.zoneCount += object.zones.length;
    report.sportTypeCount += object.sports.length;

    const coefficient = 100_000 / object.population;

    per100kReport.objectCount += coefficient;
    per100kReport.sportObjectArea += object.square * coefficient;
    per100kReport.zoneCount += object.zones.length * coefficient;
    per100kReport.sportTypeCount += object.sports.length * coefficient;
  }

  return {
    report,
    per100kReport,
  };
}

export default function calculateIntersectionIndicators({ nearObjects, populationArea, area }) {
  const sportObjectArea = nearObjects.reduce((sum, item) => sum + item.square, 0).toFixed(1);
  const uniqueSports = uniqueItems(nearObjects.map(({ sports }) => sports).flat());
  const allZones = nearObjects.map(({ zones }) => zones).flat();
  const zoneCount = allZones.length;
  const objectCount = nearObjects.length;

  const sportTypeCount = uniqueSports.length;

  let density = null;
  let population = null;
  if (populationArea) {
    density = Math.floor(populationArea.density * 10 ** 6);
    population = Math.floor(populationArea.density * area);
  }

  const per100kReport = {
    objectCount: nearObjects.reduce((s, object) => s + 1 / object.population, 0) * 100_000,
    sportObjectArea:
      nearObjects.reduce((s, object) => s + object.square / object.population, 0) * 100_000,
    zoneCount: nearObjects.reduce(
      (s, object) => s + object.zones.length / object.population, 0,
    ) * 100_000,
    sportTypeCount: nearObjects.reduce(
      (s, object) => s + object.sports.length / object.population, 0,
    ) * 100_000,
  };

  const reportBySports = uniqueSports.map((sportName) => {
    const zones = allZones.filter(({ sports }) => sports.includes(sportName));
    const report = {
      sportName,
      zoneCount: zones.length,
      area: zones.reduce((sum, item) => sum + item.square, 0).toFixed(1),
    };

    report.per100k = {
      zoneCount: zones.reduce((sum, item) => sum + 1 / item.population, 0) * 100_000,
      area: zones.reduce((sum, item) => sum + item.square / item.population, 0) * 100_000,
    };
    return report;
  });

  return {
    objectCount,

    sportObjectArea,
    zoneCount,
    sportTypeCount,

    density,
    area,
    population,

    sportTypes: uniqueSports,

    per100kReport,
    reportBySports,
  };
}
