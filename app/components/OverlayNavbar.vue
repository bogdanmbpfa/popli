<template>
  <div
    id="account-navigation-overlay"
    class="navigation-overlay"
    :class="{ visible: isNavigationVisible }"
    role="dialog"
    aria-modal="true"
    aria-label="Account navigation"
  >
    <nav class="navigation-content" aria-label="Account pages">
      <nuxt-link class="default" to="/account/link-in-bio" @click="closeOverlay">
        Link in Bio
      </nuxt-link>

      <nuxt-link class="default" to="/account/analytics" @click="closeOverlay">
        Analytics
      </nuxt-link>

      <nuxt-link class="default" to="/account/url-shortener" @click="closeOverlay">
        URL Shortener
      </nuxt-link>

      <nuxt-link class="default" to="/account/qr-code" @click="closeOverlay">
        QR Code
      </nuxt-link>

      <nuxt-link class="default" to="/account/settings" @click="closeOverlay">
        Settings
      </nuxt-link>
    </nav>

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
const emit = defineEmits(['toggle-navigation-overlay']);

const uiToast = useUiToast();
const userStore = useUserStore();

const closeOverlay = () => emit('toggle-navigation-overlay');

const signOut = async () => {
  const { error } = await useApiJson(EApiEndpoint.AUTH_LOGOUT);

  if (error) {
    return uiToast.add({
      severity: 'error',
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

  emit('toggle-navigation-overlay');

  return navigateTo('/');
};
</script>

<style scoped lang="scss">
.navigation-overlay {
  position: fixed;
  top: -100lvh;
  left: 0;
  width: 100lvw;
  background-color: color-mix(
    in oklab,
    var(--background-primary) 90%,
    transparent
  );
  backdrop-filter: blur(0.75rem);
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
