<template>
  <div class="map-container">
    <div class="heading">
      <Icon
        class="danger"
        name="popli:globe-showing-europe-africa"
        size="1rem"
      />
      <span class="title"> Global Distribution </span>
    </div>

    <div v-show="!mapError && isProPlan && !!props.clicks.length" id="clicks-map" />

    <div v-show="mapError" class="map-error">
      Error loading map. Please check your browser's graphics settings.
    </div>

    <div v-if="!isProPlan" class="free-plan-banner">
      <span class="description">
        Upgrade to the Pro plan to view your global distribution.
      </span>

      <UiButton
        severity="contrast"
        label="Upgrade to Pro"
        aria-label="Upgrade to Pro"
        @click="upgradeToPro"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import mapboxgl from 'mapbox-gl';

import worldCountryCoordinates from '~~/constants/world-countries.json';
import { EPlanType } from '~~/enums';
import type { IWorldCountry } from '~~/interfaces';

mapboxgl.accessToken = useRuntimeConfig().public.mapboxAccessToken;

const { upgradeToPro } = useUpgradePlan();

const props = defineProps({
  clicks: {
    type: Array as PropType<
      { country: string; countryCode: string; clicks: number }[]
    >,
    required: true,
  },
  userPlan: {
    type: String as PropType<EPlanType>,
    required: true,
  },
});

const map = ref<mapboxgl.Map>();
const mapError = ref(false);

const isProPlan = computed(() => props.userPlan === EPlanType.PRO);

onMounted(() => {
  const mapContainer = document.getElementById('clicks-map');

  if (!mapContainer) {
    mapError.value = true;
    return;
  }

  try {
    map.value =
      isProPlan.value && !!props.clicks.length
        ? new mapboxgl.Map({
            container: 'clicks-map',
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [20, 50],
            zoom: 0,
          })
        : undefined;
  } catch {
    mapError.value = true;
    return;
  }

  map.value?.on('load', () => {
    // Add markers
    for (const click of props.clicks) {
      const root = document.createElement('div');
      root.className = 'mapboxgl-marker';
      root.style.position = 'relative';
      root.style.width = '0.5rem';
      root.style.height = '0.5rem';
      root.style.borderRadius = '50%';
      root.style.backgroundColor = (
        worldCountryCoordinates as Record<string, IWorldCountry>
      )[click.countryCode]!.color;

      const pulse = document.createElement('div');
      pulse.className = 'mapboxgl-pulse';
      pulse.style.position = 'absolute';
      pulse.style.top = '0';
      pulse.style.left = '0';
      pulse.style.width = '0.5rem';
      pulse.style.height = '0.5rem';
      pulse.style.borderRadius = '50%';
      pulse.style.backgroundColor = (
        worldCountryCoordinates as Record<string, IWorldCountry>
      )[click.countryCode]!.color;
      pulse.style.opacity = '0.6';
      pulse.style.animation = 'pulse 2s ease-in-out infinite';
      pulse.style.pointerEvents = 'none';

      root.appendChild(pulse);

      new mapboxgl.Marker({ element: root })
        .setLngLat([
          (worldCountryCoordinates as Record<string, IWorldCountry>)[
            click.countryCode
          ]!.longitude,
          (worldCountryCoordinates as Record<string, IWorldCountry>)[
            click.countryCode
          ]!.latitude,
        ])
        .addTo(map.value!);
    }
  });
});

onUnmounted(() => {
  map.value?.remove();
});
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
  background-color: var(--background-primary);
  padding: 1rem;
  border-radius: 0.5rem;

  .heading {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;

    .title {
      color: var(--neutral-100);
      font-size: 0.875rem;
      font-weight: 500;
    }
  }

  .map-error {
    color: var(--neutral-300);
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
  }

  :deep(.mapboxgl-map) {
    .mapboxgl-popup {
      position: absolute;
      top: 0;
      left: 0;
      will-change: transform;
      pointer-events: none;

      .mapboxgl-popup-content {
        background-color: var(--background-primary);
        padding: 0.5rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        color: var(--neutral-100);
      }
    }

    .mapboxgl-canvas-container {
      height: 15rem;

      canvas {
        width: 100% !important;
        height: 100% !important;
        aspect-ratio: initial;
      }
    }

    .mapboxgl-control-container {
      .mapboxgl-ctrl-bottom-right {
        .mapboxgl-ctrl-attrib {
          background-color: transparent;
          border-radius: 0;
          margin: 0;
          padding: 0.25rem;
          min-height: unset;

          .mapboxgl-ctrl-attrib-button {
            display: none;
          }

          .mapboxgl-ctrl-attrib-inner {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 0.25rem;

            a {
              color: var(--neutral-100);
              text-decoration: none;
              font-family: 'Roboto', sans-serif;
              font-size: 0.5rem;
              font-weight: 500;
              line-height: 1;

              &:hover {
                text-decoration: underline;
              }
            }
          }
        }
      }

      .mapboxgl-ctrl-bottom-left {
        .mapboxgl-ctrl {
          margin: 0;

          a {
            margin: 0;
            height: 1rem;
          }
        }
      }
    }
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
