<template>
  <div class="featured-links">
    <div class="heading">
      <Icon class="info" name="popli:link-2" size="1rem" />
      <span>Featured Links</span>
    </div>

    <div class="platforms">
      <PButton
        v-for="platform in platforms.slice(0, visiblePlatformsCount)"
        :key="platform.type"
        class="default"
        severity="help"
        :title="platform.name"
        :aria-label="`Add ${platform.name} link`"
        fluid
        @click="onAddLink(platform)"
      >
        <NuxtImg
          :src="`/${platform.type}.svg`"
          :alt="platform.name"
          loading="lazy"
        />
      </PButton>

      <PButton
        v-if="!expandedPlatforms"
        class="default"
        severity="secondary"
        :label="`+ ${platforms.length - visiblePlatformsCount}`"
        fluid
        aria-label="Expand platforms"
        @click="
          expandedPlatforms = true;
          visiblePlatformsCount = platforms.length;
        "
      />
    </div>

    <div class="links">
      <ProfileFeaturedLink
        v-for="link in links"
        :key="link.id"
        :link="link"
        :last-position="links[links.length - 1]?.position ?? 0"
      />
    </div>

    <PButton
      class="default"
      severity="contrast"
      label="Save"
      aria-label="Save featured links"
      :disabled="!areLinksValid"
      @click="onSave"
    />
  </div>
</template>

<script setup lang="ts">
import { v7 as uuidv7 } from 'uuid';

import { EApiEndpoint, ELinkPlatform, ELinkType } from '~~/enums';

const toast = useToast();
const urlStore = useUrlStore();

const visiblePlatformsCount = ref(4);
const expandedPlatforms = ref(false);

const platforms = ref([
  {
    type: ELinkPlatform.FACEBOOK,
    name: 'Facebook',
  },
  {
    type: ELinkPlatform.INSTAGRAM,
    name: 'Instagram',
  },
  {
    type: ELinkPlatform.TIKTOK,
    name: 'TikTok',
  },
  {
    type: ELinkPlatform.X,
    name: 'X',
  },
  {
    type: ELinkPlatform.DISCORD,
    name: 'Discord',
  },
  {
    type: ELinkPlatform.LINKEDIN,
    name: 'LinkedIn',
  },
  {
    type: ELinkPlatform.GITHUB,
    name: 'GitHub',
  },
  {
    type: ELinkPlatform.TWITCH,
    name: 'Twitch',
  },
  {
    type: ELinkPlatform.YOUTUBE,
    name: 'YouTube',
  },
]);

const areLinksValid = computed(() => {
  if (!links.value.length) return false;

  return links.value.every((link) => {
    if (!link.url) return false;

    let isUrlValid = false;

    switch (link.platform) {
      case ELinkPlatform.X:
        isUrlValid = link.url.startsWith('https://x.com/');
        break;
      case ELinkPlatform.INSTAGRAM:
        isUrlValid = link.url.startsWith('https://instagram.com/');
        break;
      case ELinkPlatform.TIKTOK:
        isUrlValid = link.url.startsWith('https://tiktok.com/@');
        break;
      case ELinkPlatform.YOUTUBE:
        isUrlValid = link.url.startsWith('https://youtube.com/');
        break;
      case ELinkPlatform.FACEBOOK:
        isUrlValid = link.url.startsWith('https://facebook.com/');
        break;
      case ELinkPlatform.LINKEDIN:
        isUrlValid = link.url.startsWith('https://linkedin.com/');
        break;
      case ELinkPlatform.GITHUB:
        isUrlValid = link.url.startsWith('https://github.com/');
        break;
      case ELinkPlatform.TWITCH:
        isUrlValid = link.url.startsWith('https://twitch.tv/');
        break;
      case ELinkPlatform.DISCORD:
        isUrlValid = link.url.startsWith('https://discord.com/');
        break;
      default:
        isUrlValid = false;
        break;
    }

    return isUrlValid;
  });
});
const links = computed(() => urlStore.getPrimaryLinks);

const onAddLink = (platform: { type: ELinkPlatform; name: string }) =>
  urlStore.addLink({
    id: uuidv7(),
    type: ELinkType.PRIMARY,
    platform: platform.type,
    position: links.value.length,
  });

const onSave = async () => {
  if (!areLinksValid.value) return;

  const createdLinks = await Promise.all(
    links.value.map((link) =>
      useApiMultipart(EApiEndpoint.URL_LINKS_CREATE, {
        id: link.id,
        type: ELinkType.PRIMARY,
        platform: link.platform,
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
@use '../../assets/mixins.scss' as *;

.featured-links {
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
      color: var(--color-neutral-100);
    }

    .iconify {
      filter: brightness(0) saturate(100%) invert(100%) sepia(46%) saturate(51%)
        hue-rotate(202deg) brightness(115%) contrast(96%);
    }
  }

  .platforms {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;

    .p-button {
      min-width: unset;
      max-width: 6.35rem;

      img {
        width: 1rem;
        height: 1rem;
      }
    }
  }

  .links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 768px) {
  .featured-links {
    .platforms {
      .p-button {
        max-width: 3.275rem;
      }
    }
  }
}
</style>
