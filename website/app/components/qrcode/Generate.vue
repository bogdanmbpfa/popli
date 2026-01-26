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
        <PSelect
          id="data-type"
          v-model="type"
          class="default"
          overlay-class="default"
          fluid
          :options="typeOptions"
          :option-label="(option) => option.label"
          :option-value="(option) => option.value"
          @value-change="qrCodeOptions.data = undefined"
        />
      </FormInput>

      <FormInput id="title" label="Title" size="half" required>
        <PInputText
          id="title"
          v-model="title"
          class="default"
          overlay-class="default"
          fluid
        />
      </FormInput>

      <FormInput id="data" label="Data" required>
        <PInputText
          v-if="type === 'url'"
          id="data"
          v-model="qrCodeData"
          type="url"
          class="default"
          overlay-class="default"
          fluid
          placeholder="https://example.com"
        />

        <PInputText
          v-else-if="type === 'email'"
          id="data"
          v-model="qrCodeData"
          type="email"
          class="default"
          overlay-class="default"
          fluid
          placeholder="example@example.com"
        />

        <PInputText
          v-else-if="type === 'phone'"
          id="data"
          v-model="qrCodeData"
          type="tel"
          class="default"
          overlay-class="default"
          fluid
          placeholder="1234567890"
        />

        <PTextarea
          v-else
          id="data"
          v-model="qrCodeData"
          class="default"
          overlay-class="default"
          fluid
          placeholder="My QR Code"
          rows="3"
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

    <PButton
      type="button"
      class="default"
      severity="secondary"
      fluid
      icon="pi pi-cog"
      label="Advanced Configuration"
      :disabled="!title || !qrCodeData"
      @click="openQrCodeAdvancedConfigurationDialog"
    />

    <PButton
      type="button"
      class="default"
      severity="contrast"
      fluid
      icon="pi pi-plus"
      label="Create QR Code"
      :disabled="!title || !qrCodeData"
      @click="generateQRCode"
    />
  </div>
</template>

<script setup lang="ts">
import QRCodeStyling, { type Options } from 'qr-code-styling';

import { EApiEndpoint, EQRCodeDataType } from '~~/enums';

const QrCodeAdvancedConfigurationDialog = defineAsyncComponent(
  () => import('~/components/dialog/QrCodeAdvancedConfiguration.vue'),
);

const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

const dialog = useDialog();
const qrCodeStore = useQrCodeStore();
const toast = useToast();

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
  dialog.open(QrCodeAdvancedConfigurationDialog, {
    data: qrCodeOptions,
    props: {
      blockScroll: true,
      closable: false,
      closeOnEscape: false,
      dismissableMask: false,
      draggable: false,
      header: 'Advanced QR Code Configuration',
      modal: true,
      position: 'center',
      pt: { root: { class: 'default' } },
      style: { width: '40rem' },
    },
    onClose: () => {},
  });

const generateQRCode = async () => {
  if (!qrCodeData.value) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: 'Please enter a valid data',
      life: 3000,
      closable: false,
    });
  }

  switch (type.value) {
    case EQRCodeDataType.EMAIL:
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(qrCodeData.value)) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: 'Invalid email address',
          life: 3000,
          closable: false,
        });
      }
      break;

    case EQRCodeDataType.PHONE:
      if (!/^[0-9]+$/.test(qrCodeData.value)) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: 'Invalid phone number',
          life: 3000,
          closable: false,
        });
      }
      break;

    case EQRCodeDataType.TEXT:
      break;

    case EQRCodeDataType.URL:
      if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(qrCodeData.value)) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: 'Invalid URL',
          life: 3000,
          closable: false,
        });
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
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
      closable: false,
    });
  }

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'QR Code created successfully',
    life: 3000,
    closable: false,
  });

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
@use '../../assets/mixins.scss' as *;

