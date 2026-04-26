<template>
  <div v-if="link" class="secondary-link">
    <div
      v-if="Number.isFinite(link.position) && (link.position! > 0 || link.position! < lastPosition)"
      class="position-buttons"
    >
      <UiButton
        v-if="Number.isFinite(link.position) && link.position! > 0"
        class="up-button"
        severity="help"
        icon="popli:arrow-up"
        title="Move up"
        aria-label="Move up"
        @click="onIncrementPosition"
      />
      <UiButton
        v-if="Number.isFinite(link.position) && link.position! < lastPosition"
        class="down-button"
        severity="help"
        icon="popli:arrow-down"
        title="Move down"
        aria-label="Move down"
        @click="onDecrementPosition"
      />
    </div>

    <div class="content">
      <FormInput id="title" label="Title" required>
        <UiInputText
          v-model="title"
          name="title"
          fluid
          placeholder="Title"
          @update:model-value="onTitleChange"
        />
      </FormInput>

      <div class="title-colors">
        <span class="title">Title Colors</span>

        <UiSelectButton
          v-model="titleColorType"
          :options="titleColorTypeOptions"
          option-label="label"
          option-value="value"
          @update:model-value="onTitleColorTypeChange($event as 'solid' | 'gradient')"
        />

        <div v-if="titleColorType === 'solid'" class="color-picker-container">
          <UiColorPicker
            v-model="titleSolidColor"
            fluid
            format="hex"
            @update:model-value="setTitleColor"
          />
          <UiInputText :value="titleSolidColor || ''" class="default" readonly />
        </div>

        <div v-if="titleColorType === 'gradient'" class="gradient-controls">
          <div class="gradient-stop">
            <div class="color-picker-container">
              <UiColorPicker
                id="title-color-gradient-0"
                v-model="titleGradientStartColor"
                fluid
                format="hex"
                @update:model-value="setTitleColor"
              />
            </div>

            <UiInputText
              name="title-color-gradient-0"
              readonly
              :value="titleGradientStartColor || ''"
            />
          </div>

          <div class="gradient-stop">
            <div class="color-picker-container">
              <UiColorPicker
                id="title-color-gradient-1"
                v-model="titleGradientEndColor"
                fluid
                format="hex"
                @update:model-value="setTitleColor"
              />
            </div>

            <UiInputText
              name="title-color-gradient-1"
              readonly
              :value="titleGradientEndColor || ''"
            />
          </div>
        </div>
      </div>

      <FormInput id="url" label="URL" required>
        <UiInputText
          v-model="url"
          name="url"
          fluid
          placeholder="URL"
          @update:model-value="onUrlChange"
        />
      </FormInput>

      <div class="background-image">
        <span class="title">Background Image</span>

        <FormFileUpload
          id="background-image"
          ref="backgroundImageUpload"
          accept="image/jpeg,image/png,image/webp"
          @select="onSelectBackgroundImage"
        />

        <span class="caption">
          Recommended size: 512x512px, JPG, PNG, WEBP
        </span>
      </div>

      <div class="background-colors">
        <span class="title">Background Colors</span>

        <UiSelectButton
          v-model="backgroundColorType"
          :options="backgroundColorTypeOptions"
          option-label="label"
          option-value="value"
        />

        <div
          v-if="backgroundColorType === 'solid'"
          class="color-picker-container"
        >
          <UiColorPicker
            id="background-color-solid-0"
            v-model="backgroundColors[0]"
            fluid
            format="hex"
            @update:model-value="setBackgroundColor($event, 0)"
          />
          <UiInputText
            :value="backgroundColors[0] || ''"
            name="background-color-solid-0"
            readonly
          />
        </div>

        <div
          v-if="backgroundColorType === 'gradient'"
          class="gradient-controls"
        >
          <div class="gradient-stop">
            <div class="color-picker-container">
              <UiColorPicker
                id="background-color-gradient-0"
                v-model="backgroundColors[0]"
                fluid
                format="hex"
                @update:model-value="setBackgroundColor($event, 0)"
              />
            </div>

            <UiInputText
              class="default"
              name="background-color-gradient-0"
              readonly
              :value="backgroundColors[0] || ''"
            />
          </div>

          <div class="gradient-stop">
            <div class="color-picker-container">
              <UiColorPicker
                id="background-color-gradient-1"
                v-model="backgroundColors[1]"
                fluid
                format="hex"
                @update:model-value="setBackgroundColor($event, 1)"
              />
            </div>

            <UiInputText
              name="background-color-gradient-1"
              readonly
              :value="backgroundColors[1] || ''"
            />
          </div>
        </div>
      </div>

      <UiButton
        severity="danger"
        icon="popli:times-outline"
        icon-position="left"
        icon-size="1.5rem"
        label="Delete link"
        aria-label="Delete"
        @click="onDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';

import type FileUpload from '~/components/form/FileUpload.vue';
import { EApiEndpoint } from '~~/enums';
import type { ILink } from '~~/interfaces';

