<template>
  <form @submit.prevent="onSubmitProfileImage">
    <div class="heading">
      <Icon class="info" name="popli:avatar" size="1rem" />
      <span>Avatar</span>
    </div>
    
    <FormFileUpload
      id="profile-image"
      ref="profileImageUpload"
      accept="image/jpeg,image/png,image/webp"
      :disabled="isSubmitting"
      @select="onSelectProfileImage"
    />

    <span class="caption"> Recommended size: 512x512px, JPG, PNG, WEBP </span>

    <UiButton
      type="submit"
      severity="contrast"
      icon="popli:upload-outline"
      icon-size="1.25rem"
      label="Upload"
      aria-label="Upload profile image"
      :disabled="!profileImage || isSubmitting"
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
    profileImage: yup
      .mixed()
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

const [profileImage] = defineField('profileImage');

const profileImageUpload = ref<InstanceType<typeof FileUpload>>();

const profile = computed(() => userStore.getProfile!);

const onSelectProfileImage = (file: File) => {
  profileImage.value = file;

  const imageUrl = URL.createObjectURL(file);

  userStore.setProfile({
    ...profile.value,
    profileImage: imageUrl,
  });
};

const onSubmitProfileImage = handleSubmit(async (values) => {
  const { error } = await useApiMultipart(
    EApiEndpoint.ACCOUNT_UPLOAD_PROFILE_IMAGE,
    {
      file: values.profileImage,
    },
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
    profileImage: profileData?.profileImage || null,
  });

  profileImageUpload.value?.remove();
  profileImage.value = null;

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Profile image uploaded successfully',
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

  .file-upload {
    height: 10rem;
    width: 10rem;
    border-radius: 50%;
  }

  .caption {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--neutral-400);
  }
}
</style>
