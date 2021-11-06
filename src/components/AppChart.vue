<template>
  <div
    v-if="data"
    class="chart"
  >
    <bar-chart
      :chart-data="data"
      :options="options"
    />
    <div class="chart__field">
      <label>
        <input
          v-model="per100k"
          type="checkbox"
        > расчет на 100 000 человек
      </label>
    </div>
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
      per100k: false,
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
      return this.sportTypeReport
        .map((item) => {
          const value = this.per100k ? item.per100k.realArea : item.realArea;
          return {
            value,
            name: item.name,
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
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
              x: row.value,
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
.chart__field {
  text-align: center;
  font-size: 14px;
  font-weight: 300;
}
</style>
