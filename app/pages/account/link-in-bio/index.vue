<template>
  <div v-if="user" class="link-in-bio">
    <div class="preview">
      <div class="phone-top-bar">
        <span class="time">{{ currentTime }}</span>

        <div class="dynamic-island" />

        <div class="network-battery">
          <Icon class="info" name="popli:android-wifi-3-bar" size="1rem" />

          <Icon class="info" name="popli:battery-android-5" size="1rem" />
        </div>
      </div>

      <div class="background-image">
        <div class="background-image-container">
          <NuxtImg
            v-if="profile.coverImage"
            :src="profile.coverImage"
            :alt="profile.name || 'Cover'"
          />

          <UiButton
            severity="primary"
            label="Change cover"
            aria-label="Change cover"
            title="Change cover"
            @click="openUpdateCoverImageDialog"
          />
        </div>
      </div>

      <div class="profile-image">
        <div class="profile-image-container">
          <NuxtImg
            v-if="profile.profileImage"
            :src="profile.profileImage"
            :alt="profile.name || 'Profile Image'"
          />

          <UiButton
            naked
            severity="contrast"
            icon="popli:image"
            icon-size="1.5rem"
            aria-label="Change profile image"
            title="Change profile image"
            @click="openUpdateProfileImageDialog"
          />
        </div>
      </div>

      <div class="action-buttons">
        <UiButton
          v-if="profile.handle"
          class="naked"
          severity="info"
          icon="popli:link-2"
          icon-size="1.5rem"
          aria-label="Copy profile link"
          title="Copy profile link"
          @click="copyProfileLink"
        />

        <UiButton
          v-if="profile.handle"
          class="naked"
          severity="info"
          icon="popli:qr-code-scanner"
          icon-size="1.5rem"
          aria-label="Show profile QR code"
          title="Show profile QR code"
          @click="showProfileQrCode"
        />
      </div>

      <div class="preview-body">
        <div class="heading">
          <UiButton
            class="name-button"
            severity="primary"
            :label="profile.name || 'Add name'"
            aria-label="Change name"
            @click="openUpdateNameDialog"
          />

          <UiButton
            severity="primary"
            :style="{
              color: profile.handleColor || 'var(--neutral-400)',
            }"
            :label="profile.handle ? `@${profile.handle}` : 'Add handle'"
            aria-label="Change handle"
            @click="openUpdateHandleDialog"
          />

          <UiButton
            severity="primary"
            :style="{
              color: profile.bioColor || 'var(--neutral-400)',
            }"
            :label="profile.bio || 'Add bio'"
            aria-label="Change bio"
            @click="openUpdateBioDialog"
          />
        </div>

        <div class="content">
          <UiMessage v-if="hasReachedLinksLimit" severity="info">
            You have reached the limit of your free plan.<br/>You can update or
            replace your existing links at any time.
          </UiMessage>

          <div class="primary-links">
            <draggable
              v-model="featuredLinks"
              item-key="id"
              class="primary-links-track"
              @end="onUpdatePrimaryLinkPosition"
            >
              <template #item="{ element }">
                <UiButton
                  severity="contrast"
                  :title="element.url"
                  :aria-label="`Edit ${element.platform} link`"
                  @click="openUpdatePrimaryLinkDialog(element)"
                >
                  <NuxtImg
                    :src="`/${element.platform}.svg`"
                    :alt="element.platform"
                  />
                </UiButton>
              </template>

              <template #footer>
                <UiButton
                  v-if="
                    hasProPlan ||
                    linksCounters.primaryLinkCount < featuredLinksLimit
                  "
                  severity="contrast"
                  icon="popli:plus"
                  icon-size="1rem"
                  aria-label="Add primary link"
                  title="Add primary link"
                  @click="openUpdatePrimaryLinkDialog(null)"
                />
              </template>
            </draggable>
          </div>

          <span v-if="hasMultipleLinks" class="rearange-links-hint">
            Rearrange links by dragging and dropping.
          </span>

          <div class="secondary-links">
            <UiButton
              v-if="
                hasProPlan ||
                linksCounters.secondaryLinkCount < secondaryLinksLimit
              "
              severity="contrast"
              icon="popli:plus"
              icon-size="1rem"
              label="Add secondary link"
              aria-label="Add secondary link"
              title="Add secondary link"
              fluid
              @click="openUpdateSecondaryLinkDialog(null)"
            />

            <draggable
              v-model="secondaryLinks"
              item-key="id"
              class="secondary-links-track"
              @end="onUpdateSecondaryLinkPosition"
            >
              <template #item="{ element }">
                <UiButton
                  :class="{
                    'has-background':
                      element.backgroundImage ||
                      (element.backgroundColors &&
                        !!element.backgroundColors.length),
                  }"
                  :style="
                    getCssColor(element.backgroundColors, false, 'transparent')
                  "
                  severity="primary"
                  :title="element.title"
                  :aria-label="`Edit ${element.title} link`"
                  @click="openUpdateSecondaryLinkDialog(element)"
                >
                  <NuxtImg
                    v-if="element.backgroundImage"
                    :src="element.backgroundImage"
                    :alt="element.title"
                    loading="lazy"
                  />

                  <span
                    class="title"
                    :style="
                      getCssColor(
                        element.titleColors,
                        true,
                        'var(--neutral-100)',
                      )
                    "
                  >
                    {{ element.title }}
                  </span>
                </UiButton>
              </template>
            </draggable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import orderBy from 'lodash/orderBy';
