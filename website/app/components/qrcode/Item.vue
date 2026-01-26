<template>
  <div v-if="qrCode" class="qrcode-item">
    <div :id="`qr-code-canvas-${qrCode.id}`" class="qr-code-canvas" />

    <div class="content">
      <div class="info">
        <span class="title">
          {{ qrCode.title }}
        </span>

        <span class="data">
          {{ qrCode.options.data }}
        </span>

        <span class="scans-date">
          Scans: {{ qrCode.totalScans }} • {{ formatDate(qrCode.createdAt) }}
        </span>
      </div>

      <div class="actions">
        <PButton
          class="default"
          icon="pi pi-eye"
          title="View"
          @click="openViewCodeDrawer"
        />

        <PButton
          class="default"
          icon="pi pi-chart-bar"
          title="Analytics"
          @click="openAnalyticsDrawer"
        />

        <PButton
          class="default"
          severity="danger"
          icon="pi pi-trash"
          title="Delete"
          @click="handleDeleteQrCode"
        />
      </div>
    </div>

    <BottomDrawer v-model="viewCodeDrawerVisible">
      <div class="view-code-drawer">
        <div class="qr-code-container">
          <div
            :id="`large-qr-code-canvas-${qrCode.id}`"
            :style="`width: ${qrCode.options.width}px; height: ${qrCode.options.height}px;`"
          />
        </div>

        <div class="info">
          <span class="title">
            {{ qrCode.title }}
          </span>

          <span class="data">
            {{ qrCode.options.data }}
          </span>

          <span class="scans-date">
            Scans: {{ qrCode.totalScans }} • {{ formatDate(qrCode.createdAt) }}
          </span>
        </div>

        <div class="actions">
          <PButton
            class="default"
            severity="contrast"
            icon="pi pi-download"
            label="Download PNG"
            fluid
            @click="downloadCode('png')"
          />
          <PButton
            class="default"
            severity="contrast"
            icon="pi pi-download"
            label="Download SVG"
            fluid
            @click="downloadCode('svg')"
          />
        </div>
      </div>
    </BottomDrawer>

    <BottomDrawer v-model="analyticsDrawerVisible">
      <div v-if="analytics" class="analytics-drawer">
        <div class="analytics-container">
          <div class="analytics-header">
            <span class="title"> Analytics </span>
          </div>

          <div class="analytics-content">
            <div class="scans">
              <div class="scans-container">
                <span class="label"> Scans </span>
                <span class="value">
                  {{ analytics.totalScans }}
                </span>
              </div>

              <div class="scans-container">
                <span class="label"> Countries </span>
                <span class="value">
                  {{ analytics.totalCountries }}
                </span>
              </div>

              <div class="scans-container">
                <span class="label"> Avg. per Country </span>
                <span class="value">
                  {{ analytics.averageScansPerCountry }}
                </span>
              </div>
            </div>

            <div class="map-container">
              <div class="map-wrapper">
                <div v-if="!mapError" :id="`map-${props.qrCode.id}`" />

                <div v-else class="map-error">
                  Error loading map. Please check your browser's graphics
                  settings.
                </div>
              </div>
            </div>

            <div class="chart-container">
              <PChart
                v-if="chartData"
                type="bar"
                :data="chartData"
                :options="chartOptions"
              />

              <div v-else class="no-data">There is no data to display.</div>
            </div>
          </div>
        </div>
      </div>
    </BottomDrawer>
  </div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';
import QRCodeStyling from 'qr-code-styling';

import { EApiEndpoint, EQRCodeDataType } from '~~/enums';
import type { IQrCode, IQrCodeAnalytics } from '~~/interfaces';

const props = defineProps<{
  qrCode: IQrCode;
}>();

const emit = defineEmits<{
  (e: 'delete', id: string): void;
}>();

const qrCodeStyling = ref<QRCodeStyling | null>(null);
const largeQrCodeStyling = ref<QRCodeStyling | null>(null);
const viewCodeDrawerVisible = ref(false);
const analyticsDrawerVisible = ref(false);
const analytics = ref<IQrCodeAnalytics | null>(null);
const mapError = ref(false);
const chartData = ref();
const chartOptions = ref();

const computedData = computed(() => {
  if (!props.qrCode.options.data) return '';

  switch (props.qrCode.dataType) {
    case EQRCodeDataType.TEXT:
      return props.qrCode.options.data;
    case EQRCodeDataType.URL:
      return new URL(props.qrCode.options.data).href;
    case EQRCodeDataType.EMAIL:
      return `mailto:${props.qrCode.options.data}`;
    case EQRCodeDataType.PHONE:
      return `tel:${props.qrCode.options.data}`;
    default:
      return props.qrCode.options.data;
  }
});

onMounted(() => {
  qrCodeStyling.value = new QRCodeStyling({
    ...props.qrCode.options,
    data: computedData.value,
    height: 128,
    width: 128,
    image: props.qrCode.imageUrl ?? undefined,
  });
  qrCodeStyling.value?.append(
    document.getElementById(`qr-code-canvas-${props.qrCode.id}`) as HTMLElement,
  );
});

const openViewCodeDrawer = () => {
  viewCodeDrawerVisible.value = true;

  setTimeout(() => {
    const largeQrCodeCanvas = document.getElementById(
      `large-qr-code-canvas-${props.qrCode.id}`,
    ) as HTMLElement;
    largeQrCodeStyling.value = new QRCodeStyling({
      ...props.qrCode.options,
      data: computedData.value,
      image: props.qrCode.imageUrl ?? undefined,
    });
    largeQrCodeStyling.value?.append(largeQrCodeCanvas);
  }, 300);
};

