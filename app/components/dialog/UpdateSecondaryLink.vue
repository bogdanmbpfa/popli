<template>
  <form @submit.prevent="onSubmit">
    <FormInput id="title" label="Title" required :error="errors.title">
      <UiInputText
        v-model="title"
        v-bind="titleAttributes"
        id="title"
        name="title"
        fluid
        placeholder="Title"
        :invalid="!!errors.title"
        :disabled="isSubmitting || actionInProgress"
      />
    </FormInput>

    <div class="title-colors">
      <span class="title">Title Colors</span>

      <UiSelectButton
        v-model="titleColorType"
        v-bind="titleColorTypeAttributes"
        id="title-color-type"
        name="title-color-type"
        :options="titleColorTypeOptions"
        option-label="label"
        option-value="value"
        :invalid="!!errors.titleColorType"
        :disabled="isSubmitting || actionInProgress"
      />

      <div v-if="titleColorType === 'solid'" class="color-picker-container">
        <UiColorPicker
          v-model="titleSolidColor"
          v-bind="titleSolidColorAttributes"
          id="title-color-solid-0"
          name="title-color-solid-0"
          fluid
          format="hex"
          :invalid="!!errors.titleSolidColor"
          :disabled="isSubmitting || actionInProgress"
        />

        <UiInputText
          class="default"
          name="title-color-solid-0"
          :value="titleSolidColor || ''"
          readonly
        />
      </div>

      <div v-if="titleColorType === 'gradient'" class="gradient-controls">
        <div class="gradient-stop">
          <div class="color-picker-container">
            <UiColorPicker
              id="title-color-gradient-0"
              v-model="titleGradientStartColor"
              v-bind="titleGradientStartColorAttributes"
              fluid
              format="hex"
              :invalid="!!errors.titleGradientStartColor"
              :disabled="isSubmitting || actionInProgress"
            />
          </div>

          <UiInputText
            class="default"
            name="title-color-gradient-0"
            :value="titleGradientStartColor || ''"
            readonly
          />
        </div>

        <div class="gradient-stop">
          <div class="color-picker-container">
            <UiColorPicker
              id="title-color-gradient-1"
              v-model="titleGradientEndColor"
              v-bind="titleGradientEndColorAttributes"
              name="title-color-gradient-1"
              fluid
              format="hex"
              :invalid="!!errors.titleGradientEndColor"
              :disabled="isSubmitting || actionInProgress"
            />
          </div>

          <UiInputText
            class="default"
            name="title-color-gradient-1"
            :value="titleGradientEndColor || ''"
            readonly
          />
        </div>
      </div>
    </div>

    <FormInput id="url" label="URL" required :error="errors.url">
      <UiInputText
        v-model="url"
        v-bind="urlAttributes"
        name="url"
        fluid
        placeholder="URL"
        :invalid="!!errors.url"
        :disabled="isSubmitting || actionInProgress"
      />
    </FormInput>

    <div class="background-image">
      <span class="title">Background Image</span>

      <FormFileUpload
        id="background-image"
        ref="backgroundImageUpload"
        v-bind="backgroundImageAttributes"
        accept="image/jpeg,image/png,image/webp"
        :image="props.link?.backgroundImage as string || undefined"
        :disabled="isSubmitting || actionInProgress"
        @select="onSelectBackgroundImage"
      />

      <span class="caption"> Recommended size: 512x512px, JPG, PNG, WEBP </span>
    </div>

    <div class="background-colors">
      <span class="title">Background Colors</span>

      <UiSelectButton
        v-model="backgroundColorType"
        v-bind="backgroundColorTypeAttributes"
        :options="backgroundColorTypeOptions"
        option-label="label"
        option-value="value"
        :invalid="!!errors.backgroundColorType"
        :disabled="isSubmitting || actionInProgress"
      />

      <div
        v-if="backgroundColorType === 'solid'"
        class="color-picker-container"
      >
        <UiColorPicker
          id="background-color-solid-0"
          v-model="backgroundSolidColor"
          v-bind="backgroundSolidColorAttributes"
          name="background-color-solid-0"
          fluid
          format="hex"
          :invalid="!!errors.backgroundSolidColor"
          :disabled="isSubmitting || actionInProgress"
        />

        <UiInputText
          class="default"
          name="background-color-solid-0"
          :value="backgroundSolidColor || ''"
          readonly
        />
      </div>

      <div v-if="backgroundColorType === 'gradient'" class="gradient-controls">
        <div class="gradient-stop">
          <div class="color-picker-container">
            <UiColorPicker
              id="background-color-gradient-0"
              v-model="backgroundGradientStartColor"
              v-bind="backgroundGradientStartColorAttributes"
              name="background-color-gradient-0"
              fluid
              format="hex"
              :invalid="!!errors.backgroundGradientStartColor"
              :disabled="isSubmitting || actionInProgress"
            />
          </div>

          <UiInputText
            class="default"
            name="background-color-gradient-0"
            :value="backgroundGradientStartColor || ''"
            readonly
          />
        </div>

        <div class="gradient-stop">
          <div class="color-picker-container">
            <UiColorPicker
              id="background-color-gradient-1"
              v-model="backgroundGradientEndColor"
              v-bind="backgroundGradientEndColorAttributes"
              name="background-color-gradient-1"
              fluid
              format="hex"
              :invalid="!!errors.backgroundGradientEndColor"
              :disabled="isSubmitting || actionInProgress"
            />
          </div>

          <UiInputText
            class="default"
            name="background-color-gradient-1"
            :value="backgroundGradientEndColor || ''"
            readonly
          />
        </div>
      </div>
    </div>

    <div class="actions">
      <UiButton
        v-if="props.link"
        severity="danger"
        icon="popli:times-outline"
        icon-position="left"
        icon-size="1.5rem"
        label="Delete link"
        aria-label="Delete"
        fluid
        :loading="actionInProgress"
        :disabled="isSubmitting || actionInProgress"
        @click="onDelete"
      />

      <UiButton
        type="submit"
        severity="contrast"
        icon="popli:check"
        icon-size="1.25rem"
        :label="props.link ? 'Update' : 'Add'"
        :aria-label="
          props.link ? 'Update secondary link' : 'Add secondary link'
        "
        fluid
        :loading="isSubmitting"
        :disabled="isSubmitting || actionInProgress"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint, ELinkType } from '~~/enums';
