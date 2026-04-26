<template>
  <div class="analytics-page">
    <div class="heading">
      <span class="title">Analytics</span>

      <span class="description">View your account analytics.</span>
    </div>

    <div class="content">
      <div class="total-profile-clicks">
        <div class="heading">
          <Icon class="danger" name="popli:ads-click" size="1.5rem" />

          <span class="title">Total Profile Clicks</span>
        </div>

        <span class="value">
          {{ formatNumber(totalClicks) }}
        </span>

        <div class="change-percentage">
          <Icon
            v-if="dailyClicksChangePercentage >= 0"
            class="success"
            name="popli:graph-arrow-increase"
            size="1.5rem"
          />
          <Icon
            v-else
            class="danger"
            name="popli:graph-arrow-decrease"
            size="1.5rem"
          />

          <span
            class="value"
            :class="{ positive: dailyClicksChangePercentage >= 0 }"
          >
            {{ dailyClicksChangePercentage >= 0 ? '+' : ''
            }}{{ dailyClicksChangePercentage }}%
          </span>
        </div>
      </div>

      <div class="chart">
        <AnalyticsDailyClicksChart :clicks="dailyClicks" />
      </div>

      <div class="global-distribution">
        <AnalyticsClicksMap :clicks="countryClicks" />

        <AnalyticsTopCountries
          :total-clicks="totalClicks"
          :countries="countriesWithColors"
        />
      </div>

      <div class="traffic-distribution">
        <AnalyticsClickTypeDistribution
          :total-clicks="totalClicks"
          :clicks="typeClicks"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import worldCountryCoordinates from '~~/constants/world-countries.json';
import { EApiEndpoint } from '~~/enums';
import type {
  IProfileCountryClicks,
  IProfileDailyClick,
  IProfileDailyClicks,
  IProfileTotalClicks,
  IProfileTypeClicks,
  IWorldCountry,
} from '~~/interfaces';

definePageMeta({
  layout: 'default',
  middleware: 'is-logged-in',
});

const { data: analyticsData, refresh } = await useAsyncData(
  'profile-analytics',
  async () => {
    const [{ data: totalData }, { data: dailyData }] = await Promise.all([
      useApiJson(EApiEndpoint.PROFILE_TOTAL_CLICKS),
      useApiJson(EApiEndpoint.PROFILE_DAILY_CLICKS),
    ]);

    return {
      total: totalData,
      daily: dailyData,
    };
  },
  {
    server: false,
    default: () => ({
      total: null as IProfileTotalClicks | null,
      daily: null as IProfileDailyClicks | null,
    }),
  },
);

onMounted(async () => {
  if (!analyticsData.value?.total) {
    await refresh();
  }
});

const totalClicks = computed(
  () => analyticsData.value?.total?.totalClicks ?? 0,
);
const dailyClicks = computed<IProfileDailyClick[]>(
  () => analyticsData.value?.daily?.dailyClicks ?? [],
);
const dailyClicksChangePercentage = computed(
  () => analyticsData.value?.daily?.changePercentage ?? 0,
);
const typeClicks = computed<IProfileTypeClicks[]>(
  () => analyticsData.value?.total?.typeClicks ?? [],
);

const countryClicks = computed<IProfileCountryClicks[]>(() =>
  (analyticsData.value?.total?.countryClicks ?? []).filter((country) =>
    Boolean(
      (worldCountryCoordinates as Record<string, IWorldCountry>)[
        country.countryCode
      ],
    ),
  ),
);

const countriesWithColors = computed(() =>
  countryClicks.value.map((country) => ({
    ...country,
    color: (worldCountryCoordinates as Record<string, IWorldCountry>)[
      country.countryCode
    ]!.color,
  })),
);
</script>

<style scoped lang="scss">
.analytics-page {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0;

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .description {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--neutral-400);
    }
  }

  .content {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;

    .total-profile-clicks {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: calc(40% - 0.5rem);
      background-color: var(--background-secondary);
      padding: 1rem;
      border-radius: 0.5rem;

      .heading {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        .title {
          color: var(--neutral-100);
          font-size: 1rem;
          font-weight: 500;
        }
      }

      .value {
        color: var(--neutral-100);
        font-size: 3.5rem;
        font-weight: 500;
      }

      .change-percentage {
        position: absolute;
        top: 1rem;
        right: 1rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        .value {
          color: var(--primary-400);
          font-size: 0.875rem;
          font-weight: 400;

          &.positive {
            color: var(--secondary-400);
          }
        }
      }
    }

    .chart {
      display: flex;
      width: calc(60% - 0.5rem);
      height: fit-content;
      background-color: var(--background-secondary);
      padding: 1rem;
      border-radius: 0.5rem;
    }

    .global-distribution {
      width: calc(60% - 0.5rem);
      display: flex;
      border-radius: 0.5rem;
      background-color: var(--background-secondary);

      :deep(.map-container) {
        background-color: transparent;
        border-radius: 0;
      }

      :deep(.top-countries) {
        background-color: color-mix(
          in oklab,
          var(--neutral-800) 20%,
          transparent
        );
        border-radius: 0;
      }
    }

    .traffic-distribution {
      width: calc(40% - 0.5rem);
      display: flex;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: var(--background-secondary);

      :deep(.click-type-distribution) {
        background-color: transparent;
        border-radius: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .analytics-page {
    .content {
      flex-direction: column;

      .total-profile-clicks,
      .chart,
      .global-distribution,
      .traffic-distribution {
        width: 100%;
      }

      .global-distribution {
        flex-direction: column;
      }
    }
  }
}
</style>
