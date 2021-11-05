<template>
  <table class="attributes-table">
    <tbody>
      <tr
        v-for="attribute of attributes"
        :key="attribute.name"
      >
        <td class="attributes-table__label">
          {{ attribute.name }}
        </td>
        <td class="attributes-table__value">
          {{ attribute.value }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'AppAttributesTable',
  props: {
    attributes: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style lang="scss">
.attributes-table {
  font-weight: 300;
  font-size: 14px;
  line-height: 16px;

  td {
    padding: 2px 2px 2px 0;
    border: 0;
    vertical-align: top;
  }

  &__value {
    color: #1A237E;
    font-weight: 500;
  }
}
</style>
