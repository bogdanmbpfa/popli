<template>
  <div class="account-layout">
    <PDrawer
      v-model:visible="drawerVisible"
      class="default sidebar"
      :show-close-icon="false"
      :close-on-escape="false"
      position="left"
    >
      <template #header>
        <nuxt-img src="/logo.png" alt="Popli.one logo" loading="lazy" />

        <div class="title">
          <span class="name">Dashboard</span>

          <span v-if="profile?.handle" class="handle"
            >@{{ profile.handle }}</span
          >
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
            <Icon name="akar-icons:link-chain" size="1.5rem" />
            Link in Bio
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/analytics"
            @click="toggleDrawer"
          >
            <Icon name="material-symbols:analytics-outline" size="1.5rem" />
            Analytics
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/settings"
            @click="toggleDrawer"
          >
            <Icon name="material-symbols:settings-outline" size="1.5rem" />
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
            <Icon name="akar-icons:link-chain" size="1.5rem" />
            URL Shortener
          </nuxt-link>

          <nuxt-link
            class="default sidebar-link"
            to="/account/qr-code"
            @click="toggleDrawer"
          >
            <Icon name="ic:outline-qr-code-scanner" size="1.5rem" />
            QR Code
          </nuxt-link>
        </div>
      </template>

      <template #footer>
        <nuxt-link class="default sidebar-link" to="/" @click="toggleDrawer">
          <Icon name="material-symbols:home-outline" size="1.5rem" />
          Home
        </nuxt-link>

        <PButton
          class="default"
          severity="danger icon-only"
          icon="pi pi-sign-out"
          label="Sign Out"
          aria-label="Sign out"
          @click="signOut"
        />
      </template>
    </PDrawer>

    <div class="wrapper" :class="{ 'drawer-open': drawerVisible }">
      <div class="top-bar">
        <PButton
          v-if="isMobile"
          class="default"
          as="a"
          variant="link"
          icon="pi pi-bars"
          aria-label="Toggle drawer"
          title="Toggle drawer"
          @click="toggleDrawer"
        />

        <div class="title">
          <span class="name">{{ heading.name }}</span>

          <span class="description">{{ heading.description }}</span>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

const { isMobile } = useDevice();
const toast = useToast();
const userStore = useUserStore();

const drawerVisible = ref(true);

const heading = computed(() => {
  const { path } = useRoute();

  switch (path) {
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
  try {
    await useSignOut();
  } catch {
    return toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to sign out. Please try again.',
      life: 3000,
      closable: false,
    });
  }

  userStore.setUser(null);
  userStore.setProfile(null);

  toast.add({
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
          color: var(--color-neutral-100);
        }

        .description {
          font-size: 0.875rem;
          color: var(--color-neutral-400);
        }
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

  .p-drawer-mask:has(.sidebar) {
    position: fixed !important;
    max-height: 100lvh !important;

    .p-drawer {
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
