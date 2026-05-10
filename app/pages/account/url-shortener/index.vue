<template>
  <div class="url-shortener-page">
    <div class="heading">
      <span class="title">URL Shortener</span>

      <span class="description">
        Create and manage your short links with precision. Deploy
        high-performance redirects with custom aliases and real-time tracking.
      </span>
    </div>

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
          <UiInputText
            id="url"
            v-model="url"
            v-bind="urlAttributes"
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
          <UiInputText
            id="title"
            v-model="title"
            v-bind="titleAttributes"
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
          <UiInputText
            id="alias"
            v-model="alias"
            v-bind="aliasAttributes"
            placeholder="my-alias"
            fluid
            :invalid="!!shortenUrlErrors.alias"
            :disabled="isShortenUrlSubmitting || actionInProgress"
          />
        </FormInput>

        <UiButton
          v-if="isProPlan || shortUrlCount < shortUrlLimit"
          type="submit"
          severity="contrast"
          icon="popli:link-chain"
          :label="submitButtonLabel"
          aria-label="Shorten URL"
          fluid
          :disabled="isShortenUrlSubmitting || actionInProgress"
        />

        <UiButton
          v-else
          severity="contrast"
          icon="popli:link-chain"
          label="Upgrade to Pro"
          aria-label="Upgrade to Pro"
          fluid
          @click="upgradeToPro"
        />
      </form>
    </FormContainer>

    <UiDataTable
      :value="shortUrls"
      :columns="[
        { field: 'originalUrl', header: 'Original URL' },
        { field: 'shortCodeUrl', header: 'Short Code URL' },
        { field: 'isActive', header: 'Status' },
        { field: 'totalClicks', header: 'Clicks' },
        { field: 'actions', header: 'Actions' },
      ]"
      paginator
      :rows="3"
      data-key="id"
    >
      <template #cell-originalUrl="{ row }">
        <div class="content column">
          <span class="title">
            {{ row.title }}
          </span>

          <span class="caption">
            {{ row.originalUrl }}
          </span>
        </div>
      </template>

      <template #cell-shortCodeUrl="{ row }">
        <div class="content column">
          <span
            v-if="row.aliasUrl"
            class="caption contrast clickable"
            @click="copyToClipboard(row.aliasUrl)"
          >
            {{ row.aliasUrl }}
          </span>

          <span
            class="caption clickable"
            @click="copyToClipboard(row.shortCodeUrl)"
          >
            {{ row.shortCodeUrl }}
          </span>
        </div>
      </template>

      <template #cell-isActive="{ row }">
        <div class="content" :class="{ active: row.isActive }">
          <UiToggleSwitch
            :model-value="row.isActive"
            :disabled="actionInProgress"
            @update:model-value="handleToggleShortenedUrl(row.id)"
          />
        </div>
      </template>

      <template #cell-totalClicks="{ row }">
        <div class="content">
          <span class="value">{{
            Intl.NumberFormat('en-US', {
              compactDisplay: 'short',
              notation: 'compact',
              maximumFractionDigits: 1,
              roundingMode: 'floor',
            }).format(row.totalClicks)
          }}</span>

          <Icon
            name="popli:bar-chart"
            class="success clickable"
            size="1.25rem"
            title="Total clicks"
            @click="openAnalyticsDialog(row as IUrlShortUrl)"
          />
        </div>
      </template>

      <template #cell-actions="{ row }">
        <div class="content">
          <UiButton
            class="naked"
            severity="help"
            icon="popli:pencil-rounded"
            icon-size="1.25rem"
            title="Edit"
            aria-label="Edit"
            :disabled="actionInProgress"
            @click="handleUpdateShortUrl(row as IUrlShortUrl)"
          />

          <UiButton
            class="naked"
            severity="danger"
            icon="popli:trash-outline"
            icon-size="1.25rem"
            title="Delete"
            aria-label="Delete"
            :disabled="actionInProgress"
            @click="handleDeleteShortenedUrl(row.id, row.title)"
          />
        </div>
      </template>
    </UiDataTable>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';

import ShortUrlAnalyticsDialog from '~/components/dialog/ShortUrlAnalytics.vue';
import UpdateShortUrlDialog from '~/components/dialog/UpdateShortUrl.vue';
import { EApiEndpoint, EPlanType } from '~~/enums';
import type { IUrlShortenUrl, IUrlShortUrl } from '~~/interfaces';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const globalStore = useGlobalStore();
const {
  public: {
    errorMessages,
    freePlan: { shortUrlLimit },
  },
} = useRuntimeConfig();
const uiConfirmDialog = useUiConfirmDialog();
const uiDynamicDialog = useUiDynamicDialog();
const uiToast = useUiToast();
const { upgradeToPro } = useUpgradePlan();
const userStore = useUserStore();

