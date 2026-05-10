<template>
  <form class="profile-avatar" @submit.prevent="onSubmitProfileImage">
    <FormFileUpload
      id="profile-image"
      ref="profileImageUpload"
      accept="image/jpeg,image/png,image/webp"
      :image="props.profileImage ?? undefined"
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
      fluid
      :loading="isSubmitting"
      :disabled="!profileImage || isSubmitting"
    />
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import type FileUpload from '~/components/form/FileUpload.vue';
import { EApiEndpoint } from '~~/enums';

const props = defineProps<{ profileImage: string | null }>();

const uiDynamicDialog = useUiDynamicDialog();
const userStore = useUserStore();
const uiToast = useUiToast();

const profileImageUpload = ref<InstanceType<typeof FileUpload>>();

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

const profile = computed(() => userStore.getProfile!);

onMounted(async () => {
  if (profile.value && profile.value.profileImage) {
    try {
      const response = await $fetch<Blob>(profile.value.profileImage, {
        method: 'GET',
        responseType: 'blob',
      });

      const file = new File(
        [response],
        profile.value.profileImage.split('/').pop()!,
        {
          type: response.type,
        },
      );

      profileImage.value = file;
      profileImageUpload.value?.setFile(file);
    } catch {
      return;
    }
  }
});

const onSelectProfileImage = (file: File) => {
  profileImage.value = file;

  const imageUrl = URL.createObjectURL(file);
};

const onSubmitProfileImage = handleSubmit(async (values) => {
  const { data, error } = await useApiJson(EApiEndpoint.FILE_SIGN_URL, {
    fileName: values.profileImage.name,
    contentType: values.profileImage.type,
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
      headers: { 'Content-Type': values.profileImage.type },
      body: values.profileImage,
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

  const { error: updateError } = await useApiJson(
    EApiEndpoint.ACCOUNT_UPDATE_PROFILE,
    {
      profileImageId: id,
    },
  );

  if (updateError) {
    return uiToast.add({
      severity: 'error',
      detail: updateError.message,
      life: 3000,
    });
  }

  const { data: profileData } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);

  userStore.setProfile({
    ...profile.value,
    profileImage: profileData?.profileImage || null,
  });

  uiDynamicDialog.close();

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
