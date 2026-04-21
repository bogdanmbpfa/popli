<template>
  <div class="qr-code-page">
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
  layout: 'account',
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
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  flex: 1;
  position: relative;
}
</style>
