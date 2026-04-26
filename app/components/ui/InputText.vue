<template>
  <div class="ui-input-text-container">
    <input
      class="ui-input-text"
      :class="{ invalid }"
      :value="modelValue"
      :type="toggleMask ? (showPassword ? 'text' : 'password') : type"
      v-bind="$attrs"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />

    <Icon
      v-if="toggleMask"
      :name="showPassword ? 'popli:eye-outline' : 'popli:eye-off-outline'"
      class="default toggle"
      size="1.25rem"
      @click="showPassword = !showPassword"
    />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number | null;
    type?: string;
    invalid?: boolean;
    toggleMask?: boolean;
  }>(),
  {
    modelValue: '',
    type: 'text',
    invalid: false,
    toggleMask: false,
  },
);

defineEmits<{ 'update:modelValue': [string] }>();

const showPassword = ref(false);
</script>

<style scoped lang="scss">
.ui-input-text-container {
  position: relative;
  width: 100%;

  .ui-input-text {
    padding: 0.75rem;
    font-size: 1rem;
    background: var(--input-background) !important;
    background-color: var(--input-background) !important;
    border: 1px solid transparent;
    color: var(--neutral-100);
    line-height: 1.5;
    border-radius: 0.25rem;
    width: 100%;
    outline: none;
    outline-offset: 0;

    &::placeholder {
      opacity: 0.8;
    }

    &.invalid {
      border-color: var(--primary-600);
    }

    &:focus,
    &:focus-visible {
      border-color: var(--primary-400);
      outline: none;
    }

    &:hover,
    &[readonly] {
      border-color: transparent;
      outline: none;
    }

    &:disabled {
      opacity: 0.4;
    }
  }

  .toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    cursor: pointer;
  }
}
</style>
