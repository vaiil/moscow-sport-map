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
      <l-geo-json
        v-for="area of areas"
        :key="area.id"
        :geojson="area.geoJSON"
        :options="{
          interactive: false,
          style: {
            fill: true,
            fillColor: 'red',
            fillOpacity: area.opacity,
            stroke: true,
            color: 'red',
            opacity: area.opacity
          }
        }"
      />
    </l-layer-group>
    <l-layer-group
      :visible="settings.showValueZones"
    >
      <l-geo-json
        v-for="area of areas"
        :key="area.id"
        :geojson="area.geoJSON"
        :options="{
          style: {
            fill: false,
            stroke: true,
            color: 'darkred',
            weight: 2
          }
        }"
      />
    </l-layer-group>
    <l-layer-group>
      <l-geo-json
        v-for="shard of shardsWithColor"
        :ref="setItemRef"
        :key="shard.id"
        :geojson="shard.geoJSON"
        :options="shard.options"

        @click="selectShard($event, shard.id)"
      />
    </l-layer-group>
    <l-layer-group
      :visible="settings.showValueZones"
    >
      <l-geo-json
        v-for="object of sportObjects"
        :key="object.id"
        :geojson="object.geoJSON"
        :options="sportValueZoneOptions"
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
      :geojson="selectedShard"
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
  LMap, LTileLayer, LGeoJson, LMarker, LPopup, LLayerGroup,
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
    LGeoJson,
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
    selectedShard: {
      type: Object,
      default: null,
    },
    point: {
      type: Object,
      default: null,
    },
    shards: {
      type: Array,
      required: true,
    },
    shardColors: {
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
      shardRefs: {},
    };
  },
  computed: {
    shardsWithColor() {
      return this.shards.map((shard, index) => {
        const part = this.shardColors[index];
        return ({
          ...shard,
          options: {
            style: {
              fill: true,
              weight: 0,
              color: 'green',
              fillOpacity: (this.settings.showValueZones && Number.isFinite(part)) ? 0.5 : 0,
              fillColor: `hsl(${part}, 100%, 50%)`,
            },
          },
        });
      });
    },
    maxDensity() {
      return Math.max(...this.populationAreas.map(({ density }) => density));
    },
    areas() {
      return this.populationAreas.map((area) => ({
        ...area,
        opacity: 0.1 + (area.density / this.maxDensity) * 0.4,
      }));
    },
    sportValueZoneOptions() {
      return {
        style: {
          weight: 2,
          color: '#345b28',
          opacity: 0.6,
          fillOpacity: 0,
        },
        interactive: false,
      };
    },
  },
  watch: {
    shardsWithColor: {
      immediate: true,
      handler(value) {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of value) {
          const shardEl = this.shardRefs[item.id];
          if (!shardEl) {
            // eslint-disable-next-line no-continue
            continue;
          }
          shardEl.leafletObject.setStyle(item.options.style);
        }
      },
    },
  },
  methods: {
    setItemRef(el) {
      if (el?.leafletObject?.options) {
        this.shardRefs[el.leafletObject.options.geojson.properties.id] = el;
      }
    },
    selectShard(event, shardId) {
      if (event.latlng) {
        this.$emit('mapClick', {
          point: event.latlng,
          shardId,
        });
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
