<template>
  <div class="app">
    <app-map
      :center="center"
      :sport-objects="filteredObjects"
      :population-areas="populationAreas"
      :point="point"
      :settings="mapSettings"
      :shards="shards"
      @mapClick="showInfo"
    />
    <div class="app__info">
      <div class="app__toggle-bar">
        <button
          class="app__toggle-btn"
          :class="{'app__toggle-btn_active': mapSettings.showPopulation}"
          @click="mapSettings.showPopulation = !mapSettings.showPopulation"
        >
          Население
        </button>
        <button
          class="app__toggle-btn"

          :class="{'app__toggle-btn_active': mapSettings.showMarkers}"
          @click="mapSettings.showMarkers = !mapSettings.showMarkers"
        >
          Объекты
        </button>
        <button
          class="app__toggle-btn"
          :class="{'app__toggle-btn_active': mapSettings.showValueZones}"
          @click="mapSettings.showValueZones = !mapSettings.showValueZones"
        >
          Доступность
        </button>
      </div>
      <input
        v-model="search"
        class="app__filter-search"
        type="search"
        placeholder="Поиск (по названию объекта или зоны, адресу)"
      >
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
import lunr from 'lunr';
import support from 'lunr-languages/lunr.stemmer.support';
import ru from 'lunr-languages/lunr.ru';
import multi from 'lunr-languages/lunr.multi';
import {
  objects, owners, valueTypes, sports, zoneTypes, shards,
} from '../test-data/data.json';
import populationAreas from '../test-data/population_areas.json';
import AppMap from './components/AppMap.vue';
import AppPointInfo from './components/AppPointInfo.vue';
import isMarkerInsidePolygon from './isPointInPolygon';

support(lunr);
ru(lunr);
multi(lunr);

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

const preparedObjects = objects.map((object) => {
  const center = [+object.lat, +object.lng];
  return (Object.freeze({
    ...object,
    center,
    radius: getRadius(object.valueId),
    square: object.zones.reduce((sum, zone) => sum + zone.square, 0),
    sports: new Set(object.zones.map((zone) => zone.sports)
      .flat()),
    zoneTypes: new Set(object.zones.map(({ zoneType }) => zoneType)),
  }));
});

const objectsMap = new Map(preparedObjects.map((item) => [item.id, item]));

const prepareShards = shards.map((shard, index) => ({
  ...shard,
  geoJSON: {
    ...shard.geoJSON,
    properties: {
      id: index,
    },
  },
  id: index,
}));