import type { ILink } from '~~/interfaces';

const props = defineProps<{
  link: ILink | null;
  position: number;
}>();

const globalStore = useGlobalStore();
const uiDynamicDialog = useUiDynamicDialog();
const uiToast = useUiToast();

const titleColorTypeOptions = ref<
  { label: string; value: 'solid' | 'gradient' }[]
>([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const backgroundColorTypeOptions = ref<
  { label: string; value: 'solid' | 'gradient' }[]
>([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldError,
} = useForm<{
  title: string;
  url: string;
  titleColorType: 'solid' | 'gradient';
  titleSolidColor: string;
  titleGradientStartColor: string;
  titleGradientEndColor: string;
  backgroundColorType: 'solid' | 'gradient';
  backgroundSolidColor: string;
  backgroundGradientStartColor: string;
  backgroundGradientEndColor: string;
  backgroundImage: File | string | null;
}>({
  validationSchema: yup.object().shape({
    title: yup
      .string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must be less than 255 characters'),
    url: yup.string().required('URL is required').url('Invalid URL'),
    titleColorType: yup
      .string()
      .oneOf(['solid', 'gradient'])
      .required('Title color type is required'),
    titleSolidColor: yup
      .string()
      .notRequired()
      .nullable()
      .default(undefined)
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Title solid color must be a valid hex color',
      ),
    titleGradientStartColor: yup
      .string()
      .optional()
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Title gradient start color must be a valid hex color',
      ),
    titleGradientEndColor: yup
      .string()
      .optional()
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Title gradient end color must be a valid hex color',
      ),
    backgroundColorType: yup
      .string()
      .oneOf(['solid', 'gradient'])
      .required('Background color type is required'),
    backgroundSolidColor: yup
      .string()
      .optional()
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Background solid color must be a valid hex color',
      ),
    backgroundGradientStartColor: yup
      .string()
      .optional()
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Background gradient start color must be a valid hex color',
      ),
    backgroundGradientEndColor: yup
      .string()
      .optional()
      .matches(
        /^#([0-9a-fA-F]{6})$/,
        'Background gradient end color must be a valid hex color',
      ),
    backgroundImage: yup.mixed().optional(),
  }),
});

const [title, titleAttributes] = defineField<'title', string | undefined>(
  'title',
);
const [url, urlAttributes] = defineField<'url', string | undefined>('url');
const [titleColorType, titleColorTypeAttributes] = defineField<
  'titleColorType',
  'solid' | 'gradient' | undefined
>('titleColorType');
const [titleSolidColor, titleSolidColorAttributes] = defineField<
  'titleSolidColor',
  string | undefined
>('titleSolidColor');
const [titleGradientStartColor, titleGradientStartColorAttributes] =
  defineField<'titleGradientStartColor', string | undefined>(
    'titleGradientStartColor',
  );
const [titleGradientEndColor, titleGradientEndColorAttributes] = defineField<
  'titleGradientEndColor',
  string | undefined
>('titleGradientEndColor');
const [backgroundColorType, backgroundColorTypeAttributes] = defineField<
  'backgroundColorType',
  'solid' | 'gradient' | undefined
>('backgroundColorType');
const [backgroundSolidColor, backgroundSolidColorAttributes] = defineField<
  'backgroundSolidColor',
  string | undefined
>('backgroundSolidColor');
const [backgroundGradientStartColor, backgroundGradientStartColorAttributes] =
  defineField<'backgroundGradientStartColor', string | undefined>(
    'backgroundGradientStartColor',
  );
