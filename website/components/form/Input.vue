<template>
  <div class="form-input">
    <label :for="id">{{ label }}</label>

    <slot />

    <span v-if="!required" class="optional">Optional</span>

    <span v-if="caption" class="caption">{{ caption }}</span>

    <div v-if="error" class="error">
      <Icon name="mdi:alert-circle-outline" size="0.75rem" />

      <span>{{ error }}</span>
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
	});
</script>

<style lang="scss" scoped>
  .form-input {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    label {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--primary);
    }

    .optional, .caption {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--muted-foreground);
    }

    .error {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-red-600);

      .iconify {
        width: 0.75rem;
        height: 0.75rem;
      }

      span {
        width: calc(100% - 0.75rem);
      }
    }

    :root[data-theme='dark'] & {
      .error {
        color: var(--color-red-400);
      }
    }
  }
</style>
