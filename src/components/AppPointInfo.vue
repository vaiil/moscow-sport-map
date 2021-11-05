<template>
  <div class="point-info">
    <div class="point-info__attributes">
      <div>
        <b>Число объектов:</b> {{ pointInfo.nearObjects.length }}
      </div>
      <div>
        <b>Общая площадь спорт. объектов:</b> {{ sportSquare }} м
      </div>
      <div>
        <b>Различных видов спорта:</b> {{ sports.length }}
      </div>
      <template v-if="populationDensity">
        <div v-if="populationDensity">
          <b>Плотность населения:</b> {{ populationDensity }} человек на кв. км.
        </div>
        <div v-if="pointInfo.area">
          <b>Площадь:</b> {{ area }} м. кв
        </div>
        <div v-if="population">
          <b>Оценочное кол-во жителей:</b> {{ population }} человек
        </div>
        <div v-if="squareToPopulationDensity">
          <b>Площадь спортивных зон:</b> <br>
          {{ squareToPopulationDensity }}м. на 100 000 человек на кв. км.
        </div>
        <div v-if="zoneQuantityToPopulationDensity">
          <b>Кол-во спортивных зон:</b> <br>
          {{ zoneQuantityToPopulationDensity }}шт. на 100 000 человек на кв. км.
        </div>
        <div v-if="sportsToPopulationDensity">
          <b>Кол-во спортивных услуг:</b> <br>
          {{ sportsToPopulationDensity }}шт. на 100 000 человек на кв. км.
        </div>
      </template>
    </div>
    <h3>Список объектов</h3>
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

export default {
  name: 'AppPointInfo',
  components: { AppObjectInfo },
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
  },
};
</script>

<style lang="scss">
.point-info {
  &__object {
    margin-top: 20px;
    font-size: 14px;
  }
  &__attributes {
    display: grid;
    grid-gap: 5px;
  }
}
</style>
