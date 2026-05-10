<template>
  <form @submit.prevent="onSubmit">
    <FormInput
      id="platform"
      label="Platform"
      :error="errors.platform"
      :required="true"
    >
      <UiSelect
        id="platform"
        v-model="platform"
        v-bind="platformAttributes"
        :options="Object.values(ELinkPlatform)"
        :invalid="!!errors.platform"
        :disabled="isSubmitting"
      >
        <template #value="{ value }">
          <NuxtImg
            v-if="value"
            :src="`/${value.toLowerCase()}.svg`"
            :alt="value"
          />
        </template>

        <template #option="{ option }">
          <NuxtImg
            :src="`/${option}.svg`"
            :alt="option"
            :title="(option as string).toUpperCase()"
          />
        </template>
      </UiSelect>
    </FormInput>

    <FormInput id="url" label="URL" :error="errors.url" :required="true">
      <UiInputText
        id="url"
        v-model="url"
        v-bind="urlAttributes"
        placeholder="https://example.com"
        :invalid="!!errors.url"
        :disabled="isSubmitting"
      />
    </FormInput>

    <div class="actions">
      <UiButton
        v-if="link"
        severity="danger"
        icon="popli:times"
        icon-size="1.25rem"
        label="Delete link"
        aria-label="Delete link"
        fluid
        @click="onDelete"
      />

      <UiButton
        type="submit"
        severity="contrast"
        icon="popli:check"
        icon-size="1.25rem"
        :label="props.link ? 'Update' : 'Add'"
        :aria-label="props.link ? 'Update primary link' : 'Add primary link'"
        fluid
        :loading="isSubmitting"
        :disabled="isSubmitting"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { EApiEndpoint, ELinkPlatform, ELinkType } from '~~/enums';

import type { ILink, IUpdatePrimaryLink } from '~~/interfaces';

const props = defineProps<{
  link: ILink | null;
  position: number;
}>();

const uiDynamicDialog = useUiDynamicDialog();
const uiToast = useUiToast();

const { defineField, errors, handleSubmit, resetForm, isSubmitting } =
  useForm<IUpdatePrimaryLink>({
    validationSchema: yup.object().shape({
      platform: yup
        .string()
        .oneOf(Object.values(ELinkPlatform))
        .required('Platform is required'),
      url: yup.string().required('URL is required').url('Invalid URL'),
    }),
  });

const [platform, platformAttributes] = defineField('platform');
const [url, urlAttributes] = defineField('url');

onMounted(() => {
  if (props.link) {
    platform.value = props.link.platform!;
    url.value = props.link.url!;
  }
});

const onDelete = async () => {
  const { error } = await useApiJson(
    EApiEndpoint.URL_LINK_DELETE,
    {},
    {},
    { id: props.link?.id },
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Link deleted successfully',
    life: 3000,
  });
};

const onSubmit = handleSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.URL_LINK_CREATE, {
    ...(props.link ? props.link : {}),
    type: ELinkType.PRIMARY,
    platform: values.platform,
    url: values.url,
    position: props.link ? props.link.position : props.position,
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  uiDynamicDialog.close();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: props.link
      ? 'Link updated successfully'
      : 'Link added successfully',
    life: 3000,
  });
});
</script>

<style scoped lang="scss">
form {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;

  :deep(.form-input:first-child) {
    max-width: 5rem;

    .input-container {
      .ui-select-container {
        .ui-select-trigger {
          img {
            width: 1.25rem;
            height: 1.25rem;
            object-fit: contain;
            object-position: center;
          }
        }

        .ui-select-dropdown-list {
          .ui-select-dropdown-list-item {
            display: flex;
            align-items: center;
            justify-content: center;

            img {
              width: 1.25rem;
              height: 1.25rem;
              object-fit: contain;
              object-position: center;
            }
          }
        }
      }
    }
  }

  :deep(.form-input:nth-child(2)) {
    max-width: calc(100% - 6rem);
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    width: 100%;
  }
}
</style>
