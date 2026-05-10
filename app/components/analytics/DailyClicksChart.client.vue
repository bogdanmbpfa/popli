<template>
  <div class="analytics-chart">
    <UiChart
      v-if="isDataAvailable"
      id="daily-clicks-chart"
      type="line"
      :data="data"
      :options="options"
    />

    <div v-else-if="!isDataAvailable" class="no-data">
      There is no data to display.
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  ChartData,
  ChartOptions,
  ChartType,
  ScriptableChartContext,
} from 'chart.js';
import { DateTime } from 'luxon';

const props = defineProps({
  clicks: {
    type: Array as PropType<{ date: string; clicks: number }[]>,
    required: true,
  },
  title: {
    type: String,
    required: false,
    default: 'Daily Clicks',
  },
});

const isDataAvailable = computed(() => props.clicks.length > 0);

const data = computed<ChartData<ChartType>>(() => {
  const documentStyle = getComputedStyle(document.documentElement);

  return {
    labels: props.clicks.map((click) =>
      DateTime.fromFormat(click.date, 'yyyy-MM-dd').toFormat('dd.MM'),
    ),
    datasets: [
      {
        data: props.clicks.map((click) => click.clicks),
        borderColor: documentStyle.getPropertyValue('--primary-400'),
        tension: 0.3,
        fill: true,
        pointStyle: false,
        backgroundColor: function (context: ScriptableChartContext) {
          const { ctx, chartArea } = context.chart;

          if (!chartArea) return;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );

          gradient.addColorStop(
            0,
            documentStyle.getPropertyValue('--primary-400'),
          );
          gradient.addColorStop(1, 'transparent');

          return gradient;
        },
      },
    ],
  };
});

const options = computed<ChartOptions<ChartType>>(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColorPrimary = documentStyle.getPropertyValue('--neutral-100');
  const textColorSecondary = documentStyle.getPropertyValue('--neutral-400');

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: props.title,
        color: textColorPrimary,
        position: 'top',
        align: 'start',
        padding: {
          bottom: 16,
        },
        font: {
          size: 16,
          weight: 500,
        },
      },
      tooltip: {
        boxWidth: 0,
        boxHeight: 0,
        backgroundColor: documentStyle.getPropertyValue(
          '--background-tertiary',
        ),
        borderWidth: 1,
        borderColor: documentStyle.getPropertyValue('--neutral-400'),
        padding: 16,
        bodyAlign: 'left',
        titleAlign: 'left',
        titleColor: textColorPrimary,
        titleFont: {
          size: 14,
          weight: 500,
        },
        bodyColor: documentStyle.getPropertyValue('--primary-400'),
        bodyFont: {
          size: 12,
          weight: 400,
        },
        titleMarginBottom: 8,
        usePointStyle: true,
        boxPadding: 0,
        callbacks: {
          title: (context) => {
            const [dataset] = context;
            const date = dataset!.label;

            return `Date: ${date}`;
          },
          label: (context) => {
            return `Total clicks: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: textColorSecondary,
          includeBounds: true,
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          color: textColorSecondary,
        },
        grid: {
          display: false,
        },
      },
    },
  };
});
</script>

<style scoped lang="scss">
.analytics-chart {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  min-height: 20rem;
  background-color: var(--background-primary);
  padding: 1rem;
  border-radius: 0.5rem;

  .no-data {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--neutral-400);
    text-align: center;
  }

  #daily-clicks-chart {
    width: 100%;
    height: 100%;
    max-height: 20rem;
  }

  .free-plan-banner {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;

    .description {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--neutral-400);
      text-align: center;
    }
  }
}
</style>
