<template>
  <label class="ui-toggle" :class="{ checked: modelValue }" v-bind="$attrs">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
    />
    <div class="track" />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<style scoped lang="scss">
.ui-toggle {
  display: inline-flex;
  align-items: center;
  width: 2.5rem;
  height: 1.375rem;
  cursor: pointer;

  input {
    display: none;
  }

  .track {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    border: none;
    background: var(--background-secondary);
    box-shadow: none;
    outline: none;
    padding: 0.125rem;
    transition: background 0.2s ease-in-out;
    border-radius: 1rem;
    width: 2.5rem;
    height: 1.375rem;
    min-width: 2.5rem;
    min-height: 1.375rem;

    &::after {
      content: '';
      display: block;
      position: absolute;
      left: 0.125rem;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: var(--background-1);
      transform: translateX(0);
      transition: transform 0.2s ease-in-out;
    }
  }

  &.checked {
    .track {
      background: var(--background-4);

      &::after {
        transform: translateX(1.125rem);
      }
    }
  }
}
</style>
