<template>
  <div v-if="profile" class="profile">
    <div class="profile-container">
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

          <div class="background-image-overlay" />
        </div>
      </div>

      <div v-if="profile.profileImage" class="profile-image">
        <NuxtImg
          :src="profile.profileImage"
          :alt="profile.name || 'Profile Image'"
        />
      </div>

      <div class="profile-body">
        <div class="heading">
          <h1 v-if="profile.name" class="name">{{ profile.name }}</h1>

          <h2
            v-if="profile.handle"
            :style="{
              color: profile.handleColor || 'var(--neutral-100)',
            }"
            class="handle"
          >
            @{{ profile.handle }}
          </h2>

          <p
            v-if="profile.bio"
            :style="{
              color: profile.bioColor || 'var(--neutral-400)',
            }"
            class="bio"
          >
            {{ profile.bio }}
          </p>
        </div>

        <div class="content">
          <div class="primary-links">
            <UiButton
              v-for="link in profile.primaryLinks"
              :key="link.id"
              severity="contrast"
              :aria-label="`Visit ${link.platform} link`"
              :title="`Visit ${link.platform} link`"
              @click="clickLink(link.id, link.url)"
            >
              <NuxtImg :src="`/${link.platform}.svg`" :alt="link.platform" />
            </UiButton>
          </div>

          <div class="secondary-links">
            <UiButton
              v-for="link in profile.secondaryLinks"
              :key="link.id"
              :class="{
                'has-background':
                  link.backgroundImage ||
                  (link.backgroundColors && !!link.backgroundColors.length),
              }"
              :style="{
                backgroundColor: getCssColor(
                  link.backgroundColors,
                  false,
                  'transparent',
                ),
              }"
              :aria-label="`Visit ${link.title} link`"
              :title="`Visit ${link.title} link`"
              @click="clickLink(link.id, link.url)"
            >
              <NuxtImg
                v-if="link.backgroundImage"
                :src="link.backgroundImage"
                :alt="link.title"
              />

              <span
                :style="
                  getCssColor(link.titleColors, true, 'var(--neutral-100)')
                "
                class="title"
              >
                {{ link.title }}
              </span>
            </UiButton>
          </div>

          <div class="secondary-links">
            <UiButton
              v-for="link in profile.secondaryLinks"
              :key="link.id"
              :class="{
                'has-background':
                  link.backgroundImage ||
                  (link.backgroundColors && !!link.backgroundColors.length),
              }"
              :style="{
                backgroundColor: getCssColor(
                  link.backgroundColors,
                  false,
                  'transparent',
                ),
              }"
              :aria-label="`Visit ${link.title} link`"
              :title="`Visit ${link.title} link`"
              @click="clickLink(link.id, link.url)"
            >
              <NuxtImg
                v-if="link.backgroundImage"
                :src="link.backgroundImage"
                :alt="link.title"
              />

              <span
                :style="
                  getCssColor(link.titleColors, true, 'var(--neutral-100)')
                "
                class="title"
              >
                {{ link.title }}
              </span>
            </UiButton>
          </div>

          <div v-if="!profile.isPro" class="ad-section">
            <Adsbygoogle
              ad-format="auto"
              ad-slot="1698276428"
              :ad-full-width-responsive="true"
              :ad-style="{ display: 'block', width: '100%' }"
            />
          </div>
        </div>

        <div class="footer">
          <span class="copyright">
            Made with ❤️ by
            <a
              href="https://popli.one"
              target="_blank"
              rel="noopener noreferrer"
            >
              Popli.one
            </a>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';

import { EApiEndpoint } from '~~/enums';

definePageMeta({
  layout: 'auth',
});

const { seo } = useAppConfig();
const route = useRoute();
const requestUrl = useRequestURL();

const { username } = route.params;

const { data: profile } = await useApiJson(
  EApiEndpoint.PROFILE_GET,
  {},
  {},
  { handle: username },
);

