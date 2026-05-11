<template>
  <Teleport to="body">
    <div
      v-if="isVisible"
      class="ui-dynamic-dialog-overlay"
      :class="{
        'width-fit': options?.widthFit,
        'hide-close-button': options?.hideCloseButton,
        'hide-overflow': options?.hideOverflow,
      }"
    >
      <div
        class="ui-dynamic-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="options?.header?.trim() ? dialogTitleId : undefined"
        :aria-label="options?.header?.trim() ? undefined : 'Dialog'"
        v-bind="$attrs"
      >
        <h1 v-if="options?.header?.trim()" :id="dialogTitleId" class="title">
          {{ options.header }}
        </h1>

        <UiButton
          class="close-button naked"
          severity="help"
          icon="popli:times-outline"
          icon-size="1.5rem"
          aria-label="Close"
          @click="onClose"
        />

        <slot />

        <component
          :is="options?.component"
          v-if="options?.component"
          v-bind="options?.props"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';

const dialogTitleId = useId();

const globalStore = useGlobalStore();
const uiDynamicDialog = useUiDynamicDialog();

const options = computed(() => globalStore.getDynamicDialogOptions);
const isVisible = computed(() => Boolean(options.value));

const onClose = () => {
  options.value?.onClose?.();

  return uiDynamicDialog.close();
};
</script>

<style scoped lang="scss">
.ui-dynamic-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  backdrop-filter: blur(0.25rem);

  .ui-dynamic-dialog {
    width: min(40rem, 95vw);
    max-height: calc(100lvh - 1rem);
    scrollbar-width: thin;
    pointer-events: all;
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
    border-radius: 0.75rem;
    background: var(--background-primary);
    padding: 2rem;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .title {
      color: var(--neutral-100);
      font-size: 1.25rem;
      font-weight: 500;
      width: 100%;
      text-align: center;
    }

    .close-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
    }
  }

  &.hide-overflow {
    .ui-dynamic-dialog {
      pointer-events: all;
      overflow-y: auto;
    }
  }

  &.width-fit {
    .ui-dynamic-dialog {
      width: fit-content;
    }
  }

  &.hide-close-button {
    .ui-dynamic-dialog {
      .close-button {
        display: none;
      }
    }
  }
}
</style>
