<template>
  <div v-if="data">
    <bar-chart
      :chart-data="data"
      :options="options"
    />
  </div>
</template>

<script>
import { BarChart } from 'vue-chart-3';

export default {
  name: 'AppChart',
  components: {
    BarChart,
  },
  props: {
    sportTypeReport: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      chart: null,
      chartRef: null,
      options: {
        indexAxis: 'y',
        // Elements options apply to all of the options unless overridden in a dataset
        // In this case, we are setting the border of each horizontal bar to be 2px wide
        elements: {
          bar: {
            borderWidth: 2,
          },
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: '10 самых доступных видов спорта',
          },
        },
      },
    };
  },
  computed: {
    sports() {
      return this.sportTypeReport.slice(0, 10);
    },
    data() {
      return {
        labels: this.sports
          .map((row) => row.name),
        datasets: [
          {
            label: 'Площадь по виду спорта',
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            data: this.sports.map((row) => ({
              x: row.realArea,
              y: row.name,
            })),
          },
        ],
      };
    },
  },
};
</script>

<style scoped>

</style>
