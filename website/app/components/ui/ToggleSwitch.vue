<template>
  <label class="ui-toggle" :class="{ checked: modelValue }" v-bind="$attrs">
    <input type="checkbox" :checked="modelValue" @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)">
    <span class="track" />
  </label>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ modelValue?: boolean }>(), { modelValue: false });
defineEmits<{ 'update:modelValue': [boolean] }>();
</script>

<style scoped lang="scss">
.ui-toggle {
  width: 2.25rem;
  height: 1.25rem;

  input {
    display: none;
  }

  .track {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    border: none;
    background: var(--background-3);
    box-shadow: none;
    outline: none;
    padding: 0.125rem;
    transition: justify-content 0.3s ease-in-out, background 0.3s ease-in-out;
    border-radius: 1rem;
    width: 2rem;
    height: fit-content;
    cursor: pointer;

    &::after {
      content: '';
      position: static;
      width: 0.95rem;
      height: 0.95rem;
      border-radius: 50%;
      background: var(--background-1);
      transform: none;
      transition: none;
    }
  }

  &.checked {
    .track {
      justify-content: flex-end;
      background: var(--background-4);
    }
  }
}
</style>
