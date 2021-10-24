<template>
  <div class="point-info">
    <h2>Информация о пересечении</h2>
    <div>
      <b>Число объектов:</b> {{ pointInfo.nearObjects.length }}
    </div>
    <div>
      <b>Общая площадь спорт. объектов:</b> {{ sportSquare }}
    </div>
    <div>
      <b>Различных видов спорта:</b> {{ sports.length }}
    </div>
    <div v-if="population">
      <b>Плотность населения:</b> {{ population }} человек на кв. км.
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
    population() {
      if (!this.pointInfo.populationArea) {
        return null;
      }
      return Math.floor(this.pointInfo.populationArea.density * 10 ** 6);
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
}
</style>
