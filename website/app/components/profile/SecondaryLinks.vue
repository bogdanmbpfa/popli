<template>
  <div class="secondary-links">
    <div class="heading">
      <Icon class="info" name="material-symbols:link" size="1rem" />
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
      <PButton
        class="default"
        severity="contrast"
        label="Save"
        :disabled="!areLinksValid"
        @click="onSave"
      />

      <PButton
        class="default"
        severity="secondary"
        label="Add Link"
        icon="pi pi-plus"
        @click="onAddLink"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v7 as uuidv7 } from 'uuid';

import { EApiEndpoint, ELinkType } from '~~/enums';

const toast = useToast();
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
    links.value.map((link) =>
      useApiMultipart(EApiEndpoint.URL_LINKS_CREATE, {
        id: link.id,
        type: link.type,
        title: link.title,
        titleColors: link.titleColors,
        backgroundImage: link.backgroundImage,
        backgroundColors: link.backgroundColors,
        url: link.url,
        position: link.position,
      }),
    ),
  );

  if (createdLinks.some((result) => result.error)) {
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: createdLinks.find((result) => result.error)?.error?.message,
      life: 3000,
    });
  }

  return toast.add({
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
