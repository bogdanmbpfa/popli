<template>
  <form @submit.prevent="onSubmitProfileImage">
    <div class="heading">
      <Icon name="icon-park-outline:avatar" size="1rem" />
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

    <PButton
      type="submit"
      class="default"
      severity="contrast"
      icon="pi pi-upload"
      label="Upload"
      :disabled="!profileImage || isSubmitting"
    />
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import type FileUpload from '~/components/form/FileUpload.vue';
import { EApiEndpoint } from '~~/enums';

const userStore = useUserStore();
const toast = useToast();

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
    return toast.add({
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

  return toast.add({
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
      color: var(--color-neutral-100);
    }

    .iconify {
      filter: brightness(0) saturate(100%) invert(100%) sepia(46%) saturate(51%)
        hue-rotate(202deg) brightness(115%) contrast(96%);
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
    color: var(--color-neutral-400);
  }
}
</style>
