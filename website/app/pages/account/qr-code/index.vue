<template>
  <div class="qr-code-page">
      <PTabs v-model:value="tab" class="default">
        <PTabList>
          <PTab value="generate">
            <Icon
              :class="tab === 'generate' ? 'danger' : 'default'"
              name="popli:plus"
              size="1rem"
            />
            Create new
          </PTab>
          <PTab value="manage">
            <Icon
              :class="tab === 'manage' ? 'danger' : 'default'"
              name="popli:qrcode"
              size="1rem"
            />
            Manage QR Codes
          </PTab>
        </PTabList>

        <PTabPanels>
          <PTabPanel value="generate">
            <QrcodeGenerate @refresh="refreshQrCodes" />
          </PTabPanel>

          <PTabPanel value="manage">
            <QrcodeManage ref="qrCodeManage" />
          </PTabPanel>
        </PTabPanels>
      </PTabs>
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
