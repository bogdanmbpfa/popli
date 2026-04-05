<template>
  <form @submit.prevent="onHandleSubmit">
    <div class="heading">
      <Icon class="info" name="material-symbols:alternate-email" size="1rem" />
      <span>Handle</span>
    </div>

    <FormInput
      id="handle"
      label=""
      :error="errors.handle"
      :success-caption="successCaption"
      required
      caption="This will be your popli.one/handle URL"
    >
      <PIconField>
        <PInputIcon class="pi pi-at" />

        <PInputText
          id="handle"
          v-model="handle"
          v-bind="handleAttributes"
          class="default"
          placeholder="Choose your unique handle"
          fluid
          autocomplete="handle"
          :invalid="!!errors.handle"
          :disabled="isSubmitting"
          @value-change="onHandleChange"
        />
      </PIconField>
    </FormInput>

    <FormInput
      id="handle-color"
      class="handle-color-input"
      label=""
      :error="errors.handleColor"
      required
      caption="This will be the color of your handle"
    >
      <PColorPicker
        v-model="handleColor"
        v-bind="handleColorAttributes"
        input-id="handle-color"
        class="default"
        overlay-class="default"
        fluid
        format="hex"
        :invalid="!!errors.handleColor"
        :disabled="isSubmitting"
        @change="onHandleColorChange($event.value)"
      />

      <PInputText
        name="handle-color-hex"
        :value="handleColor ? `#${handleColor}` : ''"
        class="default"
        readonly
        fluid
      />
    </FormInput>

    <PButton
      class="default"
      type="submit"
      label="Save"
      aria-label="Save handle"
      severity="contrast"
      :loading="isSubmitting"
      :disabled="isSubmitting || !!errors.handle"
    />
  </form>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const userStore = useUserStore();
const toast = useToast();

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
      .length(6, 'Handle color must be 6 characters')
      .matches(/^[0-9a-fA-F]+$/, 'Handle color must be a valid hex color'),
  }),
});

const [handle, handleAttributes] = defineField('handle');
const [handleColor, handleColorAttributes] = defineField('handleColor');

const successCaption = ref('');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  handle.value = profile.value.handle;
  handleColor.value = profile.value.handleColor;
});

const onHandleChange = debounce(async (value?: string) => {
  if (!value || value === profile.value.handle) return;

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
  if (!value || value === profile.value.handleColor) return;

  userStore.setProfile({
    ...profile.value,
    handleColor: value,
  });
}, 200);

const onHandleSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_UPDATE_PROFILE, {
    handle: values.handle,
    handleColor: values.handleColor,
  });

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  userStore.setProfile({
    ...profile.value,
    handle: values.handle,
    handleColor: values.handleColor,
  });

  successCaption.value = '';

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Handle updated successfully',
    life: 3000,
  });
});
</script>

<style lang="scss" scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: center;

  .heading {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 0.5rem;

    span {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-100);
    }
  }

  .handle-color-input {
    :deep(.input-container) {
      flex-direction: row;
    }
  }

  .p-button {
    align-self: flex-start;
  }
}
</style>
