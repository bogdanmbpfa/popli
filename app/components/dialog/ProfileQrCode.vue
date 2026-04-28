<template>
  <div class="profile-qr-code-dialog">
    <div :id="`profile-qr-code-${handle}`" class="profile-qr-code" />

    <UiButton
      severity="contrast"
      icon="popli:download"
      label="Download"
      aria-label="Download QR Code"
      @click="downloadQRCode"
    />
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling from 'qr-code-styling';
const {
  public: { siteUrl },
} = useRuntimeConfig();

const props = defineProps<{
  handle: string;
}>();

const qrCodeStyling = ref<QRCodeStyling | null>(null);

onMounted(() => {
  qrCodeStyling.value = new QRCodeStyling({
    data: `${siteUrl}/${props.handle}`,
    width: 128,
    height: 128,
    image: `${siteUrl}/logo.png`,
    imageOptions: {
      imageSize: 0.5,
      hideBackgroundDots: true,
      margin: 2,
    },
    dotsOptions: {
      type: 'extra-rounded',
      color: '#0e0e12',
    },
    cornersSquareOptions: {
      type: 'extra-rounded',
      gradient: {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: '#ffb2be' },
          { offset: 100, color: '#e61a61' },
        ],
      },
    },
    cornersDotOptions: {
      type: 'extra-rounded',
      gradient: {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: '#ffb2be' },
          { offset: 100, color: '#e61a61' },
        ],
      },
    },
  });

  qrCodeStyling.value?.append(
    document.getElementById(`profile-qr-code-${props.handle}`) as HTMLElement,
  );
});

const downloadQRCode = () => {
  qrCodeStyling.value?.download({
    name: `@${props.handle} - My Popli Profile`,
    extension: 'png',
  });
};
</script>

<style lang="scss" scoped>
.profile-qr-code-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
</style>