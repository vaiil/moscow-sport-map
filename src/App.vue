<template>
  <div class="app">
    <app-map
      :center="center"
      :sport-objects="filteredObjects"
      :population-areas="populationAreas"
    />
    <div class="app__info">
      <v-select
        v-model="filter.owners"
        :options="owners"
        label="title"
        multiple
        placeholder="Ведомство"
      />
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import { objects, owners } from '../test-data/data.json';
import populationAreas from '../test-data/population_areas.json';
import populationValues from '../test-data/population_values.json';
import AppMap from './components/AppMap.vue';

function getRadius(type) {
  switch (+type) {
    case 1:
      return 5000;
    case 2:
      return 3000;
    case 3:
      return 1000;
    case 4:
      return 500;
    default:
      return 10;
  }
}

export default {
  name: 'App',
  components: {
    AppMap,
    vSelect,
  },
  data() {
    return {
      center: [55.78, 37.48],
      filter: {
        owners: [],
      },
    };
  },
  computed: {
    mapObjects() {
      return objects
        // .slice(0, 10)
        .map((item) => ({
          id: item.id,
          center: [+item.lat, +item.lng],
          radius: getRadius(item.valueId),
          ownerId: item.ownerId,
        }));
    },
    filteredObjects() {
      return this.mapObjects.filter((item) => {
        if (this.filter.owners.length > 0) {
          if (!this.filter.owners.some((owner) => owner.id === item.ownerId)) {
            return false;
          }
        }
        return true;
      });
    },
    owners() {
      return Object.entries(owners).map(([id, title]) => ({ id, title }));
    },
    populationAreas() {
      return populationAreas.map((item, index) => (
        {
          ...item,
          population: populationValues[index],
        }
      ));
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
</style>
<style>
.vs__dropdown-option {
  white-space: normal;
}
</style>
