<template>
  <div>
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
  </div>
</template>

<script>
export default {
  name: 'AppPointInfo',
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
  },
};
</script>

<style scoped>

</style>
