<template>
  <form @submit.prevent="onNameSubmit">
    <FormInput
      id="name"
      label=""
      :error="errors.name"
      required
      caption="This will be displayed on your profile"
    >
      <UiInputText
        id="name"
        v-model="name"
        v-bind="nameAttributes"
        placeholder="Enter your name"
        fluid
        :invalid="!!errors.name"
        :disabled="isSubmitting"
        @update:model-value="onNameChange"
      />
    </FormInput>

    <UiButton
      type="submit"
      severity="contrast"
      icon="popli:check"
      icon-size="1.25rem"
      label="Save"
      aria-label="Save name"
      fluid
      :loading="isSubmitting"
      :disabled="isSubmitting || !!errors.name"
    />
  </form>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const props = defineProps<{ name: string | null }>();

const uiDynamicDialog = useUiDynamicDialog();
const uiToast = useUiToast();
const userStore = useUserStore();

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object().shape({
    name: yup
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(255, 'Name must be less than 255 characters'),
  }),
});

const [name, nameAttributes] = defineField('name');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  name.value = props.name || '';
});

const onNameChange = debounce((value?: string) => {
  if (!value || value === profile.value.name) return;

  userStore.setProfile({
    ...profile.value,
    name: value,
  });
}, 500);

const onNameSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(
    EApiEndpoint.ACCOUNT_UPDATE_PROFILE,
    values,
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  userStore.setProfile({
    ...profile.value,
    name: values.name,
  });

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Name updated successfully',
    life: 3000,
  });
});
</script>
