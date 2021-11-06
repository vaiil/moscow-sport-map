import format from '../helpers/number-format';

export function makeIndicatorsRow(indicators, indicatorNames) {
  return indicatorNames.map((({ indicator, label, postfix }) => ({
    title: label,
    value: format(indicators[indicator]),
    valuePer100k: format(indicators.per100kReport[indicator]),
    postfix,
  })));
}

export function makeCommonReport(indicators) {
  const populationRows = [];
  if (indicators.population) {
    populationRows.push({
      title: 'Оценочное кол-во жителей',
      value: format(parseInt(indicators.population, 10)),
      postfix: 'человек',
    },
    {
      title: 'Плотность населения',
      value: format(indicators.density),
      postfix: 'человек на км2',
    });
  }
  return [
    {
      title: 'Площадь выбранного пересечения',
      value: format(indicators.area),
      postfix: 'м2',
    },
    ...populationRows,
  ];
}

export function makeCommonIndicators(indicators) {
  return makeIndicatorsRow(indicators, [
    {
      indicator: 'objectCount',
      label: 'Число объектов',
      postfix: 'шт',
    },
    {
      indicator: 'sportObjectArea',
      label: 'Общая площадь спортивных объектов',
      postfix: 'м2',
    },
    {
      indicator: 'zoneCount',
      label: 'Число зон',
      postfix: 'шт',
    },
    {
      indicator: 'sportTypeCount',
      label: 'Число различных видов спорта',
      postfix: 'шт',
    },
  ]);
}

export function makeSportTypesReport(indicators) {
  return indicators.reportBySports
    .map((({
      sportName, zoneCount, area, per100k,
    }) => ({
      name: sportName,
      zoneCount: format(zoneCount),
      area: format(area),
      realArea: area,
      per100k: {
        zoneCount: format(per100k.zoneCount),
        area: format(per100k.area),
      },
    })))
    .sort((a, b) => b.realArea - a.realArea);
}
