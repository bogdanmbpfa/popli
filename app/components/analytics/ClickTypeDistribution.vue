<template>
  <div class="click-type-distribution">
    <div class="heading">
      <Icon class="danger" name="popli:donut-small" size="1rem" />
      <span class="title"> Click Type Distribution </span>
    </div>

    <div v-if="isDataAvailable && isProPlan" class="types">
      <div v-if="profileAccessClicks" class="type">
        <div class="labels">
          <span class="type-name">Profile Access</span>

          <span class="type-clicks">
            {{ Intl.NumberFormat('en-US').format(profileAccessClicks.clicks) }}
            ({{
              Math.floor(
                (profileAccessClicks.clicks / props.totalClicks) * 100,
              )
            }}%)
          </span>
        </div>

        <div class="progress">
          <div
            class="progress-bar"
            :style="{
              width: `${Math.floor((profileAccessClicks.clicks / props.totalClicks) * 100)}%`,
              background: clickTypeColors[profileAccessClicks.type]!,
            }"
          />
        </div>
      </div>

      <div v-if="featuredLinksClicks.length" class="type">
        <span class="heading"> Featured Links </span>

        <div
          v-for="click in featuredLinksClicks"
          :key="click.type"
          class="type"
        >
          <div class="labels">
            <span class="type-name">
              {{ click.type.charAt(0).toUpperCase() + click.type.slice(1) }}
            </span>

            <span class="type-clicks">
              {{ Intl.NumberFormat('en-US').format(click.clicks) }} ({{
                Math.floor((click.clicks / props.totalClicks) * 100)
              }}%)
            </span>
          </div>

          <div class="progress">
            <div
              class="progress-bar"
              :style="{
                width: `${Math.floor((click.clicks / props.totalClicks) * 100)}%`,
                background: clickTypeColors[click.type]!,
              }"
            />
          </div>
        </div>
      </div>

      <div v-if="otherClicks.length" class="type">
        <span class="heading"> Other </span>

        <div v-for="click in otherClicks" :key="click.type" class="type">
          <div class="labels">
            <span class="type-name">{{
              click.type.charAt(0).toUpperCase() + click.type.slice(1)
            }}</span>

            <span class="type-clicks">
              {{ Intl.NumberFormat('en-US').format(click.clicks) }} ({{
                Math.floor((click.clicks / props.totalClicks) * 100)
              }}%)
            </span>
          </div>

          <div class="progress">
            <div
              class="progress-bar"
              :style="{
                width: `${Math.floor((click.clicks / props.totalClicks) * 100)}%`,
                background: clickTypeColors[click.type]!,
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isProPlan && !isDataAvailable" class="empty">
      There is no click type data to display.
    </div>

    <div v-if="!isProPlan" class="free-plan-banner">
      <span class="description">
        Upgrade to the Pro plan to view your click type distribution.
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
import orderBy from 'lodash/orderBy';

import { EClickType, EPlanType } from '~~/enums';

const { upgradeToPro } = useUpgradePlan();

const props = defineProps({
  clicks: {
    type: Array as PropType<{ type: EClickType; clicks: number }[]>,
    required: true,
  },
  totalClicks: {
    type: Number,
    required: true,
  },
  userPlan: {
    type: String as PropType<EPlanType>,
    required: true,
  },
});

const clickTypeColors = ref<Record<EClickType, string>>({
  [EClickType.PROFILE_ACCESS]: 'var(--primary-400)',
  [EClickType.OTHER]: 'var(--tertiary-400)',
  [EClickType.X]: 'var(--secondary-400)',
  [EClickType.INSTAGRAM]: 'var(--primary-600)',
  [EClickType.TIKTOK]: 'var(--secondary-600)',
  [EClickType.YOUTUBE]: 'var(--tertiary-600)',
  [EClickType.FACEBOOK]: 'var(--primary-700)',
  [EClickType.LINKEDIN]: 'var(--secondary-700)',
  [EClickType.GITHUB]: 'var(--tertiary-700)',
  [EClickType.TWITCH]: 'var(--primary-800)',
  [EClickType.DISCORD]: 'var(--secondary-800)',
});

const isProPlan = computed(() => props.userPlan === EPlanType.PRO);

const profileAccessClicks = computed(() => {
  return props.clicks.find((click) => click.type === EClickType.PROFILE_ACCESS);
});

const featuredLinksClicks = computed(() => {
  return props.clicks
    .filter((click) =>
      [
        EClickType.X,
        EClickType.INSTAGRAM,
        EClickType.TIKTOK,
        EClickType.YOUTUBE,
        EClickType.FACEBOOK,
        EClickType.LINKEDIN,
        EClickType.GITHUB,
        EClickType.TWITCH,
        EClickType.DISCORD,
      ].includes(click.type as EClickType),
    )
    .sort((a, b) => b.clicks - a.clicks);
});

const otherClicks = computed(() => {
  return props.clicks
    .filter(
      (click) =>
        ![
          EClickType.PROFILE_ACCESS,
          ...featuredLinksClicks.value.map((click) => click.type),
        ].includes(click.type as EClickType),
    )
    .sort((a, b) => b.clicks - a.clicks);
});

const isDataAvailable = computed(
  () =>
    !!profileAccessClicks.value ||
    !!featuredLinksClicks.value.length ||
    !!otherClicks.value.length,
);
</script>

<style scoped lang="scss">
.click-type-distribution {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
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

  .types {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-height: 12rem;
    overflow-y: auto;
    position: relative;
    padding-right: 0.5rem;

    /* Custom scrollbar styling for .types container */
    scrollbar-width: thin;
    scrollbar-color: var(--neutral-800) transparent;
    scrollbar-gutter: stable both-edges;

    /* Webkit-based browsers */
    &::-webkit-scrollbar {
      width: 0.25rem;
      color: var(--neutral-800);
      background-color: transparent;
      border-radius: 0.25rem;
    }

    &::-webkit-scrollbar-thumb {
      color: var(--neutral-800);
      background-color: transparent;
      border-radius: 0.25rem;
      min-height: 2rem;
      transition: background-color 0.3s;
    }

    &::-webkit-scrollbar-thumb:hover {
      color: var(--neutral-800);
      background-color: transparent;
    }

    &::-webkit-scrollbar-corner {
      color: var(--neutral-800);
      background-color: transparent;
    }

    /* Apply padding-right only if scroll is active (overflow-y) */
    &.scrollbar-visible {
      padding-right: 0.5rem;
    }

    .type {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .heading {
        color: var(--neutral-400);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .labels {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;

        .type-name {
          color: var(--neutral-100);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .type-clicks {
          color: var(--neutral-400);
          font-size: 0.875rem;
          font-weight: 400;
        }
      }

      .progress {
        width: 100%;
        height: 0.5rem;
        background-color: var(--input-background);
        border-radius: 0.25rem;
        overflow: hidden;
        position: relative;

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 0.25rem;
          transition: width 0.2s ease-in-out;
          background: linear-gradient(
            90deg,
            var(--primary-400) 0%,
            var(--primary-600) 100%
          );
        }
      }
    }
  }

  .empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--neutral-400);
    text-align: center;
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
