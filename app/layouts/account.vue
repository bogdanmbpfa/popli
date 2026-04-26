<template>
  <div class="account-layout">
    <UiDrawer
      :visible="drawerVisible"
      :is-mobile="isMobile"
      @update:visible="toggleDrawer"
    >
      <template #header>
        <nuxt-img
          src="/logo.png"
          alt="Popli.one logo"
          loading="lazy"
          width="40"
        />

        <div class="title">
          <span class="name">Dashboard</span>

          <span v-if="profile?.handle" class="handle">
            @{{ profile.handle }}
          </span>
        </div>
      </template>

      <template #default>
        <div class="link-group">
          <span class="title">Manage</span>

          <nuxt-link
            class="default sidebar-link"
            to="/account/link-in-bio"
            @click="toggleDrawer"
          >
            <Icon name="popli:link-chain" size="1.5rem" />
            Link in Bio
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/analytics"
            @click="toggleDrawer"
          >
            <Icon name="popli:analytics-outline" size="1.5rem" />
            Analytics
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/settings"
            @click="toggleDrawer"
          >
            <Icon name="popli:settings-outline" size="1.5rem" />
            Settings
          </nuxt-link>
        </div>

        <div class="link-group">
          <span class="title">Tools</span>

          <nuxt-link
            class="default sidebar-link"
            to="/account/url-shortener"
            @click="toggleDrawer"
          >
            <Icon name="popli:link-chain" size="1.5rem" />
            URL Shortener
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/qr-code"
            @click="toggleDrawer"
          >
            <Icon name="popli:outline-qr-code-scanner" size="1.5rem" />
            QR Code
          </nuxt-link>
        </div>
      </template>

      <template #footer>
        <div class="actions">
          <nuxt-link class="default sidebar-link" to="/" @click="toggleDrawer">
            <Icon name="popli:home-outline" size="1.25rem" />
            Home
          </nuxt-link>

          <UiButton
            class="naked"
            severity="danger"
            icon="popli:sign-out"
            label="Sign Out"
            aria-label="Sign out"
            @click="signOut"
          />
        </div>
      </template>
    </UiDrawer>

    <div class="wrapper" :class="{ 'drawer-open': drawerVisible }">
      <div class="top-bar">
        <UiButton
          v-if="isMobile"
          class="naked"
          severity="secondary"
          icon="popli:bars"
          aria-label="Toggle drawer"
          @click="toggleDrawer"
        />

        <div class="title">
          <span class="name">{{ heading.name }}</span>

          <span class="description">{{ heading.description }}</span>
        </div>

        <UiButton
          v-if="isMobile"
          class="naked"
          severity="secondary"
          icon="popli:bars"
          @click="navigationVisible = !navigationVisible"
        />
      </div>

      <div v-if="isMobile" class="navigation" :class="{ visible: navigationVisible }">
        <UiButton
          class="naked"
          severity="contrast"
          icon="popli:times-outline"
          @click="navigationVisible = false"
        />

        <NuxtLink to="/account/link-in-bio">
          <Icon name="popli:link-chain" size="1.5rem" />
          Link in Bio
        </NuxtLink>

        <NuxtLink to="/account/analytics">
          <Icon name="popli:analytics-outline" size="1.5rem" />
          Analytics
        </NuxtLink>

        <NuxtLink to="/account/settings">
          <Icon name="popli:settings-outline" size="1.5rem" />
          Settings
        </NuxtLink>

        <NuxtLink to="/account/url-shortener">
          <Icon name="popli:link-chain" size="1.5rem" />
          URL Shortener
        </NuxtLink>

        <NuxtLink to="/account/qr-code">
          <Icon name="popli:outline-qr-code-scanner" size="1.5rem" />
          QR Code
        </NuxtLink>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

const { seo } = useAppConfig();
const { isMobile } = useDevice();
const route = useRoute();
const uiToast = useUiToast();
const userStore = useUserStore();

const drawerVisible = ref(true);
const navigationVisible = ref(false);

