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

onMounted(async () => {
  if (profile.value && profile.value.coverImage) {
    try {
      const response = await $fetch<Blob>(profile.value.coverImage, {
        method: 'GET',
        responseType: 'blob',
      });

      const file = new File(
        [response],
        profile.value.coverImage.split('/').pop()!,
        {
          type: response.type,
        },
      );

      coverImage.value = file;
      coverImageUpload.value?.setFile(file);
    } catch {
      return;
    }
  }
});

const onSelectCoverImage = (file: File) => {
  coverImage.value = file;

  const imageUrl = URL.createObjectURL(file);

  userStore.setProfile({
    ...profile.value,
    coverImage: imageUrl,
  });
};

const onSubmitCoverImage = handleSubmit(async (values) => {
  const { data, error } = await useApiJson(EApiEndpoint.FILE_SIGN_URL, {
    fileName: values.coverImage.name,
    contentType: values.coverImage.type,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  const [, { data: id, error: saveError }] = await Promise.all([
    $fetch(data!.url, {
      method: 'PUT',
      headers: { 'Content-Type': values.coverImage.type },
      body: values.coverImage,
    }),
    useApiJson(EApiEndpoint.FILE_SAVE, {
      key: data!.key,
    }),
  ]);

  if (saveError) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: saveError.message,
      life: 3000,
    });
  }

  const { error: updateError } = await useApiJson(
    EApiEndpoint.ACCOUNT_UPDATE_PROFILE,
    {
      coverImageId: id,
    },
  );

  if (updateError) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: updateError.message,
      life: 3000,
    });
  }

  const { data: profileData } = await useApiJson(EApiEndpoint.ACCOUNT_PROFILE);

  userStore.setProfile({
    ...profile.value,
    coverImage: profileData?.coverImage || null,
  });

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