const loadMap = () => {
  let map: mapboxgl.Map | null = null;

  try {
    map = new mapboxgl.Map({
      container: `map-${props.qrCode.id}`,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [20, 50],

      zoom: 2,
      accessToken:
        'pk.eyJ1IjoicGhhbnRvbXNvbHV0aW9ucyIsImEiOiJjbHUycmVpcDEwc2c3Mm1ueDdzaDd1dnc1In0.5kltI9awT7ye3s2-m5u1eQ',
    });
  } catch {
    mapError.value = true;
    return;
  }

  const mapData = analytics.value!.countryDistribution.reduce((acc, curr) => {
    acc[curr.countryCode] = curr.totalScans;
    return acc;
  }, {} as Record<string, number>);

  map.on('load', () => {
    mapError.value = false;

    map.addSource('countries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
    });

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
          ],
          '#717182',
        ],
        'fill-opacity': 0.4,
      },
    });

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

    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    map.on('mousemove', 'country-fills', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const code = feature.properties?.iso_3166_1;
      const name = feature.properties?.name_en;
      const clicks = mapData[code as keyof typeof mapData] || 0;

      if (clicks) {
        popup
          .setLngLat(e.lngLat)
          .setHTML(`<strong>${name}</strong><br/>Scans: ${clicks}`)
          .addTo(map);
      }
    });

    map.on('mouseleave', 'country-fills', () => {
      popup.remove();
    });
  });
};

const downloadCode = async (type: 'png' | 'svg') => {
  if (!largeQrCodeStyling.value) return;

  await largeQrCodeStyling.value.download({
    name: props.qrCode.title,
    extension: type,
  });
};

const computeChartData = async () => {
  if (!analytics.value) return;

  const documentStyle = getComputedStyle(document.documentElement);
  const textColorSecondary = documentStyle.getPropertyValue('--text-300');
  const border = documentStyle.getPropertyValue('--border-1');

  chartOptions.value = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    barThickness: 20,
    borderRadius: 5,
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

  chartData.value = {
    labels: analytics.value!.countryDistribution.map(
      (country) => country.country,
    ),
    datasets: [
      {
        data: analytics.value!.countryDistribution.map(
          (country) => country.totalScans,
        ),
        borderColor: documentStyle.getPropertyValue('--color-purple-900'),
        backgroundColor: documentStyle.getPropertyValue('--color-purple-900'),
      },
    ],
  };
};

const openAnalyticsDrawer = async () => {
  analyticsDrawerVisible.value = true;

  const { data, error } = await useApiJson(
    EApiEndpoint.QR_CODE_ANALYTICS,
    {},
    {},
    {
      id: props.qrCode.id,
    },
  );

  if (error) {
    analyticsDrawerVisible.value = false;
    return;
  }

  analytics.value = data as IQrCodeAnalytics;

  setTimeout(() => {
    loadMap();
    computeChartData();
  }, 300);
};

const handleDeleteQrCode = async () => emit('delete', props.qrCode.id);
</script>

<style lang="scss" scoped>
@use '../../assets/mixins.scss' as *;

.qrcode-item {
  display: flex;
  gap: 1rem;
  @include squircle(1.5rem);
  background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
  border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
  padding: 1rem;

  .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    overflow: hidden;

    .info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-wrap: pretty;

      .title {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--color-neutral-100);
      }

      .data,
      .scans-date {
        font-size: 1rem;
        font-weight: 400;
        color: var(--color-neutral-400);
      }

      .scans-date {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
      }
    }

    .actions {
      display: flex;
      flex-direction: row;
      gap: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .qrcode-item {
    .content {
      flex-direction: column-reverse;
      justify-content: flex-end;
      gap: 0.5rem;

      .info {
        flex: 1;

        .title {
          font-size: 1rem;
        }

        .data {
          font-size: 0.875rem;
        }

        .scans-date {
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          font-size: 0.875rem;
        }
      }

      .actions {
        justify-content: flex-end;
      }
    }
  }
}
</style>

<style lang="scss">
.view-code-drawer {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .qr-code-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--color-neutral-100);
    }

    .data {
      font-size: 1rem;
      font-weight: 400;
      color: var(--color-neutral-400);
    }

    .scans-date {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--color-neutral-400);
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
}

.analytics-drawer {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .analytics-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .analytics-header {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;

      .title {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--color-neutral-100);
      }
    }

    .analytics-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .scans {
        display: flex;
        flex-direction: row;
        gap: 1rem;

        .scans-container {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          @include squircle(1.5rem);
          background-color: color-mix(
            in oklab,
            var(--color-gray-900) 40%,
            transparent
          );
          border: 1px solid
            color-mix(in oklab, var(--color-gray-700) 30%, transparent);
          padding: 0.5rem;

          .label {
            font-size: 0.875rem;
            font-weight: 400;
            color: var(--color-neutral-400);
          }

          .value {
            font-size: 1rem;
            font-weight: 500;
            color: var(--color-neutral-100);
          }
        }
      }

      .map-container {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--color-gray-900);
        border: 1px solid
          color-mix(in oklab, var(--color-gray-700) 30%, transparent);
        @include squircle(1.5rem);

        .map-wrapper {
          &:has(.map-error) {
            min-height: unset;
          }

          .map-error {
            color: var(--text-300);
            font-size: 0.75rem;
            font-weight: 500;
            text-align: center;
          }

          .mapboxgl-map {
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

            .mapboxgl-canvas-container {
              height: 10rem;
              @include squircle(1.5rem);
              overflow: hidden;
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
      }

      .chart-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--color-gray-900);
        border: 1px solid
          color-mix(in oklab, var(--color-gray-700) 30%, transparent);
        @include squircle(1.5rem);

        .no-data {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--text-300);
          text-align: center;
        }
      }
    }
  }
}
</style>
