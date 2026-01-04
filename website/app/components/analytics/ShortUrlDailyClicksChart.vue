<template>
	<div class="analytics-chart">
		<div class="header">
			<span class="title">Daily Clicks</span>

			<PButton class="default" icon="pi pi-refresh" @click="getChartData" />
		</div>

		<PChart v-if="data" type="line" :data="data" :options="options" />

		<div v-else class="no-data">
			There is no data to display.
		</div>
	</div>
</template>

<script setup lang="ts">
	import { DateTime } from 'luxon';

	import { EApiEndpoint } from '~/../enums';

	const props = defineProps({
		id: {
			type: String,
			required: true,
		},
	});

	const options = ref();
	const data = ref();

	onMounted(async () => {
		const documentStyle = getComputedStyle(document.documentElement);
		const textColorSecondary = documentStyle.getPropertyValue('--text-300');
		const border = documentStyle.getPropertyValue('--border-1');

		options.value = {
			maintainAspectRatio: false,
			aspectRatio: 0.6,
			plugins: {
				legend: { display: false },
				tooltip: {
					boxWidth: 0,
					boxHeight: 0,
				},
			},
			scales: {
				x: {
					ticks: {
						color: textColorSecondary,
					},
					grid: {
						color: border,
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

		await getChartData();
	});

	const getChartData = async () => {
		const documentStyle = getComputedStyle(document.documentElement);

		const { data: shortUrlDailyClicks, error } = await useApiJson(
			EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS,
			{},
			{},
			{ id: props.id }
		);

		if (error || !shortUrlDailyClicks || !shortUrlDailyClicks.length) return;

		data.value = {
			labels: shortUrlDailyClicks.map((click) =>
				DateTime.fromFormat(click.date, 'yyyy-MM-dd').toFormat('MMM d')
			),
			datasets: [
				{
					data: shortUrlDailyClicks.map((click) => click.clicks),
					fill: false,
					borderColor: documentStyle.getPropertyValue('--color-blue-500'),
					tension: 0.4,
				},
			],
		};
	};
</script>

<style scoped lang="scss">
	.analytics-chart {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.header {
			display: flex;
			justify-content: center;
			align-items: center;
			position: relative;
			width: 100%;

			.title {
				font-size: 0.875rem;
				font-weight: 500;
				color: var(--text-100);
			}

			:deep(.p-button) {
				position: absolute !important;
				right: 1rem;
				top: 0;
			}
		}

		.no-data {
			font-size: 0.75rem;
			font-weight: 400;
			color: var(--text-300);
			text-align: center;
		}
	}
</style>
