<template>
  <div class="app">
    <app-map
      :center="center"
      :sport-objects="filteredObjects"
      :population-areas="populationAreas"
      :point="pointInfo?.point"
      :settings="mapSettings"
      :shards="shards"
      :shard-colors="shardColors"
      :selected-shard="pointInfo?.selectedShard"
      @mapClick="showInfo"
    />
    <div class="app__info">
      <div class="app__heading">
        Выбор слоя
      </div>
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
      <div
        v-if="mapSettings.showValueZones"
        class="app__shard-color-settings"
      >
        <div class="app__filter-field">
          <div class="app__filter-one-line">
            Тепловая карта:
            <v-select
              v-model="colorCalculationSettings.calculateType"
              :options="calculateTypes"
              class="app__filter-field-select"
              label="title"
            />
          </div>
        </div>
        <div class="app__filter-field">
          <label>
            <input
              v-model="colorCalculationSettings.per100k"
              type="checkbox"
            > расчет на 100 000 человек
          </label>
        </div>
        <div class="app__filter-field">
          <label>
            <input
              v-model="colorCalculationSettings.calculateDensity"
              type="checkbox"
            > наложить на карту плотности населения
          </label>
        </div>
        <div class="app__filter-field">
          <label>
            <input
              v-model="colorCalculationSettings.excludeEmpty"
              type="checkbox"
            > исключить нежилые территории
          </label>
        </div>
        <app-gradient-info
          class="app__gradient-info"
          :start-value="shardMinColorValue"
          :end-value="shardMaxColorValue"
        />
      </div>
      <div class="app__heading">
        Поиск и фильтрация
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
      <div v-if="pointInfo">
        <div class="app__heading">
          Информация о пересечении
        </div>
        <AppAttributesTable
          :attributes="commonReport"
          class="app__intersection-attributes"
        />
        <button
          class="app__download"
          @click="downloadXlsxReport"
        >
          <img
            src="@/assets/excel.svg"
            alt=""
          >
          Скачать Excel отчет
        </button>
        <div class="app__chart">
          <AppChart
            v-if="sportTypesReport"
            :key="sportTypesReport"
            :sport-type-report="sportTypesReport"
          />
        </div>
        <div class="app__heading">
          Список объектов
        </div>
        <AppPointInfo
          :point-info="pointInfo"
        />
      </div>
    </div>
  </div>
</template>

<script>
import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import lunr from 'lunr';
import support from 'lunr-languages/lunr.stemmer.support';
import ru from 'lunr-languages/lunr.ru';
import multi from 'lunr-languages/lunr.multi';
import * as turf from '@turf/turf';
import {
  objects, owners, valueTypes, sports, zoneTypes, shards, populations, boundingRegion,
} from '../test-data/data.json';
import AppMap from './components/AppMap.vue';
import AppPointInfo from './components/AppPointInfo.vue';
import AppGradientInfo from './components/AppGradientInfo.vue';
import makeXlsxReport from './services/make-xlsx-report';
import calculateIntersectionIndicators, { calculateKeyIndicators } from './services/calculate-intersection-indicators';
import AppAttributesTable from './components/AppAttributesTable.vue';
import {
  makeCommonIndicators,
  makeCommonReport,
  makeSportTypesReport,
} from './services/report-service';
import AppChart from './components/AppChart.vue';

support(lunr);
ru(lunr);
multi(lunr);

const preparedObjects = objects;

const objectsMap = new Map(preparedObjects.map((item) => [item.id, item]));

const prepareShards = shards.map((shard, index) => ({
  ...shard,
  geoJSON: {
    ...shard.geoJSON,
    properties: {
      id: index + 1,
    },
  },
  id: index + 1,
}));

const MIN_HUE = 240;
const MAX_HUE = 0;

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

const calculateTypes = [
  {
    key: 'square',
    title: 'По площади, м2',
  },
  {
    key: 'sport_count',
    title: 'По кол-ву видов спорта, шт',
  },
  {
    key: 'zone_type_count',
    title: 'По кол-ву зон, шт',
  },
];

