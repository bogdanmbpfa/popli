<template>
  <div class="url-shortener-page">
    <div class="container">
      <FormContainer
        title="Create New Link"
        description="Transform your long URLs into short, shareable links."
      >
        <BackgroundBlur position="top-right" type="primary" />

        <form @submit.prevent="onSubmitShortenUrl">
          <FormInput
            id="url"
            label="Destination Long URL"
            :error="shortenUrlErrors.url"
            :required="true"
          >
            <PInputText
              id="url"
              v-model="url"
              v-bind="urlAttributes"
              v-keyfilter="/^[a-z0-9-?&/:_.%+~#=@]+$/"
              class="default"
              placeholder="https://very-long-url.com/campaign/v1"
              fluid
              :invalid="!!shortenUrlErrors.url"
              :disabled="isShortenUrlSubmitting || actionInProgress"
            />
          </FormInput>

          <FormInput
            id="title"
            label="Title"
            :error="shortenUrlErrors.title"
            :required="true"
            size="half"
          >
            <PInputText
              id="title"
              v-model="title"
              v-bind="titleAttributes"
              class="default"
              placeholder="My Short URL"
              fluid
              :invalid="!!shortenUrlErrors.title"
              :disabled="isShortenUrlSubmitting || actionInProgress"
            />
          </FormInput>

          <FormInput
            id="alias"
            label="Alias"
            :error="shortenUrlErrors.alias"
            :required="false"
            size="half"
          >
            <pre>popli.one/s/</pre>
            <PInputText
              id="alias"
              v-model="alias"
              v-bind="aliasAttributes"
              v-keyfilter="/^[a-z-]+$/"
              class="default"
              placeholder="my-alias"
              fluid
              :invalid="!!shortenUrlErrors.alias"
              :disabled="isShortenUrlSubmitting || actionInProgress"
            />
          </FormInput>

          <PButton
            type="submit"
            class="default"
            severity="contrast"
            icon="pi pi-link"
            label="Shorten URL"
            aria-label="Shorten URL"
            fluid
            :disabled="isShortenUrlSubmitting || actionInProgress"
          />
        </form>
      </FormContainer>

      <PDataTable
        class="default"
        :value="shortUrls"
        always-show-paginator
        data-key="id"
        :default-sort-order="-1"
        sort-field="createdAt"
        :loading="pending"
        paginator
        :total-records="shortUrls.length"
        :rows="3"
        paginator-template="PrevPageLink PageLinks NextPageLink"
      >
        <PColumn field="originalUrl" header="Original URL">
          <template #body="{ data }">
            <div class="content column">
              <span class="title">
                {{ data.title }}
              </span>

              <span class="caption">
                {{ data.originalUrl }}
              </span>
            </div>
          </template>
        </PColumn>

        <PColumn field="shortCodeUrl" header="Short Code URL">
          <template #body="{ data }">
            <div class="content column">
              <span
                v-if="data.aliasUrl"
                class="contrast clickable"
                @click="copyToClipboard(data.aliasUrl)"
              >
                {{ data.aliasUrl }}
              </span>

              <span
                class="caption clickable"
                @click="copyToClipboard(data.shortCodeUrl)"
              >
                {{ data.shortCodeUrl }}
              </span>
            </div>
          </template>
        </PColumn>

        <PColumn field="isActive" header="Status">
          <template #body="{ data }">
            <div class="content" :class="{ active: data.isActive }">
              <PToggleSwitch
                class="default"
                :model-value="data.isActive"
                :disabled="actionInProgress"
                @update:model-value="handleToggleShortenedUrl(data.id)"
              />
            </div>
          </template>
        </PColumn>

        <PColumn field="totalClicks" header="Clicks">
          <template #body="{ data }">
            <div class="content"> 
              <span class="value">{{
                Intl.NumberFormat('en-US', {
                  compactDisplay: 'short',
                  notation: 'compact',
                  maximumFractionDigits: 1,
                  roundingMode: 'floor',
                }).format(data.totalClicks)
              }}</span>

              <Icon
                name="popli:bar-chart"
                class="success clickable"
                size="1.25rem"
                title="Total clicks"
                @click="openAnalyticsDialog(data)"
              />
            </div>
          </template>
        </PColumn>

        <PColumn header="Actions">
          <template #body="{ data }">
            <div class="content">
              <PButton
                class="default icon-only"
                severity="help"
                icon="pi pi-pencil"
                title="Edit"
                aria-label="Edit"
                :disabled="actionInProgress"
                @click="handleUpdateShortUrl(data)"
              />

              <PButton
                class="default icon-only"
                severity="danger"
                icon="pi pi-trash"
                title="Delete"
                aria-label="Delete"
                :disabled="actionInProgress"
                @click="handleDeleteShortenedUrl(data.id, data.title)"
              />
            </div>
          </template>
        </PColumn>
      </PDataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import { EApiEndpoint } from '~~/enums';
import type { IUrlShortenUrl, IUrlShortUrl } from '~~/interfaces';

const UpdateShortUrlDialog = defineAsyncComponent(
  () => import('~/components/dialog/UpdateShortUrl.vue'),
);