const { data: shortUrls, refresh: refreshShortUrls } = await useAsyncData(
  'short-url',
  () =>
    $fetch<IUrlShortUrl[]>('/api/url/short-url', {
      method: 'GET',
      headers: useRequestHeaders(),
    }),
  { server: false, default: () => [] },
);

const { data: shortUrlCount, refresh: refreshShortUrlCount } = await useAsyncData(
  'short-url-count',
  () => useApiJson(EApiEndpoint.ACCOUNT_COUNTERS),
  { default: () => 0, transform: (data) => data.data?.shortUrlCount ?? 0 },
);

const actionInProgress = computed(() => globalStore.getActionInProgress);
const user = computed(() => userStore.getUser);
const isProPlan = computed(() => user.value?.plan === EPlanType.PRO);
const submitButtonLabel = computed(() => {
  return `Create Short URL${
    isProPlan.value ? '' : ` (${shortUrlCount.value}/${shortUrlLimit})`
  }`;
});

onMounted(async () => {
  if (user.value && !user.value.emailConfirmedAt) {
    uiToast.add({
      severity: 'info',
      detail: errorMessages.emailNotConfirmed,
      life: 3000,
    });

    return navigateTo('/account/settings');
  }
});

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
      .min(2, 'Alias must be at least 2 characters')
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
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  resetShortenUrlForm();

  await refreshShortUrls();
  await refreshShortUrlCount();

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'URL shortened successfully',
    life: 3000,
  });
});

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);

  uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Copied to clipboard',
    life: 3000,
  });
};

const handleDeleteShortenedUrl = (id: string, title: string) =>
  uiConfirmDialog.require({
    header: 'Delete Shortened URL',
    message: `Are you sure you want to delete "${title}"? Once deleted, it cannot be recovered.`,
    acceptLabel: 'Delete',
    acceptSeverity: 'contrast',
    rejectLabel: 'Cancel',
    rejectSeverity: 'help',
    accept: async () => {
      globalStore.toggleActionInProgress();

      const { error } = await useApiJson(
        EApiEndpoint.URL_SHORT_URL_DELETE,
        {},
        {},
        { id },
      );

      if (error) {
        globalStore.toggleActionInProgress();

        return uiToast.add({
          severity: 'error',
          detail: error.message,
          life: 3000,
        });
      }

      globalStore.toggleActionInProgress();

      await refreshShortUrls();

      return uiToast.add({
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
    uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });

    return globalStore.toggleActionInProgress();
  }

  await refreshShortUrls();

  uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Shortened URL status updated successfully',
    life: 3000,
  });

  return globalStore.toggleActionInProgress();
};

const handleUpdateShortUrl = (shortUrl: IUrlShortUrl) =>
  uiDynamicDialog.open({
    component: markRaw(UpdateShortUrlDialog),
    header: 'Update Short URL',
    props: { shortUrl },
    onClose: () => refreshShortUrls(),
  });

const openAnalyticsDialog = (shortUrl: IUrlShortUrl) =>
  uiDynamicDialog.open({
    component: markRaw(ShortUrlAnalyticsDialog),
    header: shortUrl.title,
    props: {
      shortUrl,
      userPlan: user.value?.plan,
    },
  });
</script>

<style lang="scss" scoped>
.url-shortener-page {
  position: relative;
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 0;

  .heading {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .title {
      font-size: 1.25rem;
      font-weight: 500;
      color: var(--neutral-100);
    }

    .description {
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--neutral-400);
    }
  }

  :deep(.form-container) {
    form {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  :deep(.ui-data-table) {
    .table-wrapper {
      table {
        tbody {
          tr {
            &:not(:has(.active)) {
              opacity: 0.5;
            }

            td {
              .content {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-start;
                gap: 0.25rem;
              }

              .column {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                gap: 0.25rem;

                .title {
                  font-size: 1rem;
                  font-weight: 500;
                  color: var(--neutral-100);
                }

                .caption {
                  font-size: 0.75rem;
                  font-weight: 400;
                  color: var(--neutral-400);
                }

                .contrast {
                  color: var(--primary-400);
                }

                .clickable {
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .url-shortener-page {
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
</style>
