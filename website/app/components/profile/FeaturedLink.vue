<template>
  <div v-if="link" class="featured-link">
    <div class="position-buttons">
      <UiButton
        v-if="Number.isFinite(link.position) && link.position! > 0"
        class="up-button"
        severity="help"
        icon="popli:arrow-up"
        title="Move up"
        aria-label="Move up"
        @click="onIncrementPosition"
      />
      <UiButton
        v-if="Number.isFinite(link.position) && link.position! < lastPosition"
        class="down-button"
        severity="help"
        icon="popli:arrow-down"
        title="Move down"
        aria-label="Move down"
        @click="onDecrementPosition"
      />
    </div>

    <UiInputGroup>
      <template #prepend>
        <NuxtImg
          :src="`/${link.platform}.svg`"
          :alt="link.platform"
          :title="link.platform"
          loading="lazy"
        />
      </template>

      <UiInputText
        v-model="url"
        name="url"
        fluid
        :placeholder="inputPlaceholder"
        @update:model-value="onChange"
      />
    </UiInputGroup>

    <UiButton
      class="delete-button"
      severity="danger"
      icon="popli:times-outline"
      title="Delete"
      aria-label="Delete"
      naked
      @click="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';

import { EApiEndpoint, ELinkPlatform } from '~~/enums';
import type { ILink } from '~~/interfaces';

const props = defineProps<{
  link: ILink;
  lastPosition: number;
}>();

const uiToast = useUiToast();
const urlStore = useUrlStore();

const url = ref<string>('');

const inputPlaceholder = computed(() => {
  if (!props.link) return '';

  switch (props.link?.platform) {
    case ELinkPlatform.X:
      return 'https://x.com/username';
    case ELinkPlatform.INSTAGRAM:
      return 'https://instagram.com/username';
    case ELinkPlatform.TIKTOK:
      return 'https://tiktok.com/@username';
    case ELinkPlatform.YOUTUBE:
      return 'https://youtube.com/username';
    case ELinkPlatform.FACEBOOK:
      return 'https://facebook.com/username';
    case ELinkPlatform.LINKEDIN:
      return 'https://linkedin.com/in/username';
    case ELinkPlatform.GITHUB:
      return 'https://github.com/username';
    case ELinkPlatform.TWITCH:
      return 'https://twitch.tv/username';
    case ELinkPlatform.DISCORD:
      return 'https://discord.com/username';
    default:
      return '';
  }
});

onMounted(() => {
  url.value = props.link.url ?? '';
});

const onDecrementPosition = () =>
  urlStore.decrementPosition(props.link.type, props.link);
const onIncrementPosition = () =>
  urlStore.incrementPosition(props.link.type, props.link);
const onChange = debounce(() => {
  urlStore.updateLink(props.link.type, {
    ...props.link,
    url: url.value,
  });
}, 200);

const onDelete = async () => {
  const { error } = await useApiJson(
    EApiEndpoint.URL_LINK_DELETE,
    {},
    {},
    { id: props.link.id },
  );

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
    });
  }

  urlStore.deleteLink(props.link.type, props.link);

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Link deleted successfully',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
.featured-link {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;

  .position-buttons {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.25rem;

    &:not(:has(.up-button)):not(:has(.down-button)) {
      display: none;
    }

    &:has(.up-button):not(:has(.down-button)) {
      justify-content: flex-start;
    }

    &:has(.down-button):not(:has(.up-button)) {
      justify-content: flex-end;
    }

    :deep(.ui-button) {
      padding: 0 0.5rem;
      height: calc(50% - 0.125rem);

      .iconify {
        font-size: 0.75rem;
      }
    }
  }

  .p-inputgroup {
    .p-inputgroupaddon {
      padding-right: 0.5rem;

      img {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  :deep(.p-button) {
    &.delete-button {
      flex: 1;
      height: 100%;
    }
  }
}
</style>
