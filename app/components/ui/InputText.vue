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

    <button
      v-if="toggleMask"
      type="button"
      class="toggle"
      :aria-label="showPassword ? 'Hide password' : 'Show password'"
      @click="showPassword = !showPassword"
    >
      <Icon
        :name="showPassword ? 'popli:eye-outline' : 'popli:eye-off-outline'"
        class="default"
        size="1.25rem"
        aria-hidden="true"
      />
    </button>
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
    width: 100%;
    height: 3rem;
    padding: 0.75rem;
    font-size: 1rem;
    background: var(--input-background);
    background-color: var(--input-background) !important;
    border: 1px solid transparent;
    color: var(--neutral-100);
    -webkit-text-fill-color: var(--neutral-100);
    line-height: 1.5;
    border-radius: 0.25rem;
    outline: none;
    outline-offset: 0;
    transition:
      background-color 999999s step-end,
      color 999999s step-end,
      -webkit-text-fill-color 999999s step-end;

    &::placeholder {
      opacity: 0.8;
      color: var(--neutral-400);
      -webkit-text-fill-color: var(--neutral-400);
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }
}
</style>