const currentTime = computed(() => DateTime.now().toFormat('HH:mm'));
const profileName = computed(() => profile?.name || `@${username}`);
const profileHandle = computed(() => profile?.handle || String(username));
const profileBio = computed(() => profile?.bio || '');
const pageTitle = computed(
  () => `${profileName.value} (@${profileHandle.value})`,
);
const pageDescription = computed(() =>
  profileBio.value
    ? profileBio.value
    : `Discover ${profileName.value}'s links and social profiles on Popli.one.`,
);
const previewImageSource = computed(
  () => profile?.coverImage || profile?.profileImage || seo.defaultOgImagePath,
);
const absoluteOgImage = computed(() =>
  toAbsoluteUrl(requestUrl.origin, previewImageSource.value),
);

usePageSeo({
  title: pageTitle.value,
  description: pageDescription.value,
  path: route.fullPath,
  keywords:
    'Popli.one, profile, link in bio, URL shortener, QR codes, creator platform',
  ogImage: absoluteOgImage.value,
  ogType: 'profile',
  robots: 'index, follow',
});

onMounted(() => {
  if (!profile) {
    return navigateTo('/');
  }

  useApiJson(EApiEndpoint.PROFILE_ACCESS, {}, {}, { handle: username });
});

const getCssColor = (
  colors: string[] | null,
  isText: boolean | false,
  defaultValue: string | 'transparent',
) => {
  if (!colors || !colors.length)
    return `${isText ? 'color' : 'background-color'}: ${defaultValue}`;

  if (colors.length === 1)
    return `${isText ? 'color' : 'background-color'}: ${colors[0]}`;

  return `
    ${isText ? ' color: transparent; background-clip: text;' : ''}
    background-image: linear-gradient(to right, ${colors[0]}, ${colors[1]})
  `;
};

const clickLink = async (id: string, url: string) => {
  useApiJson(EApiEndpoint.URL_LINK_CLICK, {}, {}, { id });

  return navigateTo(url, { external: true, open: { target: '_blank' } });
};
</script>

<style scoped lang="scss">
.profile {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  position: relative;
  overflow-y: hidden;

  .profile-container {
    position: relative;
    width: 100%;
    max-width: 25rem;
    height: 50rem;
    display: flex;
    border-radius: 2rem;
    background-color: black;

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
      border-top-left-radius: 2rem;
      border-top-right-radius: 2rem;
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
      z-index: 10;
      width: 100%;
      height: 15rem;
      overflow: hidden;
      background-image: var(--linear-gradient-primary);
      border-top-left-radius: 2rem;
      border-top-right-radius: 2rem;
      overflow: hidden;
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

        .background-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background-image: linear-gradient(to bottom, transparent, black 60%);
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

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        border-radius: 50%;
      }
    }

    .profile-body {
      z-index: 20;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10rem 0 0;
      border-radius: 2rem;
      overflow-y: scroll;
      scrollbar-width: none;
      -ms-overflow-style: none;

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

        .name {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--neutral-100);
        }

        .handle {
          font-size: 1rem;
          font-weight: 400;
          color: var(--neutral-400);
        }

        .bio {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--neutral-400);
          margin: 0;
        }
      }

      .content {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 1rem;
        background-color: black;

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
        }

        .secondary-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;

          :deep(.ui-button) {
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
            }

            .title {
              font-size: 1rem;
              font-weight: 500;
              color: var(--neutral-100);
            }
          }
        }

        .ad-section {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 1rem;
        }
      }

      .footer {
        width: 100%;
        display: flex;
        flex: 1;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 2rem;

        .copyright {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--neutral-400);

          a {
            background-image: var(--linear-gradient-primary);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            color: transparent;
            text-decoration: none;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile {
    padding: 0;

    .profile-container {
      width: 100lvw;
      max-width: 100lvw;
      height: 100lvh;
      border-radius: 0;

      .phone-top-bar {
        display: none;
      }
    }
  }
}
</style>
