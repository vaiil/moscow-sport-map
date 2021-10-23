<template>
  <div class="app">
    <app-map
      :center="center"
      :sport-objects="filteredObjects"
      :population-areas="populationAreas"
      @mapClick="showInfo"
    />
    <div class="app__info">
      <v-select
        v-model="filter.owners"
        class="app__filter-field"
        :options="owners"
        label="title"
        multiple
        placeholder="Ведомство"
      />
      <v-select
        v-model="filter.valueTypes"
        class="app__filter-field"
        :options="valueTypes"
        label="title"
        multiple
        placeholder="Доступность"
      />
      <v-select
        v-model="filter.sports"
        class="app__filter-field"
        :options="sports"
        label="title"
        multiple
        placeholder="Виды спорта"
      />
      <v-select
        v-model="filter.zoneTypes"
        class="app__filter-field"
        :options="zoneTypes"
        label="title"
        multiple
        placeholder="Виды зон"
      />
      <hr>
      <AppPointInfo
        v-if="pointInfo"
        :point-info="pointInfo"
      />
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import L from 'leaflet';
import {
  objects, owners, valueTypes, sports, zoneTypes,
} from '../test-data/data.json';
import populationAreas from '../test-data/population_areas.json';
import populationValues from '../test-data/population_values.json';
import AppMap from './components/AppMap.vue';
import AppPointInfo from './components/AppPointInfo.vue';

function getRadius(type) {
  switch (+type) {
    case 1:
      return 5000;
    case 2:
      return 3000;
    case 3:
      return 1000;
    case 4:
      return 200;
    default:
      return 10;
  }
}

const preparedObjects = objects.map((object) => ({
  ...object,
  center: [+object.lat, +object.lng],
  radius: getRadius(object.valueId),
  square: object.zones.reduce((sum, zone) => sum + zone.square, 0),
  sports: new Set(object.zones.map((zone) => zone.sports).flat()),
  zoneTypes: new Set(object.zones.map(({ zoneType }) => zoneType)),
}));

export default {
  name: 'App',
  components: {
    AppPointInfo,
    AppMap,
    vSelect,
  },
  data() {
    return {
      center: [55.78, 37.48],
      point: null,
      filter: {
        owners: [],
        valueTypes: [],
        zoneTypes: [],
        sports: [],
      },
    };
  },
  computed: {
    mapObjects() {
      return preparedObjects;
      // .slice(0, 10);
    },
    filteredObjects() {
      return this.mapObjects.filter((item) => {
        if (this.filter.owners.length > 0) {
          if (!this.filter.owners.some((owner) => owner.id === item.ownerId)) {
            return false;
          }
        }
        if (this.filter.valueTypes.length > 0) {
          if (!this.filter.valueTypes.some((valueType) => valueType.id === item.valueId)) {
            return false;
          }
        }
        if (this.filter.sports.length > 0) {
          if (!this.filter.sports.some((sport) => item.sports.has(sport))) {
            return false;
          }
        }
        if (this.filter.zoneTypes.length > 0) {
          if (!this.filter.zoneTypes.some((zoneType) => item.zoneTypes.has(zoneType))) {
            return false;
          }
        }
        return true;
      });
    },
    owners() {
      return Object.entries(owners).map(([id, title]) => ({ id, title }));
    },
    valueTypes() {
      return Object.entries(valueTypes).map(([id, title]) => ({ id, title }));
    },
    zoneTypes() {
      return zoneTypes;
    },
    sports() {
      return sports;
    },
    populationAreas() {
      return populationAreas.map((item, index) => {
        const points = item.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng }));
        const square = L.GeometryUtil.geodesicArea(points);
        const population = populationValues[index];
        const density = population / square;

        return {
          id: item.id,
          points,
          square,
          population,
          density,
        };
      });
    },
    nearObjects() {
      if (!this.point) {
        return [];
      }
      return this.filteredObjects.filter(
        (object) => L.GeometryUtil.length([this.point, object.center]) < object.radius,
      );
    },
    pointInfo() {
      if (!this.point) {
        return null;
      }
      return {
        point: this.point,
        nearObjects: this.nearObjects,
      };
    },
  },
  methods: {
    showInfo(e) {
      this.point = e.latlng;
    },
  },
};
</script>

<style lang="scss">
body {
  margin: 0;
}

.app {
  display: flex;
  height: 100vh;
}

.app__info {
  width: 600px;
  padding: 20px;
  overflow: auto;
}
.app__filter-field {
  margin-top: 10px;
}
</style>
<style>
.vs__dropdown-option {
  white-space: normal;
}
</style>
