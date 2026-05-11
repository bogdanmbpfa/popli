<template>
  <div v-if="shortUrl" class="short-url-analytics-dialog">
    <div class="stats">
      <div class="stat">
        <span class="title">Total Clicks</span>
        <span class="value">
          {{ formatNumber(shortUrl.totalClicks) }}
        </span>
      </div>

      <div class="stat">
        <span class="title">Unique Visitors</span>
        <span class="value">
          {{ formatNumber(shortUrl.totalUniqueVisitors) }}
        </span>
      </div>

      <div class="stat">
        <span class="title">Today's Clicks</span>
        <span class="value">
          {{ formatNumber(shortUrl.todayClicks) }}
        </span>
      </div>

      <div class="stat">
        <span class="title">Today's Unique Visitors</span>
        <span class="value">
          {{ formatNumber(shortUrl.todayUniqueVisitors) }}
        </span>
      </div>
    </div>

    <div class="chart">
      <LazyAnalyticsDailyClicksChart :clicks="dailyClicks" />
    </div>

    <div class="global-distribution">
      <LazyAnalyticsClicksMap :clicks="countryClicks" :user-plan="userPlan" />
    </div>

    <div class="top-countries">
      <LazyAnalyticsTopCountries
        :total-clicks="shortUrl.totalClicks"
        :countries="
          countryClicks.map((country) => ({
            ...country,
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
import type {
  IUrlShortUrl,
  IUrlShortUrlCountryClicks,
  IUrlShortUrlDailyClicks,
  IWorldCountry,
} from '~~/interfaces';

const props = defineProps<{
  shortUrl: IUrlShortUrl;
  userPlan: EPlanType;
}>();

const dailyClicks = ref<IUrlShortUrlDailyClicks[]>([]);
const countryClicks = ref<IUrlShortUrlCountryClicks[]>([]);

onMounted(async () => {
  if (props.shortUrl) {
    const { data: dailyClicksData } = await useApiJson(
      EApiEndpoint.URL_SHORT_URL_DAILY_CLICKS,
      {},
      {},
      { id: props.shortUrl.id },
    );

    if (dailyClicksData) {
      dailyClicks.value = dailyClicksData;
    }

    const { data: countryClicksData } = await useApiJson(
      EApiEndpoint.URL_SHORT_URL_COUNTRY_CLICKS,
      {},
      {},
      { id: props.shortUrl.id },
    );

    if (countryClicksData) {
      countryClicks.value = countryClicksData;
    }
  }
});
</script>

<style scoped lang="scss">
.short-url-analytics-dialog {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .stats {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    justify-content: space-between;
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
        text-wrap: nowrap;
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
    gap: 1rem;
    justify-content: center;
    background-color: var(--background-secondary);
    border-radius: 0.5rem;

    :deep(.top-countries) {
      background-color: transparent;
    }
  }
}

@media (max-width: 768px) {
  .short-url-analytics-dialog {
    .stats {
      flex-wrap: wrap;

      .stat {
        width: calc(50% - 0.5rem);
      }
    }
  }
}
</style>
