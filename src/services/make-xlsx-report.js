import xlsx from 'xlsx';
import {
  makeCommonReport,
  makeCommonIndicators, makeSportTypesReport,
} from './report-service';

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
  const commonList = xlsx.utils.aoa_to_sheet([
    ...makeCommonReport(indicators).map(({ title, value, postfix }) => {
      let firstColumn = title;
      if (postfix) {
        firstColumn += `, ${postfix}`;
      }
      return [firstColumn, value];
    }),
    [],
    [
      [
        'Показатель',
        'Значение',
        'Значение на 100 тыс. человек',
      ],
    ],
    ...makeCommonIndicators(indicators).map(({
      title, value, postfix, valuePer100k,
    }) => {
      let firstColumn = title;
      if (postfix) {
        firstColumn += `, ${postfix}`;
      }
      return [firstColumn, value, valuePer100k];
    }),
  ]);
  const sportList = xlsx.utils.aoa_to_sheet([
    [
      'Вид спорта',
      'Число зон, шт.',
      'Площадь зон, м2.',
      'Число зон на 100 тыс. человек, шт',
      'Площадь зон на 100 тыс. человек, м2',
    ],
    ...makeSportTypesReport(indicators).map((indicator) => [
      indicator.name,
      indicator.zoneCount,
      indicator.area,
      indicator.per100k.zoneCount,
      indicator.per100k.area,
    ]),
  ]);
  const zoneList = xlsx.utils.aoa_to_sheet(makeSportObjectsList(nearObjects));
  xlsx.utils.book_append_sheet(wb, commonList, 'Общая информация');
  xlsx.utils.book_append_sheet(wb, sportList, 'Отчет по видам спорта');
  xlsx.utils.book_append_sheet(wb, zoneList, 'Список объектов с зонами');
  xlsx.writeFile(wb, 'out.xlsx');
}
