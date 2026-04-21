<template>
  <div class="qrcode-generate">
    <div class="header">
      <span class="title">Create new QR Code</span>

      <span class="description">
        Generate a new QR Code for any type of content.
      </span>
    </div>

    <div class="content">
      <FormInput id="data-type" label="Type" size="half" required>
        <UiSelectButton
          v-model="type"
          class="type-select-button"
          fluid
          :options="typeOptions"
          option-label="label"
          option-value="value"
          :disabled="actionInProgress"
          @update:model-value="qrCodeOptions.data = undefined"
        >
          <template #option="{ option }">
            <Icon
              class="default"
              :name="dataTypeIcons[option.value as EQRCodeDataType]"
              size="1rem"
            />
            <span class="label">{{ option.label }}</span>
          </template>
        </UiSelectButton>
      </FormInput>

      <FormInput id="title" label="Title" size="half" required>
        <UiInputText
          id="title"
          v-model="title"
          fluid
          placeholder="My QR Code"
        />
      </FormInput>

      <FormInput id="data" label="Destination" required>
        <UiInputText
          v-if="type === EQRCodeDataType.URL"
          v-model="qrCodeData"
          id="data"
          type="url"
          fluid
          placeholder="https://example.com"
          :disabled="actionInProgress"
        />

        <UiInputText
          v-else-if="type === EQRCodeDataType.EMAIL"
          id="data"
          v-model="qrCodeData"
          type="email"
          fluid
          placeholder="example@example.com"
          :disabled="actionInProgress"
        />

        <UiInputText
          v-else-if="type === EQRCodeDataType.PHONE"
          id="data"
          v-model="qrCodeData"
          type="tel"
          fluid
          placeholder="1234567890"
          :disabled="actionInProgress"
        />

        <UiTextarea
          v-else
          id="data"
          v-model="qrCodeData"
          fluid
          placeholder="My QR Code"
          rows="3"
          :disabled="actionInProgress"
        />
      </FormInput>
    </div>

    <hr />

    <div class="preview">
      <span class="title">Preview</span>

      <div class="container">
        <div
          id="qr-code-canvas"
          :style="`width: ${qrCodeOptions.width}px; height: ${qrCodeOptions.height}px;`"
        />

        <span class="caption-title"> Sample QR Code Preview </span>

        <span class="caption-description">
          This QR Code is generated with sample content for preview purposes.
          <br />
          The actual content will be set when you generate the QR Code.
        </span>
      </div>
    </div>

    <UiButton
      severity="secondary"
      fluid
      icon="popli:settings-outline"
      label="Advanced Configuration"
      aria-label="Open advanced configuration dialog"
      :disabled="!title || !qrCodeData || actionInProgress"
      @click="openQrCodeAdvancedConfigurationDialog()"
    />

    <UiMessage v-if="formError" severity="error" fluid>
      {{ formError }}
    </UiMessage>

    <UiButton
      severity="contrast"
      fluid
      icon="popli:plus"
      label="Create QR Code"
      aria-label="Create QR Code"
      :loading="actionInProgress"
      :disabled="!title || !qrCodeData || actionInProgress"
      @click="generateQRCode"
    />
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling, { type Options } from 'qr-code-styling';

import QrCodeAdvancedConfigurationDialog from '~/components/dialog/QrCodeAdvancedConfiguration.vue';
import { EApiEndpoint, EQRCodeDataType } from '~~/enums';

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const uiDynamicDialog = useUiDynamicDialog();
const globalStore = useGlobalStore();
const qrCodeStore = useQrCodeStore();
const uiToast = useUiToast();

const dataTypeIcons = ref({
  [EQRCodeDataType.TEXT]: 'popli:text-box-outline',
  [EQRCodeDataType.URL]: 'popli:link-2',
  [EQRCodeDataType.EMAIL]: 'popli:email-outline',
  [EQRCodeDataType.PHONE]: 'popli:phone-outline',
});
const formError = ref<string | null>(null);
let qrCodeOptions = reactive<Options>({
  width: 128,
  height: 128,
  data: 'Preview QR Code',
  margin: 6,
  type: 'canvas',
  shape: 'square',
  image: undefined,
  qrOptions: {},
  imageOptions: {
    crossOrigin: 'anonymous',
    imageSize: 0.4,
    hideBackgroundDots: true,
    saveAsBlob: true,
  },
  dotsOptions: {
    color: '#000000',
    type: 'square',
  },
  cornersSquareOptions: {
    type: 'square',
    color: '#000000',
  },
  cornersDotOptions: {
    type: 'square',
    color: '#000000',
  },
  backgroundOptions: {
    color: 'white',
    round: 0,
  },
});
const qrCode = ref<QRCodeStyling | null>(null);
const qrCodeData = ref<string | null>(null);
const type = ref<EQRCodeDataType>(EQRCodeDataType.URL);
const title = ref('');

