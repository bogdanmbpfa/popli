<template>
	<div v-if="dataLoaded" class="map-container">
		<span class="title">
			Country Clicks
		</span>

		<div v-if="!mapError" :id="`map-${props.id}`" />

		<div v-else class="map-error">
			Error loading map. Please check your browser's graphics settings.
		</div>
	</div>
</template>

<script setup lang="ts">
	import mapboxgl from 'mapbox-gl';

	import { EApiEndpoint } from '~/../enums';

	const props = defineProps({
		id: {
			type: String,
			required: true,
		},
	});

	const dataLoaded = ref(false);
	const mapError = ref(false);

	onMounted(async () => {
		const { data, error } = await useApiJson(
			EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS,
			{},
			{},
			{ id: props.id }
		);

		if (error) return;

		dataLoaded.value = true;

		const clickMap = data.reduce((acc, curr) => {
			acc[curr.countryCode] = curr.clicks;
			return acc;
		}, {} as Record<string, number>);

		setTimeout(() => loadMap(clickMap), 1000);
	});

	const loadMap = (mapData: Record<string, number>) => {
		let map: mapboxgl.Map | null = null;

		try {
			map = new mapboxgl.Map({
				container: `map-${props.id}`,
				style: 'mapbox://styles/mapbox/light-v10',
				center: [20, 50],
				zoom: 2,
				accessToken:
					'pk.eyJ1IjoicGhhbnRvbXNvbHV0aW9ucyIsImEiOiJjbHUycmVpcDEwc2c3Mm1ueDdzaDd1dnc1In0.5kltI9awT7ye3s2-m5u1eQ',
			});
		} catch (error) {
			mapError.value = true;

			return;
		}

		map.on('load', () => {
			// Add Mapbox country boundaries source
			map.addSource('countries', {
				type: 'vector',
				url: 'mapbox://mapbox.country-boundaries-v1',
			});

			// Add fill layer
			map.addLayer({
				id: 'country-fills',
				type: 'fill',
				source: 'countries',
				'source-layer': 'country_boundaries',
				paint: {
					'fill-color': [
						'case',
						['has', ['get', 'iso_3166_1'], ['literal', mapData]],
						[
							'interpolate',
							['linear'],
							['get', ['get', 'iso_3166_1'], ['literal', mapData]],
							0,
							'#155dfc',
							500,
							'#9810fa',
							1000,
							'#e60076',
						],
						'#717182', // countries with no clicks
					],
					'fill-opacity': 0.4,
				},
			});

			// Add borders
			map.addLayer({
				id: 'country-borders',
				type: 'line',
				source: 'countries',
				'source-layer': 'country_boundaries',
				paint: {
					'line-color': '#fafafa',
					'line-width': 0.5,
				},
			});

			// Tooltip popup
			const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false });

			map.on('mousemove', 'country-fills', (e) => {
				const feature = e.features?.[0];
				if (!feature) return;

				const code = feature.properties?.iso_3166_1;
				const name = feature.properties?.name_en;
				const clicks = mapData[code as keyof typeof mapData] || 0;

				if (clicks) {
					popup
						.setLngLat(e.lngLat)
						.setHTML(`<strong>${name}</strong><br/>Clicks: ${clicks}`)
						.addTo(map);
				}
			});

			map.on('mouseleave', 'country-fills', () => {
				popup.remove();
			});
		});
	};
</script>

<style lang="scss" scoped>
	.map-container {
		width: 100%;
		height: 100%;
		min-height: 20rem;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.title {
			color: var(--text-100);
			font-size: 0.875rem;
			font-weight: 500;
			text-align: center;
		}

		&:has(.map-error) {
			min-height: unset;
		}

		.map-error {
			color: var(--text-300);
			font-size: 0.75rem;
			font-weight: 500;
			text-align: center;
		}

		:deep(.mapboxgl-map) {
			width: 100%;
			height: 100%;

			.mapboxgl-popup {
				position: absolute;
				top: 0;
				left: 0;
				will-change: transform;
				pointer-events: none;

				.mapboxgl-popup-content {
					background-color: var(--background-1);
					padding: 0.5rem;
					border-radius: 0.5rem;
					font-size: 0.875rem;
					color: var(--text-100);
				}
			}

			.mapboxgl-control-container {
				.mapboxgl-ctrl-bottom-right {
					.mapboxgl-ctrl-attrib {
						.mapboxgl-ctrl-attrib-button {
							display: none;
						}

						.mapboxgl-ctrl-attrib-inner {
							display: flex;
							justify-content: flex-end;
							align-items: center;

							a {
								color: var(--text-100);
								text-decoration: none;
								font-size: 0.875rem;
								font-weight: 500;
								margin-left: 0.5rem;

								&:hover {
									text-decoration: underline;
								}
							}
						}
					}
				}
			}
		}
	}
</style>
