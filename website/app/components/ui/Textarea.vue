<template>
  <textarea
    class="ui-textarea"
    :value="modelValue"
    v-bind="$attrs"
    @input="
      $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
    "
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: string | null }>(), { modelValue: '' });
defineEmits<{ 'update:modelValue': [string] }>();
</script>

<style scoped lang="scss">
.ui-textarea {
  padding: 0.75rem;
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  background: var(--input-background);
  background-color: var(--input-background);
  color: var(--neutral-100);
  border: 1px solid transparent;
  border-radius: 0.25rem;
  line-height: 1.5;
  width: 100%;

  &::placeholder {
    color: var(--neutral-400);
  }

  &:hover,
  &:enabled:hover {
    border-color: transparent;
    outline: none;
  }

  &:focus,
  &:enabled:focus {
    border-color: var(--primary-400);
    outline: none;
  }
}
</style>
