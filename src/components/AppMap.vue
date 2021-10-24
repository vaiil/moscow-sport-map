<template>
  <l-map
    class="app-map"
    :zoom="14"
    :center="center"
  >
    <l-tile-layer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      layer-type="base"
      name="OpenStreetMap"
      :max-zoom="19"
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
    <l-layer-group
      :visible="settings.showValueZones"
    >
      <l-geo-json
        v-for="shard of shardsWithColor"
        :key="shard.id"
        :geojson="shard.geoJSON"
        :options="{style: shard.style}"
        @click="selectShard($event, shard)"
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
    <l-geo-json
      v-if="selectedShard"
      :geojson="selectedShard.geoJSON"
    />
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
  LMap, LTileLayer, LGeoJson, LPolygon, LMarker, LPopup, LLayerGroup,
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
    // LCircle,
    LGeoJson,
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
        return Array.isArray(a) || a === null;
      },
      default: null,
    },
    shards: {
      type: Array,
      required: true,
    },
    settings: {
      type: Object,
      required: true,
    },
  },
  emits: ['mapClick'],
  data() {
    return {
      selectedShard: null,
    };
  },
  computed: {
    maxShardSquare() {
      return Math.max(...this.shards.map(({ square }) => square));
    },
    shardsWithColor() {
      return this.shards.map((shard) => {
        const part = (shard.square / this.maxShardSquare) * 255;
        return ({
          ...shard,
          style: {
            fill: true,
            weight: 2,
            color: 'green',
            fillOpacity: 0.5,
            fillColor: `rgb(${255 - part}, ${part}, 0)`,
          },
        });
      });
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
    sportValueZoneStyle() {
      return {
        weight: 2,
        color: '#ECEFF1',
        opacity: 1,
        fillOpacity: 1,
      };
    },
  },
  methods: {
    selectShard(event, shard) {
      this.selectedShard = shard;
      this.$emit('mapClick', event);
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
