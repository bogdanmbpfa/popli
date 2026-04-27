<template>
  <nav>
    <div class="container">
      <div class="left">
        <nuxt-link to="/">
          <nuxt-img src="/logo.png" alt="Popli.one logo" loading="lazy" />

          <span>Popli.one</span>
        </nuxt-link>
      </div>

      <div v-if="isAccountPage" class="center account-navigation">
        <nuxt-link to="/account/link-in-bio" class="default">
          Link in Bio
        </nuxt-link>

        <nuxt-link to="/account/analytics" class="default">
          Analytics
        </nuxt-link>

        <nuxt-link to="/account/url-shortener" class="default">
          URL Shortener
        </nuxt-link>

        <nuxt-link to="/account/qr-code" class="default"> QR Code </nuxt-link>

        <nuxt-link to="/account/settings" class="default"> Settings </nuxt-link>
      </div>

      <div v-else class="center">
        <nuxt-link to="/#features" class="default no-highlight"> Features </nuxt-link>

        <nuxt-link to="/#pricing" class="default no-highlight"> Pricing </nuxt-link>

        <nuxt-link to="/about" class="default"> About </nuxt-link>
      </div>

      <div v-if="isAccountPage" class="right">
        <UiButton
          class="naked navigation-toggle"
          severity="secondary"
          icon="popli:bars"
          icon-size="1.5rem"
          aria-label="Toggle navigation"
          @click="toggleNavigationOverlay"
        />

        <UiButton
          class="naked sign-out-button"
          severity="danger"
          icon="popli:sign-out"
          icon-size="1.5rem"
          aria-label="Sign out"
          @click="signOut"
        />
      </div>

      <div v-else class="right">
        <nuxt-link v-if="!user" to="/sign-in" class="default">
          Sign In
        </nuxt-link>

        <nuxt-link v-if="!user" to="/sign-up" class="contrast">
          Get Started
        </nuxt-link>

        <nuxt-link v-if="user" to="/account" class="contrast">
          Account
        </nuxt-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

const emit = defineEmits(['toggle-navigation-overlay']);

const route = useRoute();
const uiToast = useUiToast();
const userStore = useUserStore();

const user = computed(() => userStore.getUser);
const isAccountPage = computed(
  () => route.path === '/account' || route.path.startsWith('/account/'),
);

onMounted(async () => {
  const [{ data: userData }, { data: profileData }] = await Promise.all([
    useApiJson(EApiEndpoint.ACCOUNT_ME),
    useApiJson(EApiEndpoint.ACCOUNT_PROFILE),
  ]);

  userStore.setUser(userData ? { ...userData! } : null);
  userStore.setProfile(profileData ? { ...profileData! } : null);
});

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

const toggleNavigationOverlay = () => emit('toggle-navigation-overlay');
</script>

<style lang="scss" scoped>
nav {
  width: 100%;
  height: 4rem;
  position: fixed;
  z-index: 50;
  top: 0;
  left: 0;
  padding: 0 1.5rem;
  backdrop-filter: blur(0.75rem);
  background-color: var(--background-primary);
  color: var(--tertiary-100);
  display: flex;
  align-items: center;
  justify-content: center;

  .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 80rem;
    height: 100%;
    position: relative;

    .left {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      a {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;

        img {
          width: 2rem;
          height: 2rem;
        }

        span {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--tertiary-100);
        }
      }
    }

    .center {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 1rem;

      a {
        padding: 0.5rem 1rem;
        z-index: 1;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 2rem;

      .navigation-toggle {
        display: none;
      }

      .sign-out-button {
        display: flex;
      }
    }
  }
}

@media (max-width: 900px) {
  nav {
    .container {
      .center {
        display: none;
      }

      .right {
        .navigation-toggle {
          display: flex;
        }

        .sign-out-button {
          display: none;
        }
      }
    }
  }
}
</style>
