<template>
  <input
    class="ui-input-number"
    type="number"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    v-bind="$attrs"
    @input="onInput"
  >
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
}>(), {
  modelValue: null,
  min: undefined,
  max: undefined,
  step: 1
});
const emit = defineEmits<{ 'update:modelValue': [number | null] }>();

const onInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emit('update:modelValue', value === '' ? null : Number(value));
};
</script>

<style scoped lang="scss">
.ui-input-number {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background: var(--input-background) !important;
  background-color: var(--input-background) !important;
  color: var(--neutral-100);
  border: 1px solid transparent;

  &:not(:disabled):hover,
  &:not(:disabled):focus,
  &:not(:disabled):active {
    color: var(--neutral-100);
    outline: none;
  }
}
</style>
