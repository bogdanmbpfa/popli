<template>
  <div v-if="qrCode" class="qrcode-item">
    <div class="content">
      <div :id="`qr-code-canvas-${qrCode.id}`" class="qr-code-canvas" />

      <div class="info">
        <span class="title">
          {{ qrCode.title }}
        </span>

        <span class="data">
          {{ qrCode.options.data }}
        </span>

        <span class="scans-date">
          Total Scans<br />
          <span class="value">
            {{
              Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
                roundingMode: 'floor',
              }).format(qrCode.totalScans)
            }}
          </span>
        </span>
      </div>
    </div>

    <div class="actions">
      <PButton
        class="default"
        severity="secondary"
        label="PNG"
        title="Download PNG"
        @click="downloadCode('png')"
      />

      <PButton
        class="default"
        severity="secondary"
        label="SVG"
        title="Download SVG"
        @click="downloadCode('svg')"
      />

      <PButton
        class="default"
        severity="secondary"
        label="JPEG"
        title="Download JPEG"
        @click="downloadCode('jpeg')"
      />

      <PButton
        class="default"
        severity="secondary"
        icon="pi pi-chart-bar"
        title="Analytics"
        @click="openAnalyticsDialog"
      />

      <PButton
        class="default"
        severity="danger"
        icon="pi pi-trash"
        title="Delete"
        @click="handleDeleteQrCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling from 'qr-code-styling';

import { EApiEndpoint, EQRCodeDataType } from '~~/enums';
import type { IQrCode } from '~~/interfaces';

const QrCodeAnalyticsDialog = defineAsyncComponent(
  () => import('~/components/dialog/QrCodeAnalytics.vue'),
);

const props = defineProps<{
  qrCode: IQrCode;
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const confirm = useConfirm();
const dialog = useDialog();
const toast = useToast();

const qrCodeStyling = ref<QRCodeStyling | null>(null);
const largeQrCodeStyling = ref<QRCodeStyling | null>(null);

const computedData = computed(() => {
  if (!props.qrCode.options.data) return '';

  switch (props.qrCode.dataType) {
    case EQRCodeDataType.TEXT:
      return props.qrCode.options.data;
    case EQRCodeDataType.URL:
      return new URL(props.qrCode.options.data).href;
    case EQRCodeDataType.EMAIL:
      return `mailto:${props.qrCode.options.data}`;
    case EQRCodeDataType.PHONE:
      return `tel:${props.qrCode.options.data}`;
    default:
      return props.qrCode.options.data;
  }
});

onMounted(() => {
  qrCodeStyling.value = new QRCodeStyling({
    ...props.qrCode.options,
    data: computedData.value,
    height: 128,
    width: 128,
    image: props.qrCode.imageUrl ?? undefined,
  });
  largeQrCodeStyling.value = new QRCodeStyling({
    ...props.qrCode.options,
    data: computedData.value,
    image: props.qrCode.imageUrl ?? undefined,
  });
  qrCodeStyling.value?.append(
    document.getElementById(`qr-code-canvas-${props.qrCode.id}`) as HTMLElement,
  );
});

const downloadCode = async (type: 'png' | 'svg' | 'jpeg') => {
  if (!largeQrCodeStyling.value) return;

  await largeQrCodeStyling.value.download({
    name: props.qrCode.title,
    extension: type,
  });
};

const openAnalyticsDialog = () =>
  dialog.open(QrCodeAnalyticsDialog, {
    data: { qrCodeId: props.qrCode.id },
    props: {
      blockScroll: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      header: props.qrCode.title,
      modal: true,
      position: 'center',
      closeButtonProps: {
        class: 'default p-button-secondary',
      },
      pt: { root: { class: 'default' } },
      style: { width: '50rem' },
    },
  });

const handleDeleteQrCode = async () => {
  confirm.require({
    header: 'Delete QR Code',
    message: 'Are you sure you want to delete this QR code?',
    acceptClass: 'default p-button-danger',
    acceptLabel: 'Delete',
    blockScroll: true,
    modal: true,
    position: 'center',
    rejectClass: 'default p-button-secondary',
    rejectLabel: 'Cancel',
    accept: async () => {
      const { error } = await useApiJson(
        EApiEndpoint.QR_CODE_DELETE,
        {},
        {},
        { id: props.qrCode.id },
      );

      if (error) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: error.message,
        });
      }

      emit('refresh');

      return toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'QR code deleted successfully',
      });
    },
  });
};
</script>

<style lang="scss" scoped>
.qrcode-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 0.5rem;
  background-color: var(--background-secondary);
  border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
  padding: 1rem;
  width: fit-content;

  .content {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 1rem;
    width: 100%;
    overflow: hidden;

    .info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      text-wrap: pretty;

      .title {
        font-size: 1.25rem;
        font-weight: 500;
        color: var(--neutral-100);
      }

      .data,
      .scans-date {
        font-size: 0.875rem;
        font-weight: 400;
        color: var(--neutral-400);
      }

      .scans-date {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;

        .value {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--primary-400);
        }
      }
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .qrcode-item {
    flex: 1;

    .actions {
      justify-content: space-between;

      :deep(.p-button) {
        &:not(.p-button-icon-only) {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
      }
    }
  }
}
</style>