import { DateTime } from 'luxon';
import draggable from 'vuedraggable';

import ProfileQrCodeDialog from '~/components/dialog/ProfileQrCode.vue';
import UpdateBioDialog from '~/components/dialog/UpdateBio.vue';
import UpdateCoverImageDialog from '~/components/dialog/UpdateCoverImage.vue';
import UpdateHandleDialog from '~/components/dialog/UpdateHandle.vue';
import UpdateNameDialog from '~/components/dialog/UpdateName.vue';
import UpdatePrimaryLinkDialog from '~/components/dialog/UpdatePrimaryLink.vue';
import UpdateProfileImageDialog from '~/components/dialog/UpdateProfileImage.vue';
import UpdateSecondaryLinkDialog from '~/components/dialog/UpdateSecondaryLink.vue';
import { EApiEndpoint, ELinkType, EPlanType } from '~~/enums';
import type { ILink } from '~~/interfaces';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const { copy } = useClipboard();
const {
  public: {
    errorMessages,
    freePlan: { featuredLinksLimit, secondaryLinksLimit },
    siteUrl,
  },
} = useRuntimeConfig();
const uiDynamicDialog = useUiDynamicDialog();
const uiToast = useUiToast();
const userStore = useUserStore();

const featuredLinks = ref<ILink[]>([]);
const secondaryLinks = ref<ILink[]>([]);

const { data: linksCounters, refresh: refreshLinksCounters } =
  await useAsyncData(
    'links-counters',
    () => useApiJson(EApiEndpoint.ACCOUNT_COUNTERS),
    {
      default: () => ({ primaryLinkCount: 0, secondaryLinkCount: 0 }),
      transform: (data) =>
        data.data ?? { primaryLinkCount: 0, secondaryLinkCount: 0 },
    },
  );

const { data: links, refresh: refreshLinks } = await useAsyncData(
  'links',
  () => useApiJson(EApiEndpoint.URL_LINKS),
  {
    default: () => [],
    transform: (data) => data.data ?? [],
  },
);

const currentTime = computed(() => DateTime.now().toFormat('HH:mm'));
const hasMultipleLinks = computed(() => {
  return featuredLinks.value.length >= 2 || secondaryLinks.value.length >= 2;
});
const hasProPlan = computed(() => user.value?.plan === EPlanType.PRO);
const hasReachedLinksLimit = computed(() => {
  const hasReachedFeaturedLinksLimit =
    linksCounters.value.primaryLinkCount >= featuredLinksLimit;
  const hasReachedSecondaryLinksLimit =
    linksCounters.value.secondaryLinkCount >= secondaryLinksLimit;

  return (
    !hasProPlan.value &&
    (hasReachedFeaturedLinksLimit || hasReachedSecondaryLinksLimit)
  );
});
const profile = computed(() => userStore.getProfile!);
const user = computed(() => userStore.getUser!);

