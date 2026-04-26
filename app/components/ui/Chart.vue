<template>
  <div class="ui-chart">
    <canvas ref="canvasRef" />
  </div>
</template>

<script setup lang="ts">
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartConfiguration,
  type ChartData,
  type ChartOptions,
  type ChartType,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarController,
  LineController,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type TChartData = ChartData<ChartType>;
type TChartOptions = ChartOptions<ChartType>;

const props = withDefaults(
  defineProps<{
    type?: ChartType;
    data?: TChartData;
    options?: TChartOptions;
  }>(),
  {
    type: 'bar',
    data: () => ({ datasets: [] } as TChartData),
    options: () => ({} as TChartOptions),
  },
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: ChartJS<ChartType> | null = null;

const destroyChart = () => {
  if (!chartInstance) return;
  chartInstance.destroy();
  chartInstance = null;
};

const createChart = () => {
  if (!canvasRef.value) return;

  const config: ChartConfiguration<ChartType> = {
    type: props.type,
    data: props.data,
    options: props.options,
  };

  chartInstance = new ChartJS(canvasRef.value, config);
};

const renderChart = () => {
  destroyChart();
  createChart();
};

onMounted(renderChart);

watch(
  () => [props.type, props.data, props.options],
  () => {
    renderChart();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  destroyChart();
});
</script>

<style scoped lang="scss">
.ui-chart {
  overflow: hidden;

  canvas {
    width: 100%;
    height: auto;
    display: block;
  }
}
</style>
