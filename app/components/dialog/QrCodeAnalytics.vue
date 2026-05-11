<template>
  <div v-if="qrCodeAnalytics" class="qrcode-analytics-dialog">
    <div class="stats">
      <div class="stat">
        <span class="title">Total Scans</span>
        <span class="value">
          {{ formatNumber(qrCodeAnalytics.totalScans) }}
        </span>
      </div>

      <div class="stat">
        <span class="title">Total Countries</span>
        <span class="value">
          {{ formatNumber(qrCodeAnalytics.totalCountries) }}
        </span>
      </div>

      <div class="stat">
        <span class="title">Average Scans per Country</span>
        <span class="value">
          {{ formatNumber(qrCodeAnalytics.averageScansPerCountry) }}
        </span>
      </div>
    </div>

    <div class="chart">
      <LazyAnalyticsDailyClicksChart
        :clicks="
          qrCodeAnalytics.dailyScans.map((scan) => ({
            date: scan.date,
            clicks: scan.scans,
          }))
        "
        title="Daily Scans"
      />
    </div>

    <div class="global-distribution">
      <LazyAnalyticsClicksMap
        :clicks="
          qrCodeAnalytics.countryDistribution.map((country) => ({
            country: country.country,
            countryCode: country.countryCode,
            clicks: country.totalScans,
          }))
        "
        :user-plan="userPlan"
      />
    </div>

    <div class="top-countries">
      <LazyAnalyticsTopCountries
        :total-clicks="qrCodeAnalytics.totalScans"
        :countries="
          qrCodeAnalytics.countryDistribution.map((country) => ({
            ...country,
            clicks: country.totalScans,
            color: (worldCountryCoordinates as Record<string, IWorldCountry>)[country.countryCode]!.color,
          }))
          "
        :user-plan="userPlan"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import worldCountryCoordinates from '~~/constants/world-countries.json';
import { EApiEndpoint, EPlanType } from '~~/enums';
import type { IQrCodeAnalytics, IWorldCountry } from '~~/interfaces';

const props = defineProps<{
  qrCodeId: string;
  userPlan: EPlanType;
}>();

const qrCodeAnalytics = ref<IQrCodeAnalytics | null>(null);

onMounted(async () => {
  if (props.qrCodeId) {
    const { data, error } = await useApiJson(
      EApiEndpoint.QR_CODE_ANALYTICS,
      {},
      {},
      { id: props.qrCodeId },
    );

    if (error) return;

    qrCodeAnalytics.value = data;
  }
});
</script>

<style scoped lang="scss">
.qrcode-analytics-dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .stats {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: center;
    align-items: center;

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      background-color: var(--background-primary);
      width: 100%;

      .title {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--neutral-400);
      }

      .value {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--neutral-100);
      }
    }
  }

  .chart {
    display: flex;
    width: 100%;
    height: fit-content;
    border-radius: 0.5rem;
  }

  .global-distribution {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    background-color: var(--background-secondary);
    border-radius: 0.5rem;

    :deep(.map-container) {
      background-color: transparent;
    }
  }

  .top-countries {
    min-height: 20rem;
    display: flex;
    flex: 1;
    flex-direction: column;
    background-color: var(--background-secondary);
    border-radius: 0.5rem;

    :deep(.top-countries) {
      background-color: transparent;
    }
  }
}

@media (max-width: 768px) {
  .qrcode-analytics-dialog {
    .stats {
      flex-wrap: wrap;

      .stat {
        width: calc(50% - 0.5rem);
      }
    }
  }
}
</style>
