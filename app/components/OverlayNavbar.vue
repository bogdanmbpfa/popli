<template>
  <div class="navigation-overlay" :class="{ visible: isNavigationVisible }">
    <div class="navigation-content">
      <nuxt-link to="/account/link-in-bio" class="default">
        Link in Bio
      </nuxt-link>

      <nuxt-link to="/account/analytics" class="default"> Analytics </nuxt-link>

      <nuxt-link to="/account/url-shortener" class="default">
        URL Shortener
      </nuxt-link>

      <nuxt-link to="/account/qr-code" class="default"> QR Code </nuxt-link>

      <nuxt-link to="/account/settings" class="default"> Settings </nuxt-link>
    </div>

    <div class="navigation-footer">
      <UiButton
        severity="danger"
        icon="popli:sign-out"
        icon-size="1.5rem"
        label="Sign out"
        aria-label="Sign out"
        fluid
        @click="signOut"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

defineProps<{
  isNavigationVisible: boolean;
}>();

const uiToast = useUiToast();
const userStore = useUserStore();

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

<style scoped lang="scss">
.navigation-overlay {
  position: fixed;
  top: -100lvh;
  left: 0;
  width: 100lvw;
  height: calc(100lvh - 4rem);
  background-color: var(--background-primary);
  z-index: 45;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  transition: top 0.3s ease-in-out;

  &.visible {
    top: 4rem;
  }

  .navigation-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .navigation-footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