const props = defineProps<{
  link: ILink;
  lastPosition: number;
}>();

const uiToast = useUiToast();
const urlStore = useUrlStore();

const backgroundImageUpload = ref<InstanceType<typeof FileUpload>>();
const title = ref<string>('');
const titleSolidColor = ref<string>('');
const titleGradientStartColor = ref<string>('');
const titleGradientEndColor = ref<string>('');
const titleColorType = ref<'solid' | 'gradient'>('solid');
const titleColorTypeOptions = ref<
  { label: string; value: 'solid' | 'gradient' }[]
>([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const backgroundImage = ref<File | null>(null);
const backgroundColors = ref<string[]>([]);
const backgroundSolidColor = ref<string>('');
const backgroundGradientStartColor = ref<string>('');
const backgroundGradientEndColor = ref<string>('');
const backgroundColorType = ref<'solid' | 'gradient'>('solid');
const backgroundColorTypeOptions = ref<
  { label: string; value: 'solid' | 'gradient' }[]
>([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const url = ref<string>('');

onMounted(async () => {
  title.value = props.link.title ?? '';
  if (props.link.titleColors) {
    titleSolidColor.value =
      props.link.titleColors.length === 1 ? props.link.titleColors[0]! : '';
    titleGradientStartColor.value =
      props.link.titleColors.length > 1 ? props.link.titleColors[0]! : '';
    titleGradientEndColor.value =
      props.link.titleColors.length > 1 ? props.link.titleColors[1]! : '';
  }
  backgroundColors.value = props.link.backgroundColors ?? [];
  url.value = props.link.url ?? '';

  if (props.link.backgroundImage) {
    try {
      const fileBuffer = await $fetch<ArrayBuffer>(
        props.link.backgroundImage as string,
        {
          responseType: 'arrayBuffer',
        },
      );

      if (fileBuffer) {
        const file = new File([fileBuffer], 'background-image.webp', {
          type: 'image/webp',
        });

        backgroundImage.value = file;
        backgroundImageUpload.value?.setFile(file);
      }
    } catch {
      backgroundImage.value = null;
    }
  }
});

const onDecrementPosition = () =>
  urlStore.decrementPosition(props.link.type, props.link);
const onIncrementPosition = () =>
  urlStore.incrementPosition(props.link.type, props.link);

const onTitleChange = debounce(
  (value: string | undefined) =>
    urlStore.updateLink(props.link.type, {
      ...props.link,
      title: value,
    }),
  200,
);

const onTitleColorTypeChange = (value: 'solid' | 'gradient') => {
  urlStore.updateLink(props.link.type, {
    ...props.link,
    titleColors:
      value === 'solid'
        ? titleSolidColor.value
          ? [titleSolidColor.value]
          : undefined
        : titleGradientStartColor.value && titleGradientEndColor.value
        ? [titleGradientStartColor.value, titleGradientEndColor.value]
        : undefined,
  });
};

const setTitleColor = () => {
  urlStore.updateLink(props.link.type, {
    ...props.link,
    titleColors:
      titleColorType.value === 'solid'
        ? titleSolidColor.value
          ? [titleSolidColor.value]
          : undefined
        : titleGradientStartColor.value && titleGradientEndColor.value
        ? [titleGradientStartColor.value, titleGradientEndColor.value]
        : undefined,
  });
};

const setBackgroundColor = (value: string, index: number) => {
  backgroundColors.value[index] = value;
  urlStore.updateLink(props.link.type, {
    ...props.link,
    backgroundColors: backgroundColors.value,
  });
};

const onSelectBackgroundImage = (file: File) => {
  backgroundImage.value = file;
  urlStore.updateLink(props.link.type, {
    ...props.link,
    backgroundImage: file,
  });
};

const onUrlChange = debounce(
  (value: string | undefined) =>
    urlStore.updateLink(props.link.type, {
      ...props.link,
      url: value,
    }),
  200,
);

const onDelete = async () => {
  const { error } = await useApiJson(
    EApiEndpoint.URL_LINK_DELETE,
    {},
    {},
    { id: props.link.id },
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  urlStore.deleteLink(props.link.type, props.link);

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Link deleted successfully',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
.secondary-link {
  width: 100%;
  display: flex;
  gap: 0.5rem;

  .position-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    :deep(.ui-button) {
      padding: 0.25rem 0.5rem;

      .iconify {
        font-size: 0.75rem;
      }
    }
  }

  .content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
    border-radius: 0.5rem;

    .title-colors {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--neutral-100);
      }

      .radio-group {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
      }

      .color-picker-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }

      .gradient-controls {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;

        .gradient-stop {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }

    .background-image {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--neutral-100);
      }

      .caption {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--neutral-400);
      }
    }

    .background-colors {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--neutral-100);
      }

      .radio-group {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
      }

      .color-picker-container {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }

      .gradient-controls {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;

        .gradient-stop {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }
      }
    }
  }
}
</style>