onMounted(() => {
  if (user.value && !user.value.emailConfirmedAt) {
    uiToast.add({
      severity: 'info',
      detail: errorMessages.emailNotConfirmed,
      life: 3000,
    });

    return navigateTo('/account/settings');
  }

  if (links.value && !!links.value.length) {
    featuredLinks.value = orderBy(
      links.value.filter((l) => l.type === ELinkType.PRIMARY),
      'position',
    );
    secondaryLinks.value = orderBy(
      links.value.filter((l) => l.type === ELinkType.SECONDARY),
      'position',
    );
  }
});

const copyProfileLink = async () => {
  if (!profile.value.handle) return;

  await copy(`${siteUrl}/${profile.value.handle}`);

  uiToast.add({
    severity: 'success',
    summary: 'Profile Link Copied',
    detail: 'The profile link has been copied to your clipboard.',
    life: 3000,
  });
};

const showProfileQrCode = () => {
  uiDynamicDialog.open({
    component: markRaw(ProfileQrCodeDialog),
    header: '',
    props: { handle: profile.value.handle },
    widthFit: true,
    hideCloseButton: true,
  });
};

const openUpdateProfileImageDialog = () => {
  uiDynamicDialog.open({
    component: markRaw(UpdateProfileImageDialog),
    header: 'Update Profile Image',
    props: { profileImage: profile.value.profileImage },
  });
};

const openUpdateCoverImageDialog = () => {
  uiDynamicDialog.open({
    component: markRaw(UpdateCoverImageDialog),
    header: 'Update Cover Image',
    props: { coverImage: profile.value.coverImage },
  });
};

const openUpdateNameDialog = () => {
  uiDynamicDialog.open({
    component: markRaw(UpdateNameDialog),
    header: 'Update Name',
    props: { name: profile.value.name },
  });
};

const openUpdateHandleDialog = () => {
  uiDynamicDialog.open({
    component: markRaw(UpdateHandleDialog),
    header: 'Update Handle',
    props: {
      handle: profile.value.handle,
      handleColor: profile.value.handleColor,
    },
  });
};

const openUpdateBioDialog = () => {
  uiDynamicDialog.open({
    component: markRaw(UpdateBioDialog),
    header: 'Update Bio',
    props: { bio: profile.value.bio, bioColor: profile.value.bioColor },
  });
};

const openUpdatePrimaryLinkDialog = (link: ILink | null) => {
  uiDynamicDialog.open({
    component: markRaw(UpdatePrimaryLinkDialog),
    header: link
      ? `Update ${link.platform!.toUpperCase()} Link`
      : 'Add Primary Link',
    props: { link, position: featuredLinks.value.length },
    onClose: async () => {
      await refreshLinks();
      await refreshLinksCounters();

      featuredLinks.value = orderBy(
        links.value.filter((l) => l.type === ELinkType.PRIMARY),
        'position',
      );
      secondaryLinks.value = orderBy(
        links.value.filter((l) => l.type === ELinkType.SECONDARY),
        'position',
      );
    },
  });
};

const openUpdateSecondaryLinkDialog = (link: ILink | null) => {
  uiDynamicDialog.open({
    component: markRaw(UpdateSecondaryLinkDialog),
    header: link ? `Update ${link.title} Link` : 'Add Secondary Link',
    props: { link, position: secondaryLinks.value.length },
    onClose: async () => {
      await refreshLinks();
      await refreshLinksCounters();

      featuredLinks.value = orderBy(
        links.value.filter((l) => l.type === ELinkType.PRIMARY),
        'position',
      );
      secondaryLinks.value = orderBy(
        links.value.filter((l) => l.type === ELinkType.SECONDARY),
        'position',
      );
    },
  });
};

const onUpdatePrimaryLinkPosition = async () => {
  const { error } = await useApiJson(EApiEndpoint.URL_LINK_POSITION, {
    links: featuredLinks.value.map((link, index) => ({
      id: link.id,
      position: index,
    })),
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Primary link positions updated successfully',
    life: 3000,
  });
};

