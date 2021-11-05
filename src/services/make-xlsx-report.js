import xlsx from 'xlsx';

function format(value) {
  return parseFloat(parseFloat(value).toPrecision(5));
}

function makeIndicatorsRow(indicators, indicatorNames) {
  const rows = [
    [
      'Показатель',
      'Значение',
    ],
  ];
  if (indicators.density) {
    rows[0].push('Значение на 100 тыс. человек');
  }
  return rows.concat(indicatorNames.map((({ indicator, label }) => {
    const row = [
      label,
      format(indicators[indicator]),
    ];
    if (indicators.per100kReport) {
      row.push(format(indicators.per100kReport[indicator]));
    }
    return row;
  })));
}

function makeCommonReport(indicators) {
  const populationRows = [];
  if (indicators.population) {
    populationRows.push([
      'Оценочное кол-во жителей, человек.',
      indicators.population,
    ]);
    populationRows.push([
      'Плотность населения, жителей на км2',
      format(indicators.density),
    ]);
  }
  return [
    [
      'Площадь выбранного пересечения',
      format(indicators.area),
    ],
    ...populationRows,
    [],
    ...makeIndicatorsRow(indicators, [
      {
        indicator: 'objectCount',
        label: 'Число объектов, шт',
      },
      {
        indicator: 'sportObjectArea',
        label: 'Общая площадь спортивных объектов, м2',
      },
      {
        indicator: 'zoneCount',
        label: 'Число зон, шт',
      },
      {
        indicator: 'sportTypeCount',
        label: 'Число различных видов спорта, шт',
      },
    ]),
  ];
}

function makeSportTypesReport(indicators) {
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

function makeSportObjectsList(nearObjects) {
  const headRow = [
    'id Объекта',
    'Объект',
    'Адрес',
    'id Ведомственной Организации',
    'Ведомственная Организация',
    'Широта (Latitude)',
    'Долгота (Longitude)',
    'id Доступность',
    'Доступность',
    'id Спортзоны',
    'Спортзона',
    'Тип спортзоны',
    'Виды спорта',
    'Площадь зоны',
  ];

  return [headRow, ...nearObjects.map((object) => object.zones.map((zone) => [
    object.id,
    object.name,
    object.address,
    object.ownerId,
    object.ownerName,
    object.lat,
    object.lng,
    object.valueId,
    object.valueName,
    zone.zoneId,
    zone.zoneName,
    zone.zoneType,
    zone.sports.join(', '),
    zone.square,
  ])).flat()];
}

export default function makeXlsxReport({ indicators, nearObjects }) {
  const wb = xlsx.utils.book_new();
  const commonList = xlsx.utils.aoa_to_sheet(makeCommonReport(indicators));
  const sportList = xlsx.utils.aoa_to_sheet(makeSportTypesReport(indicators));
  const zoneList = xlsx.utils.aoa_to_sheet(makeSportObjectsList(nearObjects));
  xlsx.utils.book_append_sheet(wb, commonList, 'Общая информация');
  xlsx.utils.book_append_sheet(wb, sportList, 'Отчет по видам спорта');
  xlsx.utils.book_append_sheet(wb, zoneList, 'Список объектов с зонами');
  xlsx.writeFile(wb, 'out.xlsx');
}
