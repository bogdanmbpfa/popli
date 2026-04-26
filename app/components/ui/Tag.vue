<template>
  <span class="ui-tag" :class="`severity-${severity}`" v-bind="$attrs">
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    severity?: 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger';
  }>(),
  {
    severity: 'primary',
  },
);
</script>

<style scoped lang="scss">
.ui-tag {
  font-size: 0.625rem;
  font-weight: 400;
  padding: 0.175rem 0.5rem;
  background-color: var(--background-2);
  color: var(--neutral-100);
  border-radius: 0.5rem;
  width: fit-content;

  &.severity-contrast {
    background-image: var(--gradient-bottom-right-primary);
    color: white;
  }

  &.severity-secondary {
    background-color: color-mix(in oklab, var(--primary-400) 10%, transparent);
    color: var(--primary-400);
  }
}
</style>
