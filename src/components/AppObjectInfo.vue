<template>
  <div class="object-info">
    <div class="object-info__title">
      {{ object.id }}, {{ object.name }}
    </div>
    <div class="object-info__attribute">
      <b>Ведомство:</b> {{ object.ownerName }}
    </div>
    <div class="object-info__attribute">
      <b>Адрес:</b> {{ object.address }}
    </div>
    <div class="object-info__attribute">
      <b>Доступность:</b> {{ object.valueName }}
    </div>
    <div class="object-info__attribute">
      <b>Общая площадь спортивных зон:</b> {{ object.square }}
    </div>
    <div class="object-info__zones-title">
      Зоны
    </div>
    <div
      v-for="zone of object.zones"
      :key="zone.id"
      class="object-info__zone"
    >
      <div class="object-info__zone-name">
        {{ zone.zoneName }}
      </div>
      <div class="object-info__zone-square">
        <b>Площадь:</b> {{ zone.square }}, <b>тип:</b> {{ zone.zoneType }}
      </div>
      <div class="object-info__zone-square">
        <b>Виды спорта:</b> {{ zone.sports.join(', ') }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppObjectInfo',
  props: {
    object: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.object-info {
  &__title {
    font-size: 1.3em;
    line-height: 1.1;
    margin: 0 0 10px;
    font-weight: bold;
  }

  &__adress {
    //
  }

  &__zones-title {
    font-size: 1.2em;
    line-height: 1.1;
    margin: 20px 0 10px;
    font-weight: bold;
  }

  &__zone-name {
    font-size: 1em;
    line-height: 1.1;
    margin: 10px 0;
    font-weight: bold;
  }
}
</style>
