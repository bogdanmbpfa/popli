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
        <LazyQrcodeGenerate :count="qrCodeCount" @refresh="refresh" />
      </template>

      <template #panel-manage>
        <LazyQrcodeManage :qr-codes="qrCodes" @refresh="refresh" />
      </template>
    </UiTabs>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const {
  public: { errorMessages },
} = useRuntimeConfig();
const userStore = useUserStore();
const uiToast = useUiToast();

const tab = ref<'generate' | 'manage'>('generate');

const { data: qrCodes, refresh: refreshQrCodes } = await useAsyncData(
  'qr-codes',
  () => useApiJson(EApiEndpoint.QR_CODE_GET),
  { default: () => [], transform: (data) => data.data ?? [] },
);
const { data: qrCodeCount, refresh: refreshQrCodeCount } = await useAsyncData(
  'qr-code-count',
  () => useApiJson(EApiEndpoint.ACCOUNT_COUNTERS),
  { default: () => 0, transform: (data) => data.data?.qrCodeCount ?? 0 },
);

const user = computed(() => userStore.getUser);

onMounted(async () => {
  if (user.value && !user.value.emailConfirmedAt) {
    uiToast.add({
      severity: 'info',
      detail: errorMessages.emailNotConfirmed,
      life: 3000,
    });
  }
});

const refresh = async () => {
  await refreshQrCodes();
  await refreshQrCodeCount();
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
