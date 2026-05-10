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
        @refresh="emit('refresh')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IQrCode } from '~~/interfaces';

defineProps<{
  qrCodes: IQrCode[];
}>();

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();
</script>

<style lang="scss" scoped>
.qrcode-manage {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem;

  .header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .description {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--neutral-400);
    }
  }

  .qrcode-list {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }
}
</style>
