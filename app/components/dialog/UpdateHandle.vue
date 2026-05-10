<template>
  <form @submit.prevent="onHandleSubmit">
    <FormInput
      id="handle"
      label=""
      :error="errors.handle"
      :success-caption="successCaption"
      required
      caption="This will be your popli.one/handle URL"
    >
      <UiInputGroup>
        <template #prepend>
          <Icon name="popli:alternate-email" size="1.25rem" />
        </template>

        <UiInputText
          id="handle"
          v-model="handle"
          v-bind="handleAttributes"
          placeholder="Choose your unique handle"
          fluid
          autocomplete="handle"
          :invalid="!!errors.handle"
          :disabled="isSubmitting"
          @update:model-value="onHandleChange"
        />
      </UiInputGroup>
    </FormInput>

    <FormInput
      id="handle-color"
      class="handle-color-input"
      label=""
      :error="errors.handleColor"
      required
      caption="This will be the color of your handle"
    >
      <UiColorPicker
        id="handle-color"
        v-model="handleColor"
        v-bind="handleColorAttributes"
        fluid
        format="hex"
        :invalid="!!errors.handleColor"
        :disabled="isSubmitting"
        @update:model-value="onHandleColorChange($event)"
      />

      <UiInputText
        name="handle-color-hex"
        :value="handleColor"
        readonly
        fluid
      />
    </FormInput>

    <UiButton
      type="submit"
      severity="contrast"
      icon="popli:check"
      icon-size="1.25rem"
      label="Save"
      aria-label="Save handle"
      fluid
      :loading="isSubmitting"
      :disabled="isSubmitting || !!errors.handle"
    />
  </form>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const props = defineProps<{
  handle: string | null;
  handleColor: string | null;
}>();

const uiDynamicDialog = useUiDynamicDialog();
const userStore = useUserStore();
const uiToast = useUiToast();

const {
  defineField,
  errors,
  handleSubmit,
  isSubmitting,
  setFieldError,
  validateField,
} = useForm({
  validationSchema: yup.object().shape({
    handle: yup
      .string()
      .required('Handle is required')
      .min(3, 'Handle must be at least 3 characters')
      .max(255, 'Handle must be less than 255 characters')
      .matches(
        /^[a-zA-Z0-9_\-.]+$/,
        'Handle must contain only letters, numbers, underscores and dots',
      ),
    handleColor: yup
      .string()
      .notRequired()
      .length(7, 'Handle color must be 7 characters')
      .matches(/^#[0-9a-fA-F]+$/, 'Handle color must be a valid hex color'),
  }),
});

const [handle, handleAttributes] = defineField('handle');
const [handleColor, handleColorAttributes] = defineField('handleColor');

const successCaption = ref('');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  handle.value = props.handle || '';
  handleColor.value = props.handleColor ? `#${props.handleColor}` : null;
});

const onHandleChange = debounce(async (value?: string) => {
  if (!value || value === props.handle) return;

  successCaption.value = '';
  setFieldError('handle', undefined);

  await validateField('handle');

  if (errors.value.handle) return;

  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_CHECK_HANDLE, {
    handle: value,
  });

  setFieldError('handle', error ? 'Handle not available' : undefined);

  successCaption.value = error ? '' : 'Handle is available';

  if (!error) {
    userStore.setProfile({
      ...profile.value,
      handle: value,
    });
  }

  return;
}, 500);

const onHandleColorChange = debounce(async (value?: string) => {
  if (!value || value === props.handleColor) return;

  userStore.setProfile({
    ...profile.value,
    handleColor: value ?? null,
  });
}, 200);

const onHandleSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_UPDATE_PROFILE, {
    handle: values.handle,
    handleColor: values.handleColor ?? undefined,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  userStore.setProfile({
    ...profile.value,
    handle: values.handle,
    handleColor: values.handleColor ?? undefined,
  });

  successCaption.value = '';

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Handle updated successfully',
    life: 3000,
  });
});
</script>
