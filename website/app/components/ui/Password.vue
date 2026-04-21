<template>
  <div class="ui-password" v-bind="$attrs">
    <input
      class="password-input"
      :type="reveal ? 'text' : 'password'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button type="button" class="toggle" @click="reveal = !reveal">
      {{ reveal ? 'Hide' : 'Show' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
withDefaults(defineProps<{ modelValue?: string }>(), { modelValue: '' });
defineEmits<{ 'update:modelValue': [string] }>();
const reveal = ref(false);
</script>

<style scoped lang="scss">
.ui-password {
  display: flex;
  width: 100%;
  flex: 1;

  .password-input {
    flex: 1;
    border: 1px solid transparent;
    border-radius: 0.25rem 0 0 0.25rem;
    background: var(--input-background);
    color: var(--neutral-100);
    padding: 0.75rem;

    &:focus {
      outline: none;
      border-color: var(--primary-400);
    }
  }

  .toggle {
    border: 1px solid transparent;
    border-left: none;
    border-radius: 0 0.25rem 0.25rem 0;
    background: var(--input-background);
    color: var(--neutral-400);
    padding: 0 0.75rem;
  }
}
</style>
