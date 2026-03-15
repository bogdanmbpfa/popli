<template>
  <div v-if="link" class="secondary-link">
    <div class="position-buttons">
      <PButton
        v-if="Number.isFinite(link.position) && link.position! > 0"
        class="default up-button"
        severity="info"
        icon="pi pi-arrow-up"
        title="Move up"
        @click="onIncrementPosition"
      />
      <PButton
        v-if="Number.isFinite(link.position) && link.position! < lastPosition"
        class="default down-button"
        severity="info"
        icon="pi pi-arrow-down"
        title="Move down"
        @click="onDecrementPosition"
      />
    </div>

    <div class="content">
      <FormInput id="title" label="Title" required>
        <PInputText
          v-model="title"
          name="title"
          class="default"
          fluid
          placeholder="Title"
          @update:model-value="onTitleChange"
        />
      </FormInput>

      <div class="title-colors">
        <span class="title">Title Colors</span>

        <div class="radio-group">
          <div class="radio-button-item">
            <PRadioButton
              v-model="titleColorType"
              input-id="title-colors-solid"
              name="titleColors"
              class="default"
              value="solid"
            />
            <label for="title-colors-solid">Solid</label>
          </div>

          <div class="radio-button-item">
            <PRadioButton
              v-model="titleColorType"
              input-id="title-colors-gradient"
              name="titleColors"
              class="default"
              value="gradient"
            />
            <label for="title-colors-gradient">Gradient</label>
          </div>
        </div>

        <div v-if="titleColorType === 'solid'" class="color-picker-container">
          <PColorPicker
            v-model="titleColors[0]"
            class="default"
            overlay-class="default"
            fluid
            format="hex"
            @change="setTitleColor($event, 0)"
          />
          <PInputText
            :value="titleColors[0] ? `#${titleColors[0]}` : ''"
            class="default"
            readonly
          />
        </div>

        <div v-if="titleColorType === 'gradient'" class="gradient-controls">
          <div class="gradient-stop">
            <div class="color-picker-container">
              <PColorPicker
                id="title-color-gradient-0"
                v-model="titleColors[0]"
                class="default"
                overlay-class="default"
                fluid
                format="hex"
                @change="setTitleColor($event, 0)"
              />
            </div>

            <PInputText
              class="default"
              input-class="default"
              readonly
              :value="titleColors[0] ? `#${titleColors[0]}` : ''"
            />
          </div>

          <div class="gradient-stop">
            <div class="color-picker-container">
              <PColorPicker
                id="title-color-gradient-1"
                v-model="titleColors[1]"
                class="default"
                overlay-class="default"
                fluid
                format="hex"
                @change="setTitleColor($event, 1)"
              />
            </div>

            <PInputText
              class="default"
              input-class="default"
              readonly
              :value="titleColors[1] ? `#${titleColors[1]}` : ''"
            />
          </div>
        </div>
      </div>

      <FormInput id="url" label="URL" required>
        <PInputText
          v-model="url"
          name="url"
          class="default"
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

        <div class="radio-group">
          <div class="radio-button-item">
            <PRadioButton
              v-model="backgroundColorType"
              input-id="background-colors-solid"
              name="backgroundColors"
              class="default"
              value="solid"
            />
            <label for="background-colors-solid">Solid</label>
          </div>

          <div class="radio-button-item">
            <PRadioButton
              v-model="backgroundColorType"
              input-id="background-colors-gradient"
              name="backgroundColors"
              class="default"
              value="gradient"
            />
            <label for="background-colors-gradient">Gradient</label>
          </div>
        </div>

        <div
          v-if="backgroundColorType === 'solid'"
          class="color-picker-container"
        >
          <PColorPicker
            v-model="backgroundColors[0]"
            class="default"
            overlay-class="default"
            fluid
            format="hex"
            @change="setBackgroundColor($event, 0)"
          />
          <PInputText
            :value="backgroundColors[0] ? `#${backgroundColors[0]}` : ''"
            class="default"
            readonly
          />
        </div>

        <div
          v-if="backgroundColorType === 'gradient'"
          class="gradient-controls"
        >
          <div class="gradient-stop">
            <div class="color-picker-container">
              <PColorPicker
                id="background-color-gradient-0"
                v-model="backgroundColors[0]"
                class="default"
                overlay-class="default"
                fluid
                format="hex"
                @change="setBackgroundColor($event, 0)"
              />
            </div>

            <PInputText
              class="default"
              input-class="default"
              readonly
              :value="backgroundColors[0] ? `#${backgroundColors[0]}` : ''"
            />
          </div>

          <div class="gradient-stop">
            <div class="color-picker-container">
              <PColorPicker
                id="background-color-gradient-1"
                v-model="backgroundColors[1]"
                class="default"
                overlay-class="default"
                fluid
                format="hex"
                @change="setBackgroundColor($event, 1)"
              />
            </div>

            <PInputText
              class="default"
              input-class="default"
              readonly
              :value="backgroundColors[1] ? `#${backgroundColors[1]}` : ''"
            />
          </div>
        </div>
      </div>
    </div>

    <PButton
      class="default"
      severity="info"
      icon="pi pi-times"
      title="Delete"
      @click="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash';
import type { ColorPickerChangeEvent } from 'primevue/colorpicker';

import type FileUpload from '~/components/form/FileUpload.vue';
import { EApiEndpoint } from '~~/enums';
import type { ILink } from '~~/interfaces';

const props = defineProps<{
  link: ILink;
  lastPosition: number;
}>();

const toast = useToast();
const urlStore = useUrlStore();

const backgroundImageUpload = ref<InstanceType<typeof FileUpload>>();
const title = ref<string>('');
const titleColors = ref<string[]>([]);
const titleColorType = ref<'solid' | 'gradient'>('solid');
const backgroundImage = ref<File | null>(null);
const backgroundColors = ref<string[]>([]);
const backgroundColorType = ref<'solid' | 'gradient'>('solid');
const url = ref<string>('');

onMounted(async () => {
  title.value = props.link.title ?? '';
  titleColors.value = props.link.titleColors ?? [];
  backgroundColors.value = props.link.backgroundColors ?? [];
  url.value = props.link.url ?? '';

  if (props.link.backgroundImage) {
    const { data } = await useApiJson(EApiEndpoint.URL_LINK_BACKGROUND_IMAGE, {
      id: props.link.id,
    });
    backgroundImage.value = data
      ? new File([data.buffer], 'background-image.webp')
      : null;
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

const setTitleColor = (event: ColorPickerChangeEvent, index: number) => {
  titleColors.value[index] = event.value;
  urlStore.updateLink(props.link.type, {
    ...props.link,
    titleColors: titleColors.value,
  });
};

const setBackgroundColor = (event: ColorPickerChangeEvent, index: number) => {
  backgroundColors.value[index] = event.value;
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
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  urlStore.deleteLink(props.link.type, props.link);

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Link deleted successfully',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
@use '../../assets/mixins.scss' as *;

.secondary-link {
  width: 100%;
  display: flex;
  gap: 0.5rem;

  .position-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    :deep(.p-button) {
      padding: 0 0.5rem;

      .p-button-icon {
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
    border: 1px solid var(--border-1);
    @include squircle(1.5rem);

    .title-colors {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-100);
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
        color: var(--text-100);
      }

      .caption {
        font-size: 0.75rem;
        font-weight: 400;
        color: var(--text-300);
      }
    }

    .background-colors {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .title {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--text-100);
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