const [backgroundGradientEndColor, backgroundGradientEndColorAttributes] =
  defineField<'backgroundGradientEndColor', string | undefined>(
    'backgroundGradientEndColor',
  );
const [backgroundImage, backgroundImageAttributes] = defineField<
  'backgroundImage',
  File | string | null | undefined
>('backgroundImage');

const actionInProgress = computed(() => globalStore.getActionInProgress);

onMounted(async () => {
  titleColorType.value = 'solid';
  backgroundColorType.value = 'solid';

  if (props.link) {
    title.value = props.link.title!;
    url.value = props.link.url!;
    titleColorType.value =
      props.link.titleColors && props.link.titleColors.length > 1
        ? 'gradient'
        : 'solid';
    titleSolidColor.value =
      props.link.titleColors && props.link.titleColors.length === 1
        ? props.link.titleColors[0]!
        : undefined;
    titleGradientStartColor.value =
      props.link.titleColors && props.link.titleColors.length > 1
        ? props.link.titleColors[0]!
        : undefined;
    titleGradientEndColor.value =
      props.link.titleColors && props.link.titleColors.length > 1
        ? props.link.titleColors[1]!
        : undefined;
    backgroundColorType.value =
      props.link.backgroundColors && props.link.backgroundColors.length > 1
        ? 'gradient'
        : 'solid';
    backgroundSolidColor.value =
      props.link.backgroundColors && props.link.backgroundColors.length === 1
        ? props.link.backgroundColors[0]!
        : undefined;
    backgroundGradientStartColor.value =
      props.link.backgroundColors && props.link.backgroundColors.length > 1
        ? props.link.backgroundColors[0]!
        : undefined;
    backgroundGradientEndColor.value =
      props.link.backgroundColors && props.link.backgroundColors.length > 1
        ? props.link.backgroundColors[1]!
        : undefined;
    backgroundImage.value =
      props.link.backgroundImage &&
      typeof props.link.backgroundImage === 'string'
        ? props.link.backgroundImage
        : undefined;
  }
});

const onSelectBackgroundImage = (file: File) => {
  backgroundImage.value = file;
};

const onSubmit = handleSubmit(async (values) => {
  if (values.titleColorType === 'gradient') {
    if (values.titleGradientStartColor && !values.titleGradientEndColor) {
      return setFieldError(
        'titleGradientEndColor',
        'Gradient end color is required',
      );
    }

    if (!values.titleGradientStartColor && values.titleGradientEndColor) {
      return setFieldError(
        'titleGradientStartColor',
        'Gradient start color is required',
      );
    }
  }

  let backgroundImageId: string | null = null;

  if (values.backgroundImage && typeof values.backgroundImage === 'object') {
    const { data, error } = await useApiJson(EApiEndpoint.FILE_SIGN_URL, {
      fileName: values.backgroundImage.name,
      contentType: values.backgroundImage.type,
    });

    if (error) {
      return uiToast.add({
        severity: 'error',
        detail: error.message,
        life: 3000,
      });
    }

    const [, { data: id, error: saveError }] = await Promise.all([
      $fetch(data!.url, {
        method: 'PUT',
        headers: { 'Content-Type': values.backgroundImage.type },
        body: values.backgroundImage,
      }),
      useApiJson(EApiEndpoint.FILE_SAVE, {
        key: data!.key,
      }),
    ]);

    if (saveError) {
      return uiToast.add({
        severity: 'error',
        detail: saveError.message,
        life: 3000,
      });
    }

    backgroundImageId = id;
  }

  const { error } = await useApiJson(EApiEndpoint.URL_LINK_CREATE, {
    ...(props.link ? props.link : {}),
    type: ELinkType.SECONDARY,
    title: values.title,
    url: values.url,
    titleColors:
      values.titleColorType === 'solid' && values.titleSolidColor
        ? [values.titleSolidColor]
        : values.titleColorType === 'gradient' &&
          values.titleGradientStartColor &&
          values.titleGradientEndColor
        ? [values.titleGradientStartColor, values.titleGradientEndColor]
        : [],
    backgroundColors:
      values.backgroundColorType === 'solid' && values.backgroundSolidColor
        ? [values.backgroundSolidColor]
        : values.backgroundColorType === 'gradient' &&
          values.backgroundGradientStartColor &&
          values.backgroundGradientEndColor
        ? [
            values.backgroundGradientStartColor,
            values.backgroundGradientEndColor,
          ]
        : [],
    backgroundImageId: backgroundImageId,
    position: props.link ? props.link.position : props.position,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  uiDynamicDialog.close();
  resetForm();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: props.link
      ? 'Link updated successfully'
      : 'Link added successfully',
    life: 3000,
  });
});

const onDelete = async () => {
  const { error } = await useApiJson(
    EApiEndpoint.URL_LINK_DELETE,
    {},
    {},
    {
      id: props.link!.id,
    },
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Link deleted successfully',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .title-colors {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .title {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--neutral-100);
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
        width: 100%;
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
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 1rem;
  }
}
</style>
