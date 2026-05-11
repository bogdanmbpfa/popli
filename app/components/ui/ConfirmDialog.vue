<template>
  <Teleport to="body">
    <div v-if="isVisible" class="ui-dialog-overlay">
      <div
        class="ui-dialog"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="resolvedHeader?.trim() ? dialogHeadingId : undefined"
        :aria-label="resolvedHeader?.trim() ? undefined : 'Confirmation'"
        v-bind="$attrs"
      >
        <h3 v-if="resolvedHeader?.trim()" :id="dialogHeadingId">
          {{ resolvedHeader }}
        </h3>

        <p v-if="resolvedMessage">{{ resolvedMessage }}</p>

        <div class="actions">
          <UiButton
            type="button"
            :severity="options?.rejectSeverity"
            :label="resolvedRejectLabel"
            :aria-label="resolvedRejectLabel"
            @click="onReject"
          />

          <UiButton
            type="button"
            :severity="options?.acceptSeverity"
            :label="resolvedAcceptLabel"
            :aria-label="resolvedAcceptLabel"
            @click="onAccept"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue';

const dialogHeadingId = useId();

const props = withDefaults(
  defineProps<{
    visible?: boolean;
    header?: string;
    message?: string;
    acceptLabel?: string;
    rejectLabel?: string;
  }>(),
  {
    visible: undefined,
    header: '',
    message: '',
    acceptLabel: 'Confirm',
    rejectLabel: 'Cancel',
  },
);

const emit = defineEmits<{ accept: []; reject: [] }>();

const globalStore = useGlobalStore();
const uiConfirmDialog = useUiConfirmDialog();

const options = computed(() => globalStore.getConfirmDialogOptions);
const isVisible = computed(() => props.visible ?? Boolean(options.value));
const resolvedHeader = computed(() => options.value?.header || props.header);
const resolvedMessage = computed(() => options.value?.message || props.message);
const resolvedAcceptLabel = computed(
  () => options.value?.acceptLabel || props.acceptLabel,
);
const resolvedRejectLabel = computed(
  () => options.value?.rejectLabel || props.rejectLabel,
);

const onAccept = () => {
  if (options.value) {
    return uiConfirmDialog.accept();
  }

  return emit('accept');
};

const onReject = () => {
  if (options.value) {
    return uiConfirmDialog.reject();
  }

  return emit('reject');
};
</script>

<style scoped lang="scss">
.ui-dialog-overlay {
  padding: 1rem 0;
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.6);
}

.ui-dialog {
  background-color: var(--background-primary);
  border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
  box-shadow: var(--box-shadow-tertiary);
  border-radius: 1rem;
  max-height: calc(100lvh - 1rem);
  max-width: min(30rem, calc(100lvw - 1rem));
  overflow-y: auto;
  position: relative;
  width: 100%;
  padding: 1.5rem;

  h3 {
    color: var(--neutral-100);
    text-align: center;
    margin: 0 0 0.75rem;
  }

  p {
    text-align: center;
    color: var(--neutral-400);
    font-size: 0.875rem;
    margin: 0;
  }

  .actions {
    padding-top: 1.5rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;

    button {
      width: 100%;
      border: none;
      border-radius: 0.25rem;
      padding: 0.75rem;
    }
  }
}

@media (max-width: 768px) {
  .ui-dialog {
    width: 100% !important;
    max-width: calc(100lvw - 1rem) !important;
    max-height: 60lvh !important;
  }
}
</style>
