<template>
  <button
    class="ui-button"
    :class="[
      `severity-${severity}`,
      `variant-${variant}`,
      `size-${size}`,
      { rounded, fluid, loading, naked },
    ]"
    :type="type"
    :disabled="disabled || loading"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner" />

    <Icon
      v-if="icon && iconPosition === 'left'"
      :class="severity"
      :name="icon"
      :size="iconSize"
    />

    <span v-if="label">{{ label }}</span>

    <slot />

    <Icon
      v-if="icon && iconPosition === 'right'"
      :class="severity"
      :name="icon"
      :size="iconSize"
    />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    icon?: string;
    iconPosition?: 'left' | 'right';
    iconSize?: string;
    severity?:
      | 'primary'
      | 'secondary'
      | 'success'
      | 'info'
      | 'warn'
      | 'danger'
      | 'contrast'
      | 'help';
    variant?: 'solid' | 'outlined' | 'text';
    size?: 'small' | 'medium' | 'large';
    rounded?: boolean;
    fluid?: boolean;
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    naked?: boolean;
  }>(),
  {
    iconPosition: 'left',
    iconSize: '1rem',
    severity: 'primary',
    variant: 'solid',
    size: 'medium',
    rounded: false,
    fluid: false,
    loading: false,
    disabled: false,
    type: 'button',
    naked: false,
  },
);

defineEmits<{ click: [MouseEvent] }>();
</script>

<style scoped lang="scss">
.ui-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  outline: none;
  padding: 0.75rem 2rem;
  min-width: fit-content;
  background: none;
  color: var(--neutral-400);
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  line-height: 1.5;
  font-weight: 500;
  border-radius: 0.25rem;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  &.fluid {
    width: 100%;
  }

  &.severity-secondary {
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
    background: transparent;

    &:hover,
    &:not(:disabled):hover,
    &:active,
    &:not(:disabled):active,
    &:focus-visible {
      color: var(--neutral-100);
      background: var(--neutral-900);
    }
  }

  &.severity-contrast {
    background-image: var(--linear-gradient-primary);
    color: var(--primary-950);
    box-shadow: var(--box-shadow-primary);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover,
    &:not(:disabled):hover,
    &:not(:disabled):active {
      transform: scale(1.02);
    }
  }

  &.severity-danger {
    background: var(--danger);
    color: var(--primary-400);
    border: 1px solid color-mix(in oklab, var(--primary-400) 20%, transparent);

    &:not(.naked):hover,
    &:not(.naked):not(:disabled):hover,
    &:not(.naked):not(:disabled):active {
      background: var(--primary-400);
      color: var(--danger);

      .iconify {
        filter: brightness(0) saturate(100%) invert(10%) sepia(36%)
          saturate(3867%) hue-rotate(307deg) brightness(94%) contrast(127%);
      }
    }
  }

  &.severity-info {
    background: var(--background-primary);
    color: var(--neutral-100);
  }

  &.severity-help {
    background: var(--neutral-900);
    color: var(--neutral-400);
  }

  &.variant-outlined {
    background: transparent;
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
  }

  &.variant-text {
    background: transparent;
    border-color: transparent;
    padding: 0.5rem;
  }

  &.size-small {
    padding: 0.5rem 1rem;
  }

  &.size-large {
    padding: 1rem 2.25rem;
  }

  &.rounded {
    border-radius: 999px;
  }

  &.naked,
  &.naked:hover,
  &.naked:not(:disabled):hover,
  &.naked:active,
  &.naked:not(:disabled):active,
  &.naked:focus-visible,
  &.naked:not(:disabled):focus-visible {
    padding: 0;
    border: none;
    background: none;
  }
}

.spinner {
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
