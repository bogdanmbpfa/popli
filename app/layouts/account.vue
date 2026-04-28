<template>
  <div class="account-layout">
    <AppNavbar @toggle-navigation-overlay="toggleNavigationOverlay" />

    <OverlayNavbar
      :is-navigation-visible="isNavigationVisible"
      @toggle-navigation-overlay="toggleNavigationOverlay"
    />

    <main>
      <slot />
    </main>

    <AppAd />

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

const { seo } = useAppConfig();
const route = useRoute();
const userStore = useUserStore();

const isNavigationVisible = ref(false);

const heading = computed(() => {
  switch (route.path) {
    case '/account/link-in-bio':
      return {
        name: 'Link in Bio',
        description: 'Create a link in bio for your account.',
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

onMounted(async () => {
  const [{ data: userData }, { data: profileData }] = await Promise.all([
    useApiJson(EApiEndpoint.ACCOUNT_ME),
    useApiJson(EApiEndpoint.ACCOUNT_PROFILE),
  ]);

  userStore.setUser(userData ? { ...userData! } : null);
  userStore.setProfile(profileData ? { ...profileData! } : null);
});

const toggleNavigationOverlay = () => {
  isNavigationVisible.value = !isNavigationVisible.value;
};
</script>

<style lang="scss" scoped>
.account-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100lvh;
  position: relative;
  padding-top: 4rem;

  main {
    flex: 1;
    width: 100%;
    max-width: 83rem;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
}
</style>
