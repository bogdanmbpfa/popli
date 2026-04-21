<template>
  <form @submit.prevent="onSubmitCoverImage">
    <div class="heading">
      <Icon class="info" name="popli:image" size="1rem" />
      <span>Cover</span>
    </div>
    
    <FormFileUpload
      id="cover-image"
      ref="coverImageUpload"
      accept="image/jpeg,image/png,image/webp"
      :disabled="isSubmitting"
      @select="onSelectCoverImage"
    />

    <span class="caption"> Recommended size: 1280x720px, JPG, PNG, WEBP </span>

    <UiButton
      type="submit"
      severity="contrast"
      icon="popli:upload-outline"
      icon-size="1.25rem"
      label="Upload"
      aria-label="Upload cover image"
      :disabled="!coverImage || isSubmitting"
    />
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import type FileUpload from '~/components/form/FileUpload.vue';
import { EApiEndpoint } from '~~/enums';

const userStore = useUserStore();
const uiToast = useUiToast();

const { defineField, handleSubmit, isSubmitting } = useForm({
  validationSchema: yup.object().shape({
    coverImage: yup
      .mixed()
      .required('Cover image is required')
      .test('fileSize', 'File size must be less than 10MB', (value) => {
        if (value instanceof File) {
          if (!value) return true;
          return value.size <= 10 * 1024 * 1024;
        }

        return false;
      })
      .test('fileType', 'File type must be an image', (value) => {
        if (value instanceof File) {
          if (!value) return true;
          return value.type.startsWith('image/');
        }

        return false;
      }),
  }),
});

const [coverImage] = defineField('coverImage');

const coverImageUpload = ref<InstanceType<typeof FileUpload>>();

const profile = computed(() => userStore.getProfile!);

const onSelectCoverImage = (file: File) => {
  coverImage.value = file;

  const imageUrl = URL.createObjectURL(file);

  userStore.setProfile({
    ...profile.value,
    coverImage: imageUrl,
  });
};

const onSubmitCoverImage = handleSubmit(async (values) => {
  const { error } = await useApiMultipart(
    EApiEndpoint.ACCOUNT_UPLOAD_COVER_IMAGE,
    { file: values.coverImage },
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  const { data: profileData } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);

  userStore.setProfile({
    ...profile.value,
    coverImage: profileData?.coverImage ?? null,
  });

  coverImageUpload.value?.remove();
  coverImage.value = null;

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Cover image uploaded successfully',
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

  .caption {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--neutral-400);
  }
}
</style>