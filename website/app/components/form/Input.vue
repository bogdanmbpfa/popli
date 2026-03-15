<template>
  <div class="form-input" :class="{ half: size === 'half' }">
    <label :for="id">{{ label }}</label>

    <div class="input-container">
      <slot />
    </div>

    <span v-if="!required" class="optional">Optional</span>

    <span v-if="caption" class="caption">{{ caption }}</span>

    <div v-if="error" class="error">
      <Icon name="mdi:alert-circle-outline" size="0.75rem" />

      <span>{{ error }}</span>
    </div>

    <div v-if="successCaption" class="success">
      <Icon name="mdi:check-circle-outline" size="0.75rem" />

      <span>{{ successCaption }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: '',
    required: false,
  },
  required: {
    type: Boolean,
    default: false,
    required: false,
  },
  error: {
    type: String,
    default: '',
    required: false,
  },
  successCaption: {
    type: String,
    default: '',
    required: false,
  },
  size: {
    type: String as PropType<'half' | 'full'>,
    default: 'full',
    required: false,
  },
});
</script>

<style lang="scss" scoped>
.form-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
  max-width: 100%;

  &.half {
    max-width: calc(50% - 0.5rem);
  }

  label {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-100);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .optional,
  .caption {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-300);
  }

  .error {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-danger);

    .iconify {
      width: 0.75rem;
      height: 0.75rem;
      filter: brightness(0) saturate(100%) invert(9%) sepia(55%) saturate(5599%)
        hue-rotate(348deg) brightness(101%) contrast(91%);
    }

    span {
      width: calc(100% - 0.75rem);
    }
  }

  .success {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--text-success);

    .iconify {
      width: 0.75rem;
      height: 0.75rem;
      filter: brightness(0) saturate(100%) invert(61%) sepia(74%)
        saturate(2912%) hue-rotate(102deg) brightness(95%) contrast(101%);
    }

    span {
      width: calc(100% - 0.75rem);
    }
  }
}
</style>
