<template>
  <div class="object-info">
    <div class="object-info__title">
      {{ object.id }}, {{ object.name }}
    </div>
    <app-attributes-table :attributes="objectAttributes" />
    <div class="object-info__zones-title">
      Зоны
    </div>
    <div
      v-for="zone of zones"
      :key="zone.id"
      class="object-info__zone"
    >
      <div class="object-info__zone-name">
        {{ zone.name }}
      </div>
      <app-attributes-table :attributes="zone.attributes" />
    </div>
  </div>
</template>

<script>
import format from '../helpers/number-format';
import AppAttributesTable from './AppAttributesTable.vue';

export default {
  name: 'AppObjectInfo',
  components: { AppAttributesTable },
  props: {
    object: {
      type: Object,
      required: true,
    },
  },
  computed: {
    objectAttributes() {
      return [
        { title: 'Ведомство', value: this.object.ownerName },
        { title: 'Адрес', value: this.object.address },
        { title: 'Доступность', value: this.object.valueName },
        { title: 'Общая площадь спортивных зон', value: format(this.object.square), postfix: 'м2' },
        { title: 'Оценочное число жителей в области доступности', value: parseInt(this.object.population, 10), postfix: 'человек' },
        { title: 'Площадь спортивных зон на 100 000 человек', value: format((this.object.square / this.object.population) * 100_000), postfix: 'м2' },
      ];
    },
    zones() {
      return this.object.zones.map((zone) => (
        {
          id: zone.id,
          name: zone.zoneName,
          attributes: [
            {
              title: 'Площадь',
              value: zone.square,
              postfix: 'м2',
            },
            {
              title: 'Виды спорта',
              value: zone.sports.join(', '),
            },
          ],
        }
      ));
    },
  },
};
</script>

<style lang="scss">
.object-info {
  &__title, &__zones-title {
    font-size: 1.2em;
    line-height: 1.1;
    margin: 0 0 10px;
  }

  &__zones-title {
    margin-top: 10px;
  }

  &__zone-name {
    font-size: 1em;
    line-height: 1.1;
    margin: 10px 0;
    font-weight: 500;
  }
}
</style>
