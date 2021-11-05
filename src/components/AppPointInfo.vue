<template>
  <div class="point-info">
    <AppAttributesTable
      :attributes="attributes"
      class="point-info__attributes"
    />
    <div class="point-info__heading">
      Список объектов
    </div>
    <div
      v-for="object of pointInfo.nearObjects"
      :key="object.id"
      class="point-info__object"
    >
      <app-object-info :object="object" />
    </div>
  </div>
</template>

<script>
import AppObjectInfo from './AppObjectInfo.vue';
import AppAttributesTable from './AppAttributesTable.vue';

export default {
  name: 'AppPointInfo',
  components: { AppAttributesTable, AppObjectInfo },
  props: {
    pointInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    sportSquare() {
      const square = this.pointInfo.nearObjects.reduce((sum, item) => sum + item.square, 0);
      return Math.round(square * 10) / 10;
    },
    sports() {
      const uniqueSports = this.pointInfo.nearObjects
        .reduce((set, { sports }) => new Set([...sports, ...set]), new Set());
      return Array.from(uniqueSports.values());
    },
    zones() {
      return this.pointInfo.nearObjects.map(({ zones }) => zones).flat();
    },
    populationDensity() {
      if (!this.pointInfo.populationArea) {
        return null;
      }
      return Math.floor(this.pointInfo.populationArea.density * 10 ** 6);
    },
    area() {
      return Math.floor(this.pointInfo.area);
    },
    population() {
      if (!this.pointInfo.area || !this.populationDensity) {
        return null;
      }
      return Math.floor(this.pointInfo.area * this.pointInfo.populationArea.density);
    },
    squareToPopulationDensity() {
      return Math.floor((this.sportSquare / this.populationDensity) * 100_000 * 1000) / 1000;
    },
    zoneQuantityToPopulationDensity() {
      return Math.floor((this.zones.length / this.populationDensity) * 100_000 * 1000) / 1000;
    },
    sportsToPopulationDensity() {
      return Math.floor((this.sports.length / this.populationDensity) * 100_000 * 1000) / 1000;
    },

    attributes() {
      const attributes = [
        {
          name: 'Число объектов:',
          value: this.pointInfo.nearObjects.length,
        },
        {
          name: 'Общая площадь спорт. объектов:',
          value: `${this.sportSquare}м2`,
        },
        {
          name: 'Различных видов спорта:',
          value: this.sports.length,
        },
      ];
      if (this.area) {
        attributes.push(
          {
            name: 'Площадь выделенного участка:',
            value: `${this.area} м2`,
          },
        );
      }

      if (this.population) {
        attributes.push(
          ...[

            {
              name: 'Плотность населения:',
              value: `${this.populationDensity} человек на кв. км.`,
            },
            {
              name: 'Оценочное кол-во жителей:',
              value: `${this.population} человек`,
            },
            {
              name: 'Площадь спортивных зон:',
              value: `${this.squareToPopulationDensity} м. на 100 000 человек на кв. км.`,
            },
            {
              name: 'Кол-во спортивных зон:',
              value: `${this.zoneQuantityToPopulationDensity} шт. на 100 000 человек на кв. км.`,
            },
            {
              name: 'Кол-во спортивных услуг:',
              value: `${this.sportsToPopulationDensity} шт. на 100 000 человек на кв. км.`,
            },
          ],
        );
      }

      return attributes;
    },
  },
};
</script>

<style lang="scss">
.point-info {
  &__object {
    margin-top: 30px;
    font-size: 16px;
  }

  &__heading {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 28px;
  }
}
</style>