const heading = computed(() => {
  switch (route.path) {
    case '/account/link-in-bio':
      return {
        name: 'Link in Bio',
        description: 'Create a link in bio for your account.',
      };
    case '/account/appearance':
      return {
        name: 'Appearance',
        description: 'Customize your account appearance.',
      };
    case '/account/analytics':
      return { name: 'Analytics', description: 'View your account analytics.' };
    case '/account/settings':
      return {
        name: 'Account Settings',
        description:
          'Manage your personal information, security preferences and account status.',
      };
    case '/account/url-shortener':
      return {
        name: 'URL Shortener',
        description:
          'Create and manage your short links with precision. Deploy high-performance redirects with custom aliases and real-time tracking.',
      };
    case '/account/qr-code':
      return {
        name: 'QR Code',
        description: 'Create a QR code for your account.',
      };
    case '/account/digital-store':
      return {
        name: 'Digital Store',
        description: 'Create a digital store for your account.',
      };
    default:
      return {
        name: 'Profile',
        description: 'Update your profile information.',
      };
  }
});

useHead({
  title: () => `${heading.value.name} — ${seo.siteName}`,
});

useSeoMeta({
  robots: 'noindex, nofollow',
  description: () => heading.value.description,
});

const profile = computed(() => userStore.getProfile!);

onMounted(async () => {
  const [{ data: userData }, { data: profileData }] = await Promise.all([
    useApiJson(EApiEndpoint.ACCOUNT_ME),
    useApiJson(EApiEndpoint.ACCOUNT_PROFILE),
  ]);

  userStore.setUser(userData ? { ...userData! } : null);
  userStore.setProfile(profileData ? { ...profileData! } : null);
});

if (isMobile) drawerVisible.value = false;

const toggleDrawer = () => {
  if (!isMobile) return;

  drawerVisible.value = !drawerVisible.value;
};

const signOut = async () => {
  const { error } = await useApiJson(EApiEndpoint.AUTH_LOGOUT);

  if (error) {
    return uiToast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000,
      closable: false,
    });
  }

  userStore.setUser(null);
  userStore.setProfile(null);

  uiToast.add({
    severity: 'success',
    summary: 'Signed Out',
    detail: 'You have been signed out successfully.',
    life: 3000,
    closable: false,
  });

  return navigateTo('/');
};
</script>

<style lang="scss" scoped>
.account-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100lvh;
  position: relative;
  width: 100%;

  :deep(.ui-drawer-overlay) {
    .ui-drawer {
      .header {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;

        .title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .name {
            font-size: 1.25rem;
            font-weight: 500;
            color: var(--neutral-100);
          }

          .handle {
            font-size: 0.875rem;
            color: var(--neutral-400);
          }
        }
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .link-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .title {
            font-size: 0.75rem;
            font-weight: 500;
            color: var(--neutral-100);
          }

          .sidebar-link {
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            align-items: center;
          }
        }
      }

      .footer {
        .actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .sidebar-link {
            width: fit-content;
          }

          .ui-button {
            width: fit-content;
          }
        }
      }
    }
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100lvh;
    position: relative;
    width: 100%;
    padding-left: 0;
    padding-top: 5rem;
    transition: padding-left 0.3s ease-in-out;

    &.drawer-open {
      padding-left: 20rem;

      .top-bar {
        left: 20rem;
        width: calc(100% - 20rem);
      }
    }

    .top-bar {
      position: fixed;
      top: 0;
      left: 0;
      transition: left 0.3s ease-in-out, width 0.3s ease-in-out;
      right: 0;
      width: 100%;
      height: 100%;
      max-height: 5rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid
        color-mix(in oklab, var(--neutral-800) 30%, transparent);
      background-color: var(--background-secondary);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 10;

      .title {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .name {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--neutral-100);
        }

        .description {
          font-size: 0.875rem;
          color: var(--neutral-400);
        }
      }
    }

    .navigation {
      position: fixed;
      top: -100lvh;
      left: 0;
      width: 100lvw;
      height: 100lvh;
      background-color: var(--background-primary);
      transition: top 0.3s ease-in-out;
      z-index: 50;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;

      &.visible {
        top: 0;
      }
    }
  }
}

@media (max-width: 1028px) {
  .account-layout {
    .wrapper {
      &.drawer-open {
        padding-left: 0;

        .top-bar {
          left: 0;
          width: 100%;
        }
      }
    }
  }

  .ui-drawer-overlay:has(.ui-drawer) {
    position: fixed !important;
    max-height: 100lvh !important;

    .ui-drawer {
      background-color: oklch(0.1773 0.0133 264.14);
    }
  }
}

@media (max-width: 768px) {
  .account-layout {
    .wrapper {
      .top-bar {
        .title {
          .description {
            display: none;
          }
        }
      }
    }
  }
}
</style>
