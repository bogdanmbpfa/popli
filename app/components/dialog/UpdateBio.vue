<template>
  <form @submit.prevent="onBioSubmit">
    <FormInput
      id="bio"
      label=""
      :error="errors.bio"
      :success-caption="successCaption"
      required
      caption="This will be displayed on your profile"
    >
      <UiTextarea
        id="bio"
        v-model="bio"
        v-bind="bioAttributes"
        placeholder="Write a short bio about yourself"
        fluid
        rows="3"
        auto-resize
        :invalid="!!errors.bio"
        :disabled="isSubmitting"
        @update:model-value="onBioChange"
      />
    </FormInput>

    <FormInput
      id="bio-color"
      class="bio-color-input"
      label=""
      :error="errors.bioColor"
      required
      caption="This will be the color of your bio"
    >
      <UiColorPicker
        id="bio-color"
        v-model="bioColor"
        v-bind="bioColorAttributes"
        fluid
        format="hex"
        :invalid="!!errors.bioColor"
        :disabled="isSubmitting"
        @update:model-value="onBioColorChange($event)"
      />

      <UiInputText name="bio-color-hex" :value="bioColor" readonly fluid />
    </FormInput>

    <UiButton
      type="submit"
      severity="contrast"
      icon="popli:check"
      icon-size="1.25rem"
      label="Save"
      aria-label="Save bio"
      fluid
      :loading="isSubmitting"
      :disabled="isSubmitting || !!errors.bio"
    />
  </form>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const props = defineProps<{ bio: string | null; bioColor: string | null }>();

const uiDynamicDialog = useUiDynamicDialog();
const userStore = useUserStore();
const uiToast = useUiToast();

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object().shape({
    bio: yup.string().max(255, 'Bio must be less than 255 characters'),
    bioColor: yup
      .string()
      .notRequired()
      .length(7, 'Bio color must be 7 characters')
      .matches(/^#[0-9a-fA-F]+$/, 'Bio color must be a valid hex color'),
  }),
});

const [bio, bioAttributes] = defineField('bio');
const [bioColor, bioColorAttributes] = defineField('bioColor');

const successCaption = ref('');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  bio.value = props.bio ?? undefined;
  bioColor.value = props.bioColor || undefined;
});

const onBioChange = debounce(async (value?: string) => {
  if (!value || value === profile.value.bio) return;

  userStore.setProfile({
    ...profile.value,
    bio: value,
  });
}, 200);

const onBioColorChange = debounce(async (value?: string) => {
  if (!value || value === profile.value.bioColor) return;

  userStore.setProfile({
    ...profile.value,
    bioColor: value || null,
  });
}, 200);

const onBioSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_UPDATE_PROFILE, {
    bio: values.bio,
    bioColor: values.bioColor ?? undefined,
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
    bio: values.bio,
    bioColor: values.bioColor ?? undefined,
  });

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Bio updated successfully',
    life: 3000,
  });
});
</script>
