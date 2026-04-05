<template>
  <div v-if="profile" class="profile">
    <div class="profile-container">
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
          fetchpriority="high"
        />
      </div>

      <div v-if="profile.profileImage" class="avatar">
        <nuxt-img
          :src="profile.profileImage"
          :alt="profile.name"
          fetchpriority="high"
        />
      </div>

      <div class="body">
        <div class="heading">
          <span class="name">{{ profile.name }}</span>

          <span
            class="handle"
            :style="{
              color: profile.handleColor
                ? `#${profile.handleColor}`
                : 'var(--neutral-400)',
            }"
          >
            @{{ profile.handle }}
          </span>

          <span
            class="bio"
            :style="{
              color: profile.bioColor
                ? `#${profile.bioColor}`
                : 'var(--neutral-400)',
            }"
          >
            {{ profile.bio }}
          </span>
        </div>

        <div class="content">
          <div class="primary-links">
            <PButton
              v-for="link in profile.primaryLinks"
              :key="link.id"
              class="default"
              :title="link.platform!"
              @click="clickLink(link.id, link.url)"
            >
              <NuxtImg
                :src="`/${link.platform}.svg`"
                :alt="link.platform"
                loading="lazy"
              />
            </PButton>
          </div>

          <div class="secondary-links">
            <PButton
              v-for="link in profile.secondaryLinks"
              :key="link.id"
              class="default"
              severity="secondary"
              :title="link.title!"
              :style="[
                link.backgroundColors
                  ? link.backgroundColors.length === 1
                    ? `background-color: #${link.backgroundColors[0]}`
                    : `background-image: linear-gradient(to right, ${link.backgroundColors
                        .map((color) => `#${color}`)
                        .join(', ')});`
                  : 'background-color: transparent',
              ]"
              @click="clickLink(link.id, link.url)"
            >
              <NuxtImg
                v-if="link.backgroundImage"
                :src="link.backgroundImage"
                :alt="link.title"
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
                    : 'color: var(--neutral-100)',
                ]"
              >
                {{ link.title }}
              </span>
            </PButton>
          </div>

          <div class="copyright">
            <div class="content">
              <span>With ❤️ by</span>
              <NuxtLink to="/" target="_blank" external>Popli.one</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

definePageMeta({
  layout: 'profile',
});

const route = useRoute();
const requestUrl = useRequestURL();
const {
  public: { images },
} = useRuntimeConfig();
const { username } = route.params;

const { data: profile } = await useApiJson(
  EApiEndpoint.PROFILE_GET,
  {},
  {},
  { handle: username },
);

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
const previewImage = computed(
  () => profile?.coverImage || profile?.profileImage || images.logo,
);
const canonicalUrl = computed(() => {
  return `${requestUrl.origin}${route.fullPath}`;
});

useHead({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl,
    },
  ],
});

useSeoMeta({
  title: pageTitle,
  description: pageDescription,
  ogType: 'profile',
  ogTitle: pageTitle,
  ogDescription: pageDescription,
  ogUrl: canonicalUrl,
  ogImage: previewImage,
  twitterCard: 'summary_large_image',
  twitterTitle: pageTitle,
  twitterDescription: pageDescription,
  twitterImage: previewImage,
  robots: () => (profile ? 'index, follow' : 'noindex, nofollow'),
});

onMounted(() => {
  if (!profile) {
    return navigateTo('/');
  }

  useApiJson(EApiEndpoint.PROFILE_ACCESS, {}, {}, { handle: username });
});

const clickLink = async (id: string, url: string) => {
  useApiJson(EApiEndpoint.URL_LINK_CLICK, {}, {}, { id });

  return navigateTo(url, { external: true, open: { target: '_blank' } });
};
</script>

<style scoped lang="scss">
.profile {
  width: 100lvw;
  height: 100lvh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .profile-container {
    position: relative;
    height: 60rem;
    width: 30rem;
    border: 1px solid color-mix(in oklab, var(--neutral-400) 20%, transparent);
    border-radius: 3rem;
    z-index: 10;
    overflow: hidden;

    .background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 30%;
      width: 100%;
      overflow: hidden;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background-image: var(--linear-gradient-primary);

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
      right: 2rem;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      padding: 0.125rem;
      background-image: var(--linear-gradient-primary);
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

    .body {
      position: relative;
      width: 100%;
      height: 100%;
      padding-top: 10rem;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
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
        justify-content: flex-start;
        gap: 0.25rem;
        background-image: linear-gradient(
          to bottom,
          transparent 20%,
          var(--background-primary)
        );
        min-height: 6rem;

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
          font-size: 1rem;
          font-weight: 400;
          color: var(--neutral-400);
        }
      }

      .content {
        width: 100%;
        height: 100%;
        background-color: var(--background-primary);
        display: flex;
        flex-direction: column;
        align-items: center;

        .primary-links {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 0;

          .p-button {
            padding: 0;
            border: none;
            box-shadow: none;
            background: none;
            width: 1.75rem;
            height: 1.75rem;
            border-radius: 50%;
            background-image: var(--linear-gradient-primary);
            overflow: hidden;
            min-width: unset;
            corner-shape: unset;

            img {
              width: 1.25rem;
              height: 1.25rem;
            }
          }
        }

        .secondary-links {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 2rem;

          .p-button {
            width: 100%;
            height: 4rem;
            overflow: hidden;
            border: 1px solid
              color-mix(in oklab, var(--neutral-400) 20%, transparent);
            border-radius: 0.5rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1rem;
            position: relative;
            z-index: 20;

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
              color: var(--neutral-100);
              z-index: 30;
            }
          }
        }

        .copyright {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding: 1rem;

          .content {
            height: fit-content;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;

            span {
              font-size: 0.875rem;
              font-weight: 400;
              color: var(--neutral-400);
            }

            a {
              font-size: 0.875rem;
              font-weight: 400;
              color: transparent;
              text-decoration: none;
              background-image: var(--linear-gradient-primary);
              background-clip: text;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile {
    .profile-container {
      height: 100lvh;
      width: 100lvw;
      border-radius: 0;
      border: none;
    }
  }
}
</style>
