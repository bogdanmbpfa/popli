<template>
  <div class="top-countries">
    <div class="heading">
      <Icon
        class="success"
        name="material-symbols:location-on-outline"
        size="1rem"
      />
      <span class="title"> Top Countries </span>
    </div>

    <div class="countries">
      <div
        v-for="country in countries"
        :key="country.countryCode"
        class="country"
      >
        <div class="labels">
          <span class="country-name">{{ country.country }}</span>

          <span class="country-clicks">
            {{ Intl.NumberFormat('en-US').format(country.clicks) }} ({{
              Math.floor((country.clicks / totalClicks) * 100)
            }}%)
          </span>
        </div>

        <div class="progress">
          <div
            class="progress-bar"
            :style="{
              width: `${Math.floor((country.clicks / totalClicks) * 100)}%`,
              background: country.color,
            }"
          />
        </div>
      </div>
    </div>

    <PButton
      v-if="!expanded && countries.length > 5"
      class="default"
      severity="info"
      label="View All"
      @click="toggleExpanded"
    />
  </div>
</template>

<script setup lang="ts">
import orderBy from 'lodash/orderBy';

const props = defineProps({
  totalClicks: {
    type: Number,
    required: true,
  },
  countries: {
    type: Array as PropType<
      { country: string; countryCode: string; clicks: number; color: string }[]
    >,
    required: true,
  },
});

const expanded = ref(false);

const countries = computed(() => {
  return orderBy(props.countries, 'clicks', 'desc').slice(
    0,
    expanded.value ? undefined : 5,
  );
});

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};
</script>

<style lang="scss" scoped>
.top-countries {
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

  .countries {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;

    .country {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      .labels {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;

        .country-name {
          color: var(--neutral-100);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .country-clicks {
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
        z-index: 1;

        .progress-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          border-radius: 0.25rem;
          transition: width 0.2s ease-in-out;
          z-index: 2;
        }
      }
    }
  }
}
</style>
