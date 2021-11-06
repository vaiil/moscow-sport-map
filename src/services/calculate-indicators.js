import uniqueItems from '../helpers/unique-items';

export default function calculateIndicators({ nearObjects, populationArea, area }) {
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
    sportObjectArea: nearObjects.reduce((s, object) => s + object.squarePerPerson, 0) * 100_000,
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
      area: zones.reduce((sum, item) => sum + item.squarePerPerson, 0) * 100_000,
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
