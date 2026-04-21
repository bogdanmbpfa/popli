<template>
  <input
    class="ui-slider"
    type="range"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    v-bind="$attrs"
    @input="
      $emit(
        'update:modelValue',
        Number(($event.target as HTMLInputElement).value),
      )
    "
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: number;
    min?: number;
    max?: number;
    step?: number;
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1,
  },
);
defineEmits<{ 'update:modelValue': [number] }>();
</script>

<style scoped lang="scss">
.ui-slider {
  background: var(--input-background) !important;
  background-color: var(--input-background) !important;
  height: 0.5rem;
  width: 100%;
  margin: 0 auto;
  accent-color: var(--primary-400);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}
</style>
