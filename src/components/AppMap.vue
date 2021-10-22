<template>
  <l-map
    class="app-map"
    :zoom="12"
    :center="center"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="18"
    />
    <l-circle
      v-for="object of sportObjects"
      :key="object.id"
      :radius="object.radius"
      :lat-lng="object.center"
    />
    <l-polygon
      v-for="area of areas"
      :key="area.id"
      :lat-lngs="area.polygon"
      :fill="true"
      :fill-color="area.color"
      :fill-opacity="0.4"
    />
  </l-map>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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
  computed: {
    areas() {
      return this.populationAreas.map((area) => {
        const points = area.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
        const square = L.GeometryUtil.geodesicArea(points);
        const density = area.population / square;
        return {
          polygon: points.map((item) => [item.lat, item.lng]),
          square,
          color: `rgb(255, ${255 - density * 500}, 0)`,
        };
      });
    },
  },
};
</script>

<style scoped>
.app-map {

}
</style>