const searchIndex = lunr(function createIndex() {
  this.use(lunr.multiLanguage('en', 'ru'));
  this.ref('id');
  this.field('name');
  this.field('address');
  this.field('zones');

  preparedObjects.forEach(({
    id,
    name,
    address,
    zones,
  }) => {
    this.add({
      id,
      name,
      address,
      zones: zones.map(({ zoneName }) => zoneName)
        .join(' '),
    });
  });
});

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
      search: '',
      filter: {
        owners: [],
        valueTypes: [],
        zoneTypes: [],
        sports: [],
      },
      mapSettings: {
        showPopulation: false,
        showMarkers: true,
        showValueZones: false,
      },
    };
  },
  computed: {
    mapObjects() {
      return preparedObjects;
      // .slice(0, 10);
    },
    searchQuery() {
      return this.search ? this.search
        .replace(/[,.]/g, ' ')
        .split(' ')
        .filter((s) => s.length > 0)
        .map((item) => `+${item}~2`)
        .join(' ') : null;
    },
    searchResults() {
      if (!this.searchQuery) {
        return null;
      }
      const searchedItems = searchIndex.search(this.searchQuery);
      return new Set(searchedItems.map(({ ref }) => ref));
    },
    filteredObjects() {
      return this.mapObjects.filter((item) => {
        if (this.searchResults) {
          if (!this.searchResults.has(item.id)) {
            return false;
          }
        }
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
      return Object.entries(owners)
        .map(([id, title]) => ({
          id,
          title,
        }));
    },
    valueTypes() {
      return Object.entries(valueTypes)
        .map(([id, title]) => ({
          id,
          title,
        }));
    },
    zoneTypes() {
      return zoneTypes;
    },
    sports() {
      return sports;
    },
    shards() {
      const objectIds = new Set(this.filteredObjects.map(({ id }) => id));

      return prepareShards
        .filter((shard) => shard.objects.some((id) => objectIds.has(id)))
        .map((shard) => {
          const shardObjects = shard.objects.filter((id) => objectIds.has(id));
          const excludes = shard.excludes.filter((id) => objectIds.has(id));
          return ({
            ...shard,
            key: `${shard.id}-${shardObjects.join('-')}-${shard.populationId}`,
            objects: shardObjects,
            excludes,
            square: shardObjects
              .reduce((s, objectId) => s + objectsMap.get(objectId).square, 0),
          });
        });
    },
    // shards() {
    //   const objectIds = new Set(this.filteredObjects.map(({ id }) => id));
    //
    //   const filteredShards = prepareShards
    //     .filter((shard) => shard.objects.some((id) => objectIds.has(id)))
    //     .map((shard) => {
    //       const shardObjects = shard.objects.filter((id) => objectIds.has(id));
    //       const excludes = shard.excludes.filter((id) => objectIds.has(id));
    //       return ({
    //         ...shard,
    //         key: `${shardObjects.join('-')}-${shard.populationId}`,
    //         objects: shardObjects,
    //         excludes,
    //         square: shardObjects
    //           .reduce((s, objectId) => s + objectsMap.get(objectId).square, 0),
    //       });
    //     })
    //     .filter(({ density }) => density > 0);
    //
    //   const shardMap = {};
    //   // eslint-disable-next-line no-restricted-syntax
    //   for (const shard of filteredShards) {
    //     if (shardMap[shard.key]) {
    //       shardMap[shard.key].excludes.push(...shard.excludes);
    //     } else {
    //       shardMap[shard.key] = shard;
    //     }
    //   }
    //   console.log(shardMap);
    //   return Array.from(Object.values(shardMap)).map((item) => {
    //     let geoJSON = item.objects.reduce((result, id) => turf.intersect(
    //       result, objectsMap.get(id).geoJSON,
    //     ),
    //     objectsMap.get(item.objects[0]).geoJSON);
    //
    //     if (item.populationId !== null) {
    //       geoJSON = turf.intersect(geoJSON, populations[item.populationId].geoJSON);
    //     }
    //     if (item.excludes.length) {
    //       const excludes = Array.from(new Set(item.excludes));
    //
    //       const exclude = Array.from(new Set(item.excludes))
    //         .reduce(
    //           (result, excludeId) => turf.union(result, objectsMap.get(excludeId).geoJSON),
    //           objectsMap.get(excludes[0]).geoJSON,
    //         );
    //
    //       geoJSON = turf.difference(geoJSON, exclude);
    //     }
    //
    //     return ({
    //       ...item,
    //       geoJSON,
    //     });
    //   });
    // },
    populationAreas() {
      return populationAreas.map((item) => {
        const points = item.geometry.coordinates[0].map(([lng, lat]) => ({
          lat,
          lng,
        }));
        const square = L.GeometryUtil.geodesicArea(points);
        const { population } = item.properties;
        const density = population / square;

        return Object.freeze({
          id: item.id,
          points,
          square,
          population,
          density,
        });
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
    pointPopulation() {
      if (!this.point) {
        return null;
      }
      return this.populationAreas.find(
        (populationArea) => isMarkerInsidePolygon(this.point, populationArea.points),
      );
    },
    pointInfo() {
      if (!this.point) {
        return null;
      }
      return {
        point: this.point,
        nearObjects: this.nearObjects,
        populationArea: this.pointPopulation,
        area: null,
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
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap');
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
}

.app {
  display: flex;
  height: 100vh;
}

.app__filter-search {
  display: block;
  margin-top: 10px;
  padding: 10px;
  width: 100%;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid rgba(60, 60, 60, .26);
}

.app__info {
  width: 600px;
  padding: 20px;
  overflow: auto;
}

.app__filter-field {
  margin-top: 10px;
}

.app__toggle-bar {
  display: flex;
  gap: 10px;
}

.app__toggle-btn {
  flex: 1;
  padding: 10px;
  border: solid 1px #aaa;
  border-radius: 4px;
  background: #ffd5db;
  cursor: pointer;

  &_active {
    background: #b9ffb9;
  }
}
</style>
<style>
.vs__dropdown-option {
  white-space: normal;
}
</style>
