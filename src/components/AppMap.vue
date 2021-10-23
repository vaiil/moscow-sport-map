<template>
  <l-map
    class="app-map"
    :zoom="12"
    :center="center"
    @click="mapClick"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="18"
    />
    <l-polygon
      v-for="area of areas"
      :key="area.id"
      :lat-lngs="area.polygon"
      :fill="true"
      fill-color="red"
      :fill-opacity="area.opacity"
    />
    <l-circle
      v-for="object of sportObjectCircles"
      :key="object.id"
      :radius="object.radius"
      :lat-lng="object.center"
      :fill-opacity="object.opacity"
      :fill="true"
      fill-color="green"
    />
  </l-map>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import {
  LMap, LTileLayer, LCircle, LPolygon,
} from '@vue-leaflet/vue-leaflet';

export default {
  name: 'AppMap',
  components: {
    LMap,
    LTileLayer,
    LCircle,
    LPolygon,
  },
  props: {
    center: {
      type: Array,
      required: true,
    },
    sportObjects: {
      type: Array,
      required: true,
    },
    populationAreas: {
      type: Array,
      required: true,
    },
  },
  emits: ['mapClick'],
  computed: {
    sportObjectCircles() {
      const maxSquare = Math.max(...this.sportObjects.map(({ square }) => square));
      return this.sportObjects.map((object) => ({
        id: object.id,
        radius: object.radius,
        center: object.center,
        opacity: (object.square / maxSquare) * 0.4,
      }));
    },
    maxDensity() {
      return Math.max(...this.populationAreas.map(({ density }) => density));
    },
    areas() {
      return this.populationAreas.map((area) => ({
        id: area.id,
        polygon: area.points.map((item) => [item.lat, item.lng]),
        opacity: 0.1 + (area.density / this.maxDensity) * 0.3,
      }));
    },
  },
  methods: {
    mapClick(e) {
      if (e.latlng) {
        this.$emit('mapClick', e);
      }
    },
  },
};
</script>

<style scoped>
.app-map {

}
</style>
