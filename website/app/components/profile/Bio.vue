<template>
  <form @submit.prevent="onBioSubmit">
    <div class="heading">
      <Icon name="solar:user-id-linear" size="1rem" />
      <span>Bio</span>
    </div>

    <FormInput
      id="bio"
      label=""
      :error="errors.bio"
      :success-caption="successCaption"
      required
      caption="This will be displayed on your profile"
    >
      <PTextarea
        id="bio"
        v-model="bio"
        v-bind="bioAttributes"
        class="default"
        placeholder="Write a short bio about yourself"
        fluid
        rows="3"
        auto-resize
        :invalid="!!errors.bio"
        :disabled="isSubmitting"
        @value-change="onBioChange"
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
      <PColorPicker
        v-model="bioColor"
        v-bind="bioColorAttributes"
        input-id="bio-color"
        class="default"
        overlay-class="default"
        fluid
        format="hex"
        :invalid="!!errors.bioColor"
        :disabled="isSubmitting"
        @change="onBioColorChange($event.value)"
      />

      <PInputText
        name="bio-color-hex"
        :value="bioColor ? `#${bioColor}` : ''"
        class="default"
        readonly
        fluid
      />
    </FormInput>

    <PButton
      class="default"
      type="submit"
      label="Save"
      severity="contrast"
      :loading="isSubmitting"
      :disabled="isSubmitting || !!errors.bio"
    />
  </form>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';

const userStore = useUserStore();
const toast = useToast();

const { defineField, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object().shape({
    bio: yup.string().max(255, 'Bio must be less than 255 characters'),
    bioColor: yup
      .string()
      .notRequired()
      .length(6, 'Bio color must be 6 characters')
      .matches(/^[0-9a-fA-F]+$/, 'Bio color must be a valid hex color'),
  }),
});

const [bio, bioAttributes] = defineField('bio');
const [bioColor, bioColorAttributes] = defineField('bioColor');

const successCaption = ref('');

const profile = computed(() => userStore.getProfile!);

onMounted(() => {
  bio.value = profile.value.bio;
  bioColor.value = profile.value.bioColor;
});

watch(profile, () => {
  bio.value = profile.value.bio;
  bioColor.value = profile.value.bioColor;
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
    bioColor: value,
  });
}, 200);

const onBioSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.ACCOUNT_UPDATE_PROFILE, {
    bio: values.bio,
    bioColor: values.bioColor,
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
    bio: values.bio,
    bioColor: values.bioColor,
  });

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Bio updated successfully',
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
      color: var(--color-neutral-100);
    }

    .iconify {
      filter: brightness(0) saturate(100%) invert(100%) sepia(46%) saturate(51%)
        hue-rotate(202deg) brightness(115%) contrast(96%);
    }
  }

  .bio-color-input {
    :deep(.input-container) {
      flex-direction: row;
    }
  }

  .p-button {
    align-self: flex-start;
  }
}
</style>
