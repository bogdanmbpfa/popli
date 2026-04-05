<template>
  <div :class="['background-blur', `type-${type}`, `position-${position}`]" />
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String as PropType<'primary' | 'secondary'>,
    default: 'primary',
  },
  position: {
    type: String as PropType<
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right'
      | 'center-left'
      | 'center-right'
      | 'center-top'
      | 'center-bottom'
      | 'center'
    >,
    default: 'top-left',
  },
});
</script>

<style lang="scss" scoped>
.background-blur {
  position: absolute;
  filter: blur(120px);
  width: 24rem;
  height: 24rem;
  border-radius: 0.75rem;

  &.type-primary {
    background-color: oklch(0.7685 0.1415 8.88 / 10%);
  }

  &.type-secondary {
    background-color: oklch(0.6969 0.165758 249.5817 / 5%);
  }

  &.position-top-left {
    top: -5rem;
    left: -5rem;
  }

  &.position-top-right {
    top: -5rem;
    right: -5rem;
  }

  &.position-bottom-left {
    bottom: -5rem;
    left: -5rem;
  }

  &.position-bottom-right {
    bottom: -5rem;
    right: -5rem;
  }

  &.position-center-left {
    left: -5rem;
  }

  &.position-center-right {
    right: -5rem;
  }

  &.position-center-top {
    top: -5rem;
  }

  &.position-center-bottom {
    bottom: -5rem;
  }

  &.position-center {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
