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
      <AnalyticsDailyClicksChart :clicks="dailyClicks" />
    </div>

    <div class="global-distribution">
      <AnalyticsClicksMap :clicks="countryClicks" />

      <AnalyticsTopCountries
        :total-clicks="shortUrl.totalClicks"
        :countries="
          countryClicks.map((country) => ({
            ...country,
            color: (worldCountryCoordinates as Record<string, IWorldCountry>)[country.countryCode]!.color,
          }))
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import worldCountryCoordinates from '~~/constants/world-countries.json';
import { EApiEndpoint } from '~~/enums';
import type {
  IUrlShortUrl,
  IUrlShortUrlCountryClicks,
  IUrlShortUrlDailyClicks,
  IWorldCountry,
} from '~~/interfaces';

const props = defineProps<{
  shortUrl: IUrlShortUrl;
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

  .global-distribution {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: center;
    align-items: center;
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
