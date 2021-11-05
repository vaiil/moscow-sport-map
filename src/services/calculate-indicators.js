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

  let per100kReport = null;
  if (density !== null && density > 0) {
    per100kReport = {
      objectCount: (objectCount / density) * 100_000,
      sportObjectArea: (sportObjectArea / density) * 100_000,
      zoneCount: (zoneCount / density) * 100_000,
      sportTypeCount: (sportTypeCount / density) * 100_000,
    };
  }

  const reportBySports = uniqueSports.map((sportName) => {
    const zones = allZones.filter(({ sports }) => sports.includes(sportName));
    const report = {
      sportName,
      zoneCount: zones.length,
      area: zones.reduce((sum, item) => sum + item.square, 0).toFixed(1),
    };

    if (density !== null && density > 0) {
      report.per100k = {
        zoneCount: (report.zoneCount / density) * 100_000,
        area: (report.area / density) * 100_000,
      };
    }
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
