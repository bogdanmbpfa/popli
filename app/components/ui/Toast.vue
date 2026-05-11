<template>
  <Teleport to="body">
    <div
      class="ui-toast"
      :class="positionClass"
      role="region"
      aria-live="polite"
      aria-relevant="additions text"
      aria-label="Notifications"
      v-bind="$attrs"
    >
      <slot />

      <div
        v-for="message in messages"
        :key="message.id"
        class="ui-toast-message"
        :class="`severity-${message.severity}`"
      >
        <div class="content">
          <div class="text">
            <p v-if="message.summary" class="summary">{{ message.summary }}</p>
            <p v-if="message.detail" class="detail">{{ message.detail }}</p>
          </div>

          <button
            v-if="message.closable"
            type="button"
            class="close"
            aria-label="Close toast"
            @click="toast.remove(message.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    position?:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right';
  }>(),
  {
    position: 'top-center',
  },
);

const globalStore = useGlobalStore();
const toast = useUiToast();

const messages = computed(() => globalStore.getToastMessages);
const positionClass = computed(() => `position-${props.position}`);
</script>

<style scoped lang="scss">
.ui-toast {
  height: fit-content;
  position: fixed;
  z-index: 70;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.position-top-left {
    top: 1rem;
    left: 1rem;
  }
  &.position-top-center {
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
  &.position-top-right {
    top: 1rem;
    right: 1rem;
  }
  &.position-bottom-left {
    bottom: 1rem;
    left: 1rem;
  }
  &.position-bottom-center {
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
  }
  &.position-bottom-right {
    bottom: 1rem;
    right: 1rem;
  }

  .ui-toast-message {
    min-width: 20rem;
    border: 1px solid rgba(203, 213, 225, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 1rem;
    backdrop-filter: blur(0.75rem);
    padding: 1rem;
    background: var(--background-secondary);
    color: var(--neutral-100);
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      background: var(--linear-gradient-primary);
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      z-index: -1;
      animation: 3s ease-in-out infinite gradient-shimmer;
    }

    .content {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .summary {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .detail {
      margin: 0.125rem 0 0;
      font-size: 0.75rem;
      color: var(--neutral-300);
    }

    .close {
      border: none;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
      padding: 0;
    }

    &.severity-success {
      border-color: var(--tertiary-400);

      &::before {
        background: var(--linear-gradient-tertiary);
      }
    }

    &.severity-error {
      border-color: var(--primary-400);

      &::before {
        background: var(--linear-gradient-primary);
      }
    }

    &.severity-contrast {
      border-color: var(--secondary-400);

      &::before {
        background: var(--linear-gradient-secondary);
      }
    }
  }
}

@keyframes gradient-shimmer {
	0%,
	100% {
		opacity: 0.05;
		transform: translateX(-100%);
	}
	50% {
		opacity: 0.1;
		transform: translateX(100%);
	}
}

@media (max-width: 768px) {
  .ui-toast {
    top: 2rem !important;
    left: 0 !important;
    right: 0 !important;
    transform: none !important;
    padding: 0 1rem;
    width: 100% !important;

    .ui-toast-message {
      min-width: 100%;
    }
  }
}
</style>
