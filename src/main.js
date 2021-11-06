import { createApp } from 'vue';
import { Chart, registerables } from 'chart.js';
import App from './App.vue';

createApp(App).mount('#app');

Chart.register(...registerables);
