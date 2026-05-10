<template>
  <input
    class="ui-color-picker"
    type="color"
    :value="modelValue"
    v-bind="$attrs"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: '#000000',
});
defineEmits<{ 'update:modelValue': [string] }>();
</script>

<style scoped lang="scss">
.ui-color-picker {
  border-radius: 0.25rem;
  padding: 0.125rem;
  font-size: 1rem;
  background-color: var(--input-background);
  border: 1px solid transparent;
  color: var(--neutral-100);
  line-height: 1.5;
  outline: none;
  width: 3rem;
  height: 3rem;
  cursor: pointer;
}
</style>
