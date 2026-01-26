<template>
  <div class="qrcode-manage">
    <div class="header">
      <span class="title">Manage QR Codes</span>

      <span class="description">View and manage all your QR Codes</span>
    </div>

    <div v-if="qrCodes && qrCodes.length" class="qrcode-list">
      <QrcodeItem
        v-for="qrCode in qrCodes"
        :key="qrCode.id"
        :qr-code="qrCode"
        @delete="handleDeleteQrCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';
import type { IQrCode } from '~~/interfaces';

const confirm = useConfirm();
const toast = useToast();

const qrCodes = ref<IQrCode[]>([]);

onMounted(async () => {
  await getQrCodes();
});

const getQrCodes = async () => {
  const { data, error } = await useApiJson(EApiEndpoint.QR_CODE_GET, {});

  if (error) return;

  qrCodes.value = data;
};

const handleDeleteQrCode = async (id: string) => {
  confirm.require({
    header: 'Delete QR Code',
    message: 'Are you sure you want to delete this QR code?',
    acceptClass: 'default p-button-danger',
    acceptLabel: 'Delete',
    blockScroll: true,
    modal: true,
    position: 'center',
    rejectClass: 'default',
    rejectLabel: 'Cancel',
    accept: async () => {
      const { error } = await useApiJson(
        EApiEndpoint.QR_CODE_DELETE,
        {},
        {},
        { id },
      );

      if (error) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: error.message,
        });
      }

      await getQrCodes();

      return toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'QR code deleted successfully',
      });
    },
  });
};

defineExpose({ getQrCodes });
</script>

<style lang="scss" scoped>
@use '../../assets/mixins.scss' as *;

.qrcode-manage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-neutral-100);
    }

    .description {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--color-neutral-400);
    }
  }

  .qrcode-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