.qrcode-generate {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  backdrop-filter: blur(1.5rem) saturate(180%);
  -webkit-backdrop-filter: blur(1.5rem) saturate(180%);
  background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
  padding: 1.5rem;
  @include squircle(1.5rem);
  border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);

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

  .content {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid
      color-mix(in oklab, var(--color-gray-700) 30%, transparent);
    margin: 0;
  }

  .appearance {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-neutral-100);
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .control-section,
      .advanced-control-section {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .title {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--color-neutral-100);
        }

        .button-group {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0.5rem;

          :deep(.p-button) {
            min-width: 8rem;

            &.classic {
              .p-button-icon {
                color: var(--color-black);
              }
            }

            &.blue {
              .p-button-icon {
                color: var(--color-blue-600);
              }
            }

            &.purple {
              .p-button-icon {
                color: var(--color-purple-600);
              }
            }

            &.pink {
              .p-button-icon {
                color: var(--color-pink-600);
              }
            }

            &.darkMode {
              .p-button-icon {
                color: var(--color-gray-600);
              }
            }

            &.ocean {
              .p-button-icon {
                color: var(--color-blue-500);
              }
            }

            &.forest {
              .p-button-icon {
                color: var(--color-green-600);
              }
            }

            &.sunset {
              .p-button-icon {
                color: var(--color-orange-700);
              }
            }
          }
        }

        .section-header {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;

          .title {
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--text-100);
          }
        }

        .radio-group {
          display: flex;
          flex-direction: row;
          gap: 1rem;
        }

        .color-picker-container {
          width: fit-content;
          background-color: color-mix(
            in oklab,
            var(--color-gray-900) 40%,
            transparent
          );
          border-radius: 0.5rem;
          padding: 0.5rem;
        }

        .gradient-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .slider-control {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 1rem;

            .title {
              font-size: 0.75rem;
              font-weight: 400;
              color: var(--text-100);
            }

            :deep(.p-slider) {
              width: 10rem;
            }

            .value-display {
              font-size: 0.75rem;
              font-weight: 400;
              color: var(--text-100);
            }
          }

          .gradient-stops {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1rem;

            .gradient-stop {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 1rem;

              .color-picker-container {
                padding: 0.5rem;
                background-color: var(--background-2);
                border-radius: 0.5rem;
              }

              .slider-control {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 1rem;

                :deep(.p-slider) {
                  width: 10rem;
                }

                .value-display {
                  font-size: 0.75rem;
                  font-weight: 400;
                  color: var(--text-100);
                }
              }
            }
          }
        }

        .file-upload-area {
          width: 100%;
          padding: 1rem;
          border: 2px dashed var(--border-1);
          border-radius: 0.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          position: relative;

          input {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            opacity: 0;
          }

          .upload-text {
            font-size: 1rem;
            font-weight: 400;
            color: var(--text-100);
          }

          .upload-description {
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--text-300);
          }
        }

        .file-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .preview-content {
            border: 1px solid var(--border-1);
            border-radius: 0.5rem;
            padding: 1rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;

            .preview-info {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 0.5rem;

              img {
                border-radius: 0.5rem;
                overflow: hidden;
              }

              .info-text {
                display: flex;
                flex-direction: column;

                .title {
                  font-size: 0.825rem;
                  font-weight: 500;
                  color: var(--text-100);
                }

                .description {
                  font-size: 0.75rem;
                  font-weight: 400;
                  color: var(--text-300);
                }
              }
            }
          }
        }

        .advanced-options {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
      }

      .advanced-control-section {
        padding: 1rem;
        border: 1px solid var(--border-1);
        border-radius: 0.5rem;
      }
    }
  }

  .preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    .title {
      font-size: 1rem;
      font-weight: 500;
      color: var(--color-neutral-100);
    }

    .container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 2rem;
      background-color: color-mix(
        in oklab,
        var(--color-gray-900) 40%,
        transparent
      );
      @include squircle(1.5rem);
      border: 2px dashed
        color-mix(in oklab, var(--color-gray-700) 30%, transparent);

      #qr-code-canvas {
        overflow: hidden;
        height: fit-content;
        width: fit-content;
        line-height: 1;
      }

      .caption-title {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--color-neutral-400);
      }

      .caption-description {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--color-neutral-400);
        text-align: center;
      }
    }
  }
}
</style>
