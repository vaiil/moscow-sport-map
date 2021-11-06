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
  const rows = [
    [
      'Вид спорта',
      'Число зон, шт.',
      'Площадь зон, м2.',
    ],
  ];
  if (indicators.density) {
    rows[0].push('Число зон на 100 тыс. человек, шт');
    rows[0].push('Площадь зон на 100 тыс. человек, м2');
  }
  return rows.concat(indicators.reportBySports.map((({
    sportName, zoneCount, area, per100k,
  }) => {
    const row = [
      sportName,
      format(zoneCount),
      format(area),
    ];
    if (per100k) {
      row.push(format(per100k.zoneCount));
      row.push(format(per100k.area));
    }
    return row;
  })));
}
