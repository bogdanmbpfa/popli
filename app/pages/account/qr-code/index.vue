<template>
  <div class="qr-code-page">
    <div class="heading">
      <span class="title">QR Code</span>

      <span class="description">Create a QR code for your account.</span>
    </div>

    <UiTabs
      v-model:value="tab"
      :tabs="[
        { value: 'generate', label: 'Generate' },
        { value: 'manage', label: 'Manage' },
      ]"
    >
      <template #panel-generate>
        <QrcodeGenerate @refresh="refreshQrCodes" />
      </template>

      <template #panel-manage>
        <QrcodeManage ref="qrCodeManage" />
      </template>
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
import type QrCodeManage from '~/components/qrcode/Manage.vue';

definePageMeta({
  layout: 'default',
  middleware: 'is-logged-in',
});

const tab = ref<'generate' | 'manage'>('generate');
const qrCodeManage = ref<InstanceType<typeof QrCodeManage> | null>(null);

const refreshQrCodes = async () => {
  if (qrCodeManage.value) {
    await qrCodeManage.value.getQrCodes();
  }
};
</script>

<style lang="scss" scoped>
.qr-code-page {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2rem;
  padding: 2rem 0;

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .description {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--neutral-400);
    }
  }
}
</style>