const onUpdateSecondaryLinkPosition = async () => {
  const { error } = await useApiJson(EApiEndpoint.URL_LINK_POSITION, {
    links: secondaryLinks.value.map((link, index) => ({
      id: link.id,
      position: index,
    })),
  });

  if (error) {
    return uiToast.add({
      severity: 'error',
      detail: error.message,
      life: 3000,
    });
  }

  return uiToast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Secondary link positions updated successfully',
    life: 3000,
  });
};

const getCssColor = (
  colors: string[] | null,
  isText: boolean | false,
  defaultValue: string | 'transparent',
) => {
  if (!colors || !colors.length)
    return `${isText ? 'color' : 'background-color'}: ${defaultValue};`;

  if (colors.length === 1)
    return `${isText ? 'color' : 'background-color'}: ${colors[0]};`;

  return `
    ${isText ? ' color: transparent; background-clip: text;' : ''}
    background-image: linear-gradient(to right, ${colors[0]}, ${colors[1]});
  `;
};
</script>

<style lang="scss" scoped>
.link-in-bio {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  position: relative;
  overflow-y: hidden;

  .preview {
    position: relative;
    width: 100%;
    max-width: 25rem;
    height: 100%;
    height: 50rem;
    display: flex;
    border-radius: 2rem;
    background-color: black;
    overflow: hidden;

    .phone-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 0.5rem 1rem;
      z-index: 30;

      .time {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--neutral-100);
      }

      .dynamic-island {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: 6rem;
        height: 1.5rem;
        background-color: var(--background-primary);
        border-radius: 3rem;
      }

      .network-battery {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .background-image {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      width: 100%;
      height: 15rem;
      overflow: hidden;
      background-image: var(--linear-gradient-primary);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .background-image-container {
        position: relative;
        width: 100%;
        height: 100%;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        :deep(.ui-button) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          width: fit-content;
          height: fit-content;
          border: none;
          background-color: color-mix(
            in oklab,
            var(--neutral-400) 40%,
            transparent
          );
          color: var(--neutral-100);
          border-radius: 1.5rem;
          padding: 0.5rem 2rem;
          opacity: 0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .profile-image {
      position: absolute;
      top: 4rem;
      right: 2rem;
      z-index: 40;
      width: 3rem;
      height: 3rem;
      overflow: hidden;
      background-image: var(--linear-gradient-primary);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.125rem;

      .profile-image-container {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        :deep(.ui-button) {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          margin: auto;
          opacity: 0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

          &:hover {
            opacity: 1;
          }
        }
      }
    }

    .action-buttons {
      position: absolute;
      top: 4rem;
      left: 2rem;
      z-index: 30;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .preview-body {
      width: 100%;
      z-index: 20;
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      padding: 10rem 0 0;
      overflow-y: scroll;
      scrollbar-width: none;
      -ms-overflow-style: none;
      pointer-events: none;

      &::-webkit-scrollbar {
        display: none;
      }

      .heading {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background-image: linear-gradient(to bottom, transparent, black 60%);
        pointer-events: auto;

        :deep(.ui-button) {
          padding: 0;

          &:hover {
            text-decoration: underline;
          }

          &.name-button {
            font-size: 1.5rem;
            font-weight: 500;
            color: var(--neutral-100);
          }
        }
      }

      .content {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        background-color: black;
        padding: 1rem;
        pointer-events: auto;

        .primary-links {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          :deep(.ui-button) {
            padding: 0.25rem;
            border-radius: 50%;

            img {
              width: 1rem;
              height: 1rem;
              object-fit: cover;
              object-position: center;
            }
          }

          :deep(.primary-links-track) {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
        }

        .rearange-links-hint {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--neutral-400);
        }

        .secondary-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          :deep(.secondary-links-track) {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            .ui-button {
              position: relative;
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0;
              height: 8rem;
              overflow: hidden;
              border: 2px solid
                color-mix(in oklab, var(--neutral-400) 20%, transparent);
              border-radius: 1rem;

              &.has-background {
                border: none;
              }

              img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                z-index: 20;
              }

              .title {
                font-size: 1rem;
                font-weight: 500;
                z-index: 30;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .link-in-bio {
    padding: 0;

    .preview {
      width: 100%;
      height: calc(100lvh - 5rem);
      border-radius: 0;

      .phone-top-bar {
        display: none;
      }
    }
  }
}
</style>