const typeOptions = [
  {
    label: 'Text',
    value: EQRCodeDataType.TEXT,
  },
  {
    label: 'URL',
    value: EQRCodeDataType.URL,
  },
  {
    label: 'Email',
    value: EQRCodeDataType.EMAIL,
  },
  {
    label: 'Phone',
    value: EQRCodeDataType.PHONE,
  },
];

const actionInProgress = computed(() => globalStore.getActionInProgress);
const data = computed(() => qrCodeStore.getData);

onMounted(() => {
  qrCode.value = new QRCodeStyling(qrCodeOptions);
  setTimeout(() => {
    qrCode.value?.append(
      document.getElementById('qr-code-canvas') as HTMLElement,
    );
  }, 300);
});

const openQrCodeAdvancedConfigurationDialog = () =>
  uiDynamicDialog.open({
    component: markRaw(QrCodeAdvancedConfigurationDialog),
    header: 'Advanced QR Code Configuration',
    props: {
      qrCodeOptions,
    },
    onClose: () => {
      qrCode.value = new QRCodeStyling(qrCodeOptions);
      qrCode.value?.append(
        document.getElementById('qr-code-canvas') as HTMLElement,
      );
    },
  });

const generateQRCode = async () => {
  globalStore.toggleActionInProgress();
  formError.value = null;

  if (!qrCodeData.value) {
    formError.value = 'Please enter a valid data';
    globalStore.toggleActionInProgress();
    return;
  }

  switch (type.value) {
    case EQRCodeDataType.EMAIL:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qrCodeData.value)) {
        formError.value = 'Invalid email address';
        globalStore.toggleActionInProgress();
        return;
      }
      break;

    case EQRCodeDataType.PHONE:
      if (!/^[0-9]+$/.test(qrCodeData.value)) {
        formError.value = 'Invalid phone number';
        globalStore.toggleActionInProgress();
        return;
      }
      break;

    case EQRCodeDataType.TEXT:
      break;

    case EQRCodeDataType.URL:
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(qrCodeData.value)) {
        formError.value = 'Invalid URL';
        globalStore.toggleActionInProgress();
        return;
      }
      break;

    default:
      break;
  }

  const { error } = await useApiMultipart(EApiEndpoint.QR_CODE_CREATE, {
    title: title.value,
    type: type.value,
    image: data.value?.image,
    options: JSON.stringify({ ...qrCodeOptions, data: qrCodeData.value }),
  });

  if (error) {
    formError.value = error.message;
    globalStore.toggleActionInProgress();
    return;
  }

  uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'QR Code created successfully',
    life: 3000,
    closable: false,
  });

  formError.value = null;
  type.value = EQRCodeDataType.URL;
  title.value = '';
  qrCodeData.value = null;
  qrCodeOptions = {
    width: 128,
    height: 128,
    data: 'Preview QR Code',
    margin: 6,
    type: 'canvas',
    shape: 'square',
    image: undefined,
    qrOptions: {},
    imageOptions: {
      crossOrigin: 'anonymous',
      imageSize: 0.4,
      hideBackgroundDots: true,
      saveAsBlob: true,
    },
    dotsOptions: {
      color: '#000000',
      type: 'square',
    },
    cornersSquareOptions: {
      type: 'square',
      color: '#000000',
    },
    cornersDotOptions: {
      type: 'square',
      color: '#000000',
    },
    backgroundOptions: {
      color: 'white',
      round: 0,
    },
  };
  qrCode.value = new QRCodeStyling(qrCodeOptions);
  qrCodeStore.setData(null);

  globalStore.toggleActionInProgress();

  return emit('refresh');
};

watch(
  qrCodeOptions,
  async (options) => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLElement;

    if (!options.data) {
      qrCode.value = null;
    } else {
      if (!qrCode.value) {
        qrCode.value = new QRCodeStyling(options);
        qrCode.value?.append(canvas);
      }

      qrCode.value?.update(options);
    }
  },
  { deep: true },
);
</script>

<style lang="scss" scoped>
.qrcode-generate {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: var(--background-secondary);
  padding: 1.5rem;
  border-radius: 0.25rem;

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

  .content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid
      color-mix(in oklab, var(--neutral-400) 20%, transparent);
    margin: 0;
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      border: 2px dashed
        color-mix(in oklab, var(--neutral-400) 20%, transparent);
      border-radius: 0.25rem;

      #qr-code-canvas {
        overflow: hidden;
        height: fit-content;
        width: fit-content;
        line-height: 1;
      }

      .caption-title {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--neutral-400);
      }

      .caption-description {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--neutral-400);
        text-align: center;
      }
    }
  }
}

@media (max-width: 768px) {
  .qrcode-generate {
    .content {
      flex-direction: column;

      :deep(.form-input) {
        width: 100%;
        max-width: 100%;

        .type-select-button {
          width: 100%;

          button {
            padding: 0.25rem 0.5rem;
          }
        }
      }
    }
  }
}
</style>
