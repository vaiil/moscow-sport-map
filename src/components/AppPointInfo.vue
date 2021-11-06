<template>
  <div class="point-info">
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
};
</script>

<style lang="scss">
.point-info {
  &__object {
    margin-top: 30px;
    font-size: 16px;
  }
}
</style>