const ShortUrlAnalyticsDialog = defineAsyncComponent(
  () => import('~/components/dialog/ShortUrlAnalytics.vue'),
);

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const confirm = useConfirm();
const dialog = useDialog();
const globalStore = useGlobalStore();
const toast = useToast();

const actionInProgress = computed(() => globalStore.getActionInProgress);

const {
  data: shortUrls,
  pending,
  refresh: refreshShortUrls,
} = await useAsyncData(
  'short-url',
  () =>
    $fetch<IUrlShortUrl[]>('/api/json', {
      method: 'POST',
      body: { key: EApiEndpoint.URL_SHORT_URL, headers: useRequestHeaders() },
    }),
  { server: false, default: () => [] },
);

const {
  defineField: defineShortenUrlField,
  errors: shortenUrlErrors,
  handleSubmit: handleShortenUrlSubmit,
  isSubmitting: isShortenUrlSubmitting,
  resetForm: resetShortenUrlForm,
} = useForm<IUrlShortenUrl>({
  validationSchema: yup.object({
    url: yup.string().required('URL is required').url('Invalid URL'),
    alias: yup
      .string()
      .notRequired()
      .min(3, 'Alias must be at least 3 characters')
      .max(255, 'Alias must be less than 255 characters'),
    title: yup
      .string()
      .required('Title is required')
      .min(3, 'Title must be at least 3 characters')
      .max(255, 'Title must be less than 255 characters'),
  }),
});

const [url, urlAttributes] = defineShortenUrlField('url');
const [alias, aliasAttributes] = defineShortenUrlField('alias');
const [title, titleAttributes] = defineShortenUrlField('title');

const onSubmitShortenUrl = handleShortenUrlSubmit(async (values) => {
  const { error } = await useApiJson(EApiEndpoint.URL_SHORT_URL_CREATE, values);

  if (error) {
    return toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
    });
  }

  resetShortenUrlForm();

  await refreshShortUrls();

  return toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'URL shortened successfully',
    life: 3000,
  });
});

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Copied to clipboard',
    life: 3000,
  });
};

const handleDeleteShortenedUrl = (id: string, title: string) =>
  confirm.require({
    header: 'Delete Shortened URL',
    icon: 'pi pi-exclamation-triangle',
    message: `Are you sure you want to delete "${title}"? Once deleted, it cannot be recovered.`,
    acceptClass: 'default p-button-danger',
    acceptLabel: 'Delete',
    blockScroll: true,
    modal: true,
    position: 'center',
    rejectClass: 'default p-button-help',
    rejectLabel: 'Cancel',
    accept: async () => {
      const { error } = await useApiJson(
        EApiEndpoint.URL_SHORT_URL_DELETE,
        {},
        {},
        { id },
      );

      if (error) {
        return toast.add({
          severity: 'error',
          summary: 'Oops!',
          detail: error.message,
          life: 3000,
        });
      }

      await refreshShortUrls();

      return toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Shortened URL deleted successfully',
        life: 3000,
      });
    },
  });

const handleToggleShortenedUrl = async (id: string) => {
  globalStore.toggleActionInProgress();

  const { error } = await useApiJson(
    EApiEndpoint.URL_SHORT_URL_TOGGLE,
    {},
    {},
    { id },
  );

  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Oops!',
      detail: error.message,
      life: 3000,
    });

    return globalStore.toggleActionInProgress();
  }

  await refreshShortUrls();

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Shortened URL status updated successfully',
    life: 3000,
  });

  return globalStore.toggleActionInProgress();
};

const handleUpdateShortUrl = (shortUrl: IUrlShortUrl) =>
  dialog.open(UpdateShortUrlDialog, {
    data: {
      id: shortUrl.id,
      url: shortUrl.originalUrl,
      alias: shortUrl.alias,
      title: shortUrl.title,
    },
    props: {
      blockScroll: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      header: 'Update Short URL',
      modal: true,
      position: 'center',
      closeButtonProps: {
        class: 'default p-button-secondary',
      },
      pt: { root: { class: 'default' } },
      style: { width: '30rem' },
    },
    onClose: () => refreshShortUrls(),
  });

const openAnalyticsDialog = (shortUrl: IUrlShortUrl) =>
  dialog.open(ShortUrlAnalyticsDialog, {
    data: { shortUrl },
    props: {
      blockScroll: true,
      closable: true,
      closeOnEscape: true,
      dismissableMask: true,
      draggable: false,
      header: shortUrl.title,
      modal: true,
      position: 'center',
      closeButtonProps: {
        class: 'default p-button-secondary',
      },
      pt: { root: { class: 'default' } },
      style: { width: '50rem' },
    },
  });
</script>

<style lang="scss" scoped>
@use '../../../assets/mixins.scss' as *;

.url-shortener-page {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  flex: 1;
  position: relative;

  .container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    flex: 1;
    width: 100%;
    max-width: 60rem;
    padding: 1.5rem;

    :deep(.form-container) {
      form {
        flex-direction: row;
        flex-wrap: wrap;
      }
    }
  }
}

@media (max-width: 768px) {
  .url-shortener-page {
    .container {
      :deep(.form-container) {
        form {
          .form-input {
            width: 100%;
            max-width: 100%;
          }
        }
      }
    }
  }
}
</style>
