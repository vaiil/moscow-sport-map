<template>
  <l-map
    class="app-map"
    :zoom="14"
    :center="center"
    @click="mapClick"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="20"
    />
    <l-layer-group
      :visible="settings.showPopulation"
    >
      <l-polygon
        v-for="area of areas"
        :key="area.id"
        :lat-lngs="area.polygon"
        :fill="true"
        fill-color="red"
        :fill-opacity="area.opacity"
        :stroke="true"
        color="red"
        :opacity="area.opacity"
      />
    </l-layer-group>
    <l-layer-group :visible="settings.showValueZones">
      <l-circle
        v-for="object of sportObjectCircles"
        :key="object.id"
        :radius="object.radius"
        :lat-lng="object.center"
        :fill-opacity="object.opacity"
        :fill="true"
        :weight="2"
        color="green"
        fill-color="green"
      />
    </l-layer-group>
    <l-layer-group :visible="settings.showMarkers">
      <l-marker
        v-for="object of sportObjects"
        :key="object.id"
        :icon="$options.greenIcon"
        :lat-lng="object.center"
      >
        <l-popup>
          <app-object-info
            :object="object"
            class="app-map__object-info-popup"
          />
        </l-popup>
      </l-marker>
    </l-layer-group>
    <l-marker
      v-if="point"
      radius="5"
      :lat-lng="point"
    />
  </l-map>
</template>

<script>
import 'leaflet/dist/leaflet.css';
import {
  LMap, LTileLayer, LCircle, LPolygon, LMarker, LPopup, LLayerGroup,
} from '@vue-leaflet/vue-leaflet';
import L from 'leaflet';
import AppObjectInfo from './AppObjectInfo.vue';

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default {
  name: 'AppMap',
  components: {
    AppObjectInfo,
    LMap,
    LTileLayer,
    LCircle,
    LPolygon,
    LMarker,
    LPopup,
    LLayerGroup,
  },
  greenIcon,
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
    point: {
      validator(a) {
        console.log(a);
        return Array.isArray(a) || a === null;
      },
      default: null,
    },
    settings: {
      type: Object,
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
        opacity: 0.1 + (area.density / this.maxDensity) * 0.4,
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

<style lang="scss">
.app-map {
  &__object-info-popup {
    max-height: 90vh;
    overflow: auto;
    font-size: 14px;
  }
}
</style>
