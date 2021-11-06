<template>
  <table class="attributes-table">
    <tbody>
      <tr
        v-for="attribute of attributes"
        :key="attribute.title"
      >
        <td class="attributes-table__label">
          {{ attribute.title }}:
        </td>
        <td class="attributes-table__value">
          {{ attribute.value }}
          <small v-if="attribute.postfix">{{ attribute.postfix }}</small>
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
  width: 100%;
  font-weight: 300;
  font-size: 0.875em;
  line-height: 1em;

  td {
    width: 50%;
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
