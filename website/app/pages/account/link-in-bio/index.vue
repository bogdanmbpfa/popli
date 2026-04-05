<template>
  <div v-if="user" class="link-in-bio">
    <div class="preview">
      <div class="preview-container">
        <div class="phone-top-bar">
          <span class="time">{{ currentTime }}</span>

          <div class="dynamic-island" />

          <div class="network-battery">
            <Icon class="info" name="material-symbols:android-wifi-3-bar" size="1rem" />

            <Icon class="info" name="material-symbols-light:battery-android-5" size="1rem" />
          </div>
        </div>

        <div class="preview-body">
          <div class="background">
            <Icon
              v-if="!profile.coverImage"
              class="info"
              name="material-symbols:person"
              size="14rem"
            />

            <nuxt-img
              v-else
              :src="profile.coverImage"
              :alt="profile.name"
              loading="lazy"
            />
          </div>

          <div v-if="profile.profileImage" class="avatar">
            <nuxt-img
              :src="profile.profileImage"
              :alt="profile.name"
              loading="lazy"
            />
          </div>

          <div class="preview-content">
            <div class="heading">
              <span v-if="profile.name" class="name">{{ profile.name }}</span>

              <div v-if="profile.handle" class="handle-container">
                <span
                  class="handle"
                  :style="{
                    color: profile.handleColor
                      ? `#${profile.handleColor}`
                      : 'var(--text-300)',
                  }"
                  @click="copyProfileLink"
                >
                  @{{ profile.handle }}
                </span>
              </div>

              <span
                v-if="profile.bio"
                class="bio"
                :style="{
                  color: profile.bioColor
                    ? `#${profile.bioColor}`
                    : 'var(--text-300)',
                }"
              >
                {{ profile.bio }}
              </span>
            </div>

            <div class="body">
              <div class="featured-links">
                <NuxtLink
                  v-for="link in featuredLinks"
                  :key="link.id"
                  :href="link.url"
                  target="_blank"
                  external
                >
                  <NuxtImg
                    :src="`/${link.platform}.svg`"
                    :alt="link.platform"
                    :title="link.platform"
                    loading="lazy"
                  />
                </NuxtLink>
              </div>

              <div class="secondary-links">
                <NuxtLink
                  v-for="link in secondaryLinks"
                  :key="link.id"
                  :href="link.url"
                  target="_blank"
                  external
                  :style="[
                    link.backgroundColors
                      ? link.backgroundColors.length === 1
                        ? `background-color: #${link.backgroundColors[0]}`
                        : `background-image: linear-gradient(to right, ${link.backgroundColors
                            .map((color) => `#${color}`)
                            .join(', ')});`
                      : 'background-color: transparent',
                  ]"
                >
                  <NuxtImg
                    v-if="link.backgroundImage"
                    :src="loadBackgroundImage(link.backgroundImage)"
                    :alt="link.title"
                    :title="link.title"
                    loading="lazy"
                  />

                  <span
                    class="title"
                    :style="[
                      link.titleColors && link.titleColors.length
                        ? link.titleColors.length === 1
                          ? `color: #${link.titleColors[0]}`
                          : `color: transparent; background-image: linear-gradient(to right, ${link.titleColors
                              .map((color) => `#${color}`)
                              .join(', ')}); background-clip: text;`
                        : 'color: var(--text-100)',
                    ]"
                  >
                    {{ link.title }}
                  </span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div :class="{ configuration: true, open: isConfigurationOpen }">
      <ProfileAvatar />

      <ProfileCover />

      <ProfileName />

      <ProfileHandle />

      <ProfileBio />

      <ProfileFeaturedLinks />

      <ProfileSecondaryLinks />
    </div>

    <PButton
      v-if="isMobile"
      class="default"
      severity="secondary edit-profile-button"
      :icon="isConfigurationOpen ? 'pi pi-times' : 'pi pi-cog'"
      :label="isConfigurationOpen ? 'Close' : 'Edit Profile'"
      @click="toggleConfiguration"
    />
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

const { isMobile } = useDevice();
const toast = useToast();
const urlStore = useUrlStore();
const userStore = useUserStore();

const isConfigurationOpen = ref(false);

const currentTime = computed(
  () => `${new Date().getHours()}:${new Date().getMinutes()}`,
);
const user = computed(() => userStore.getUser!);
const profile = computed(() => userStore.getProfile!);
const featuredLinks = computed(() => urlStore.getPrimaryLinks);
const secondaryLinks = computed(() => urlStore.getSecondaryLinks);

onMounted(async () => {
  if (!isMobile) isConfigurationOpen.value = true;

  const { data } = await useApiJson(EApiEndpoint.URL_LINKS);

  urlStore.setLinks(data ?? []);
});

const loadBackgroundImage = (image: File | string): string => {
  if (typeof image === 'string') return image;

  const imageUrl = URL.createObjectURL(image);

  return imageUrl;
};

const toggleConfiguration = () =>
  (isConfigurationOpen.value = !isConfigurationOpen.value);

const copyProfileLink = () => {
  navigator.clipboard.writeText(
    `${window.location.origin}/${profile.value.handle}`,
  );

  toast.add({
    severity: 'success',
    summary: 'Profile Link Copied',
    detail: 'The profile link has been copied to your clipboard.',
    life: 3000,
  });
};
</script>

<style lang="scss" scoped>
.link-in-bio {
  width: 100%;
  display: flex;
  flex-direction: row;
  flex: 1;
  padding: 2rem;
  position: relative;
  overflow-y: hidden;

  .preview {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    padding: 2rem;

    .preview-container {
      position: relative;
      width: 100%;
      max-width: 25rem;
      height: 100%;
      max-height: 50rem;
      border-radius: 2rem;
      background-color: black;
      overflow: hidden;

      .phone-top-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
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

      .preview-body {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 10;

        &::-webkit-scrollbar {
          display: none;
        }

        .background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 15rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          background-image: var(--linear-gradient-primary);
          z-index: 5;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }
        }

        .avatar {
          position: absolute;
          top: 3rem;
          right: 1rem;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          padding: 0.125rem;
          background-image: var(--linear-gradient-primary);
          box-shadow: var(--box-shadow-primary);
          overflow: hidden;
          z-index: 50;

          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            object-position: center;
          }
        }

        .preview-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          z-index: 20;
          overflow-x: hidden;
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-top: 9rem;
          padding-bottom: 4rem;

          &::-webkit-scrollbar {
            display: none;
          }

          .heading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            gap: 0.25rem;
            background-image: linear-gradient(to bottom, transparent, black);
            padding: 0rem 1rem 2rem;

            .name {
              font-size: 1.25rem;
              font-weight: 500;
              color: var(--neutral-100);
            }

            .handle-container {
              display: flex;
              flex-direction: row;
              gap: 0.25rem;
              position: relative;

              .handle {
                font-size: 1rem;
                font-weight: 400;
                cursor: pointer;
              }
            }

            .bio {
              font-size: 1rem;
              font-weight: 400;
            }
          }

          .body {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 2rem;
            padding: 0 1rem;
            width: 100%;
            background-color: black;

            .featured-links {
              display: flex;
              flex-direction: row;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;

              a {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 1.75rem;
                height: 1.75rem;
                border-radius: 50%;
                background-image: var(--linear-gradient-primary);
                cursor: pointer;

                img {
                  width: 1rem;
                  height: 1rem;
                }
              }
            }

            .secondary-links {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 1rem;

              a {
                width: 100%;
                height: 4rem;
                border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
                padding: 1rem;
                border-radius: 0.5rem;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                position: relative;
                cursor: pointer;
                transition-property: all;
                transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                transition-duration: 0.3s;
                overflow: hidden;

                &:hover {
                  translate: 0 calc(0.25rem * -1);
                }

                img {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  object-position: center;
                  z-index: 10;
                }

                .title {
                  font-size: 0.875rem;
                  font-weight: 500;
                  color: var(--neutral-100);
                  z-index: 20;
                }
              }
            }
          }
        }
      }
    }
  }

  .configuration {
    width: 100%;
    max-width: 40rem;
    height: calc(100lvh - 9rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem 2rem;
    border-radius: 1.5rem;
    background-color: var(--background-secondary);
    border: 1px solid
      color-mix(in oklab, var(--neutral-400) 20%, transparent);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    position: relative;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .edit-profile-button {
    position: fixed !important;
    bottom: 2rem;
    right: 2rem;
    z-index: 50;
  }
}

@media (max-width: 768px) {
  .link-in-bio {
    padding: 0;

    .preview {
      padding: 0;
      height: calc(100lvh - 5rem);

      .preview-container {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0;

        .phone-top-bar {
          display: none;
        }

        .preview-body {
          .avatar {
            position: fixed;
            top: 8rem;
          }
        }
      }
    }

    .configuration {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      visibility: hidden;
      height: 0;
      transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out,
        height 0.3s ease-in-out;

      &.open {
        opacity: 1;
        visibility: visible;
        backdrop-filter: blur(1.5rem);
        height: calc(100lvh - 5rem);
        z-index: 40;
        border-radius: 0;
        border: none;
        padding-bottom: 6rem;
      }
    }
  }
}
</style>