export default {
  name: 'App',
  components: {
    AppAttributesTable,
    AppGradientInfo,
    AppPointInfo,
    AppMap,
    AppChart,
    vSelect,
  },
  data() {
    return {
      center: [55.78, 37.48],
      pointInfo: null,
      search: '',
      calculateTypes,
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
      colorCalculationSettings: {
        per100k: false,
        calculateDensity: false,
        excludeEmpty: false,
        calculateType: calculateTypes[0],
      },
      selectedArea: null,
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
      return this.mapObjects
        .filter((item) => {
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
            if (!this.filter.sports.some((sport) => item.sports.includes(sport))) {
              return false;
            }
          }
          if (this.filter.zoneTypes.length > 0) {
            if (!this.filter.zoneTypes.some((zoneType) => item.zoneTypes.includes(zoneType))) {
              return false;
            }
          }
          return true;
        })
        .map((object) => {
          if (this.filter.sports.length === 0 && this.filter.zoneTypes.length === 0) {
            return object;
          }
          const zones = object.zones.filter((zone) => {
            if (this.filter.sports.length > 0) {
              if (!this.filter.sports.some((sport) => zone.sports.includes(sport))) {
                return false;
              }
            }
            if (this.filter.zoneTypes.length > 0) {
              if (!this.filter.zoneTypes.includes(zone.zoneType)) {
                return false;
              }
            }
            return true;
          });
          const square = zones.reduce((sum, zone) => sum + zone.square, 0);
          return {
            ...object,
            zones,
            square,
          };
        });
    },
    owners() {
      return owners;
    },
    valueTypes() {
      return valueTypes;
    },
    zoneTypes() {
      return zoneTypes;
    },
    sports() {
      return sports;
    },
    shards() {
      const filteredObjectsMap = new Map(this.filteredObjects.map((object) => [object.id, object]));

      return prepareShards
        .map((shard) => {
          const shardObjects = shard.objects.filter((id) => filteredObjectsMap.has(id));
          return ({
            ...shard,
            empty: shard.objects.some((id) => filteredObjectsMap.has(id)),
            key: `${shardObjects.join('-')}-${shard.populationId}`,
            indicators: calculateKeyIndicators(shardObjects
              .map((id) => filteredObjectsMap.get(id))),
            objects: shardObjects,
          });
        });
    },
    shardColorValues() {
      return this.shards.map((shard) => this.calculateValueForColor(shard));
    },
    shardMinColorValue() {
      return Math.min(...this.shardColorValues);
    },
    shardMaxColorValue() {
      return Math.max(...this.shardColorValues.filter((item) => Number.isFinite(item)));
    },
    shardColors() {
      const len = this.shardMaxColorValue - this.shardMinColorValue;
      const hueDiff = (MAX_HUE - MIN_HUE);
      return this.shardColorValues.map(
        (value) => MIN_HUE + ((value - this.shardMinColorValue) / len) * hueDiff,
      );
    },
    populationAreas() {
      return Array.from(Object.values(populations));
    },
    indicators() {
      return this.pointInfo ? calculateIntersectionIndicators(this.pointInfo) : null;
    },
    commonReport() {
      return [
        ...makeCommonReport(this.indicators),
        ...makeCommonIndicators(this.indicators).map(({
          title, value, postfix, valuePer100k,
        }) => [
          {
            title,
            value,
            postfix,
          },
          {
            title: `${title} на 100 000 человек`,
            value: valuePer100k,
            postfix,
          },
        ]).flat(),
      ];
    },
    sportTypesReport() {
      return makeSportTypesReport(this.indicators);
    },
  },
  watch: {
    filter: {
      handler() {
        this.pointInfo = null;
      },
      deep: true,
    },
    'mapSettings.showValueZones': function () {
      this.pointInfo = null;
    },
  },
  methods: {
    showInfo({ point, shardId }) {
      const shard = this.shards.find(({ id }) => id === shardId);

      let geoJSON = boundingRegion;
      const firstObject = objectsMap.get(shard.objects[0]);
      geoJSON = shard.objects
        .reduce(
          (result, id) => turf.intersect(
            result, objectsMap.get(id).geoJSON,
          ),
          geoJSON,
        );

      if (shard.populationId !== null) {
        if (!geoJSON) {
          geoJSON = populations[shard.populationId].geoJSON;
        } else {
          geoJSON = turf.intersect(geoJSON, populations[shard.populationId].geoJSON);
        }
      } else {
        geoJSON = Array.from(Object.values(populations))
          .reduce((result, population) => turf.difference(result, population.geoJSON), geoJSON);
      }

      const excludes = this.filteredObjects.filter(({
        id, radius, lat, lng,
      }) => !shard.objects.includes(id)
        && (!firstObject || turf.distance([lng, lat], [firstObject.lng, firstObject.lat], {
          units: 'meters',
        })
        < (radius + firstObject.radius)));

      if (excludes.length) {
        const excludeRegion = excludes
          .reduce(
            (result, exclude) => turf.union(result, exclude.geoJSON),
            excludes[0].geoJSON,
          );
        if (excludeRegion) {
          geoJSON = turf.difference(geoJSON, excludeRegion);
        }
      }

      const collection = turf.flatten(geoJSON);

      const selectedShard = collection.features
        .find((feature) => turf.booleanPointInPolygon([point.lng, point.lat], feature));

      this.pointInfo = {
        point,
        selectedShard,
        area: selectedShard ? turf.area(selectedShard) : null,
        nearObjects: this.filteredObjects.filter(({ id }) => shard.objects.includes(id)),
        populationArea: shard.populationId !== null ? populations[shard.populationId] : null,
      };
    },
    calculateValueForColor(shard) {
      if (
        (
          this.colorCalculationSettings.excludeEmpty
          || this.colorCalculationSettings.calculateDensity
        )
        && !shard.density) {
        return Infinity;
      }
      let value = 0;
      const report = this.colorCalculationSettings.per100k
        ? shard.indicators.per100kReport : shard.indicators.report;
      switch (this.colorCalculationSettings.calculateType.key) {
        case 'sport_count':
          value = report.sportTypeCount;
          break;
        case 'zone_type_count':
          value = report.zoneCount;
          break;
        case 'square':
        default:
          value = report.sportObjectArea;
          break;
      }
      if (this.colorCalculationSettings.calculateDensity) {
        value /= shard.density;
      }
      return value;
    },
    downloadXlsxReport() {
      if (this.indicators && this.pointInfo) {
        makeXlsxReport({ indicators: this.indicators, nearObjects: this.pointInfo.nearObjects });
      }
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

.leaflet-container {
  font-family: 'Roboto', sans-serif;
}

button {
  position: relative;
  font-family: inherit;
  cursor: pointer;
  &:hover {
    box-shadow: 0 2px 4px #ccc;
  }
}

.app {
  display: flex;
  height: 100vh;

  &__gradient-info {
    margin-top: 20px;
  }
  &__shard-color-settings {
    margin-top: 20px;
  }

  &__heading {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 24px;
    line-height: 28px;
  }

  &__filter-search {
    display: block;
    margin-top: 10px;
    padding: 10px;
    width: 100%;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid rgba(60, 60, 60, .26);
  }

  &__info {
    width: 600px;
    padding: 20px;
    overflow: auto;
  }
  &__filter-field {
    margin-top: 10px;
  }

  &__filter-one-line {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  &__filter-field-select {
    flex: 1
  }

  &__toggle-bar {
    display: flex;
    gap: 10px;
  }

  &__toggle-btn {
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

  &__download {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    gap: 20px;
    padding: 10px 20px;
    font-size: 14px;
    line-height: 16px;
    background: #F7F7F7;
    border: solid 1px #338b1d;
    border-radius: 8px;
  }
}
</style>
<style>
.vs__dropdown-toggle {
  min-height: 40px;
}
.vs__dropdown-option {
  white-space: normal;
}
</style>
