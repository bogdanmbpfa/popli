<template>
  <div class="click-type-distribution">
    <div class="heading">
      <Icon class="danger" name="popli:donut-small" size="1rem" />
      <span class="title"> Click Type Distribution </span>
    </div>

    <div v-if="rows.length" class="types">
      <div v-for="row in rows" :key="row.type" class="type">
        <div class="labels">
          <span class="type-name">{{ row.label }}</span>

          <span class="type-clicks">
            {{ Intl.NumberFormat('en-US').format(row.clicks) }} ({{ row.percent }}%)
          </span>
        </div>

        <div class="progress">
          <div
            class="progress-bar"
            :style="{
              width: `${row.percent}%`,
              background: clickTypeColors[row.type]!,
            }"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty">
      There is no click type data to display.
    </div>
  </div>
</template>

<script setup lang="ts">
import orderBy from 'lodash/orderBy';

import { EClickType } from '~~/enums';

const props = defineProps({
  clicks: {
    type: Array as PropType<{ type: EClickType; clicks: number }[]>,
    required: true,
  },
  totalClicks: {
    type: Number,
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

const rows = computed(() => {
  const ordered = orderBy(props.clicks, 'clicks', 'desc');

  return ordered.map((row) => ({
    ...row,
    label:
      row.type === EClickType.PROFILE_ACCESS
        ? 'Profile Access'
        : row.type === EClickType.OTHER
          ? 'Other'
          : row.type.charAt(0).toUpperCase() + row.type.slice(1),
    percent:
      props.totalClicks > 0
        ? Math.floor((row.clicks / props.totalClicks) * 100)
        : 0,
  }));
});
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
    gap: 0.5rem;
    width: 100%;

    .type {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

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
        background-color: var(--background-secondary);
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
            color-mix(in oklab, var(--primary-400) 60%, var(--warning-400) 40%) 100%
          );
        }
      }
    }
  }

  .empty {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--text-300);
    text-align: center;
  }
}
</style>
