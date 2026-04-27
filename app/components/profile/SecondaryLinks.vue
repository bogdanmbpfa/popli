<template>
  <div class="secondary-links">
    <div class="heading">
      <Icon class="info" name="popli:link-2" size="1rem" />
      <span>Secondary Links</span>
    </div>

    <div class="links">
      <ProfileSecondaryLink
        v-for="link in links"
        :key="link.id"
        :link="link"
        :last-position="links[links.length - 1]?.position ?? 0"
      />
    </div>

    <div class="actions">
      <UiButton
        severity="contrast"
        label="Save"
        aria-label="Save secondary links"
        :disabled="!areLinksValid"
        @click="onSave"
      />

      <UiButton
        severity="secondary"
        label="Add Link"
        icon="popli:plus"
        aria-label="Add secondary link"
        @click="onAddLink"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v7 as uuidv7 } from 'uuid';

import { EApiEndpoint, ELinkType } from '~~/enums';

const uiToast = useUiToast();
const urlStore = useUrlStore();

const links = computed(() => urlStore.getSecondaryLinks);
const areLinksValid = computed(() => {
  if (!links.value.length) return false;

  return links.value.every((link) => {
    let isUrlValid = false;

    isUrlValid = link.url?.match(/^https?:\/\/.+$/) ? true : false;
    isUrlValid =
      link.title && link.title.length >= 3 && link.title.length <= 255
        ? true
        : false;

    return isUrlValid;
  });
});

const onAddLink = () => {
  urlStore.addLink({
    id: uuidv7(),
    type: ELinkType.SECONDARY,
    position: urlStore.secondaryLinks.length,
  });
};

const onSave = async () => {
  if (!areLinksValid.value) return;

  const createdLinks = await Promise.all(
    links.value.map(async (link) => {
      let backgroundImageId: string | null = null;

      if (link.backgroundImage && typeof link.backgroundImage === 'object') {
        const { data, error } = await useApiJson(EApiEndpoint.FILE_SIGN_URL, {
          fileName: link.backgroundImage.name,
          contentType: link.backgroundImage.type,
        });

        if (error) {
          return { error: error.message };
        }

        const [, { data: id, error: saveError }] = await Promise.all([
          $fetch(data!.url, {
            method: 'PUT',
            headers: { 'Content-Type': link.backgroundImage.type },
            body: link.backgroundImage,
          }),
          useApiJson(EApiEndpoint.FILE_SAVE, {
            key: data!.key,
          }),
        ]);

        if (saveError) {
          return { error: saveError.message };
        }

        backgroundImageId = id;
      }

      return useApiJson(EApiEndpoint.URL_LINKS_CREATE, {
        id: link.id,
        type: link.type,
        title: link.title,
        titleColors: link.titleColors,
        backgroundImageId: backgroundImageId,
        backgroundColors: link.backgroundColors,
        url: link.url,
        position: link.position,
      });
    }),
  );

  if (createdLinks.some((result) => result.error)) {
    const error = createdLinks.find((result) => !!result.error)?.error;

    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: typeof error === 'string' ? error : error?.message,
      life: 3000,
    });
  }

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Links created successfully',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
.secondary-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .heading {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-items: flex-start;
    align-items: center;
    gap: 0.5rem;

    span {
      font-size: 1rem;
      font-weight: 500;
      color: var(--neutral-100);
    }
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .actions {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
  }
}
</style>
