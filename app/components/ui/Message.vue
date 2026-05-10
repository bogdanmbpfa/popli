<template>
  <div class="ui-message" :class="`severity-${severity}`" v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ severity?: 'info' | 'success' | 'warn' | 'error' }>(),
  {
    severity: 'info',
  },
);
</script>

<style scoped lang="scss">
.ui-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  background: none;
  outline: none;
  box-shadow: none;
  border: none;
  width: 100%;
  padding: 0;
  font-size: 0.75rem;
  text-align: center;

  &.text-left {
    text-align: left;
    justify-content: flex-start;
  }

  &.severity-error {
    color: var(--primary-600);
  }

  &.severity-success {
    color: var(--secondary-400);
  }

  &.severity-info {
    color: var(--neutral-400);
  }

  &.severity-warn {
    color: var(--primary-400);
  }
}
</style>
