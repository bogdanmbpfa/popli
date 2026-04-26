<template>
  <span class="ui-input-icon" v-bind="$attrs">
    <slot>
      <i :class="iconClass" />
    </slot>
  </span>
</template>

<script setup lang="ts">
const attrs = useAttrs();
const iconClass = computed(() => String(attrs.class ?? ''));
</script>

<style scoped lang="scss">
.ui-input-icon {
  position: absolute;
  left: 0.75rem;
  display: inline-flex;
  align-items: center;
  color: var(--neutral-300, #94a3b8);
}
</style>
