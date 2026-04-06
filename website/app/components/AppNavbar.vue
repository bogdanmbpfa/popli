<template>
  <nav>
    <div class="container">
      <div class="left">
        <nuxt-link to="/">
          <nuxt-img src="/logo.png" alt="Popli.one logo" loading="lazy" />

          <span>Popli.one</span>
        </nuxt-link>
      </div>

      <div class="center">
        <nuxt-link to="#features" class="default"> Features </nuxt-link>

        <nuxt-link to="#pricing" class="default"> Pricing </nuxt-link>

        <nuxt-link to="/about" class="default"> About </nuxt-link>
      </div>

      <div class="right">
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

const userStore = useUserStore();

const user = computed(() => userStore.getUser);

onMounted(async () => {
  if (!user.value) {
    const { data: userData } = await useApiJson(EApiEndpoint.ACCOUNT_ME);

    userStore.setUser(userData ? { ...userData! } : null);
  }
});
</script>

<style lang="scss" scoped>
nav {
  width: 100%;
  height: 4rem;
  position: sticky;
  z-index: 10;
  top: 0;
  left: 0;
  padding: 0 0.5rem;
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

      .theme-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
  }
}

@media (max-width: 768px) {
  nav {
    .container {
      .center {
        display: none;
      }
    }
  }
}
</style>
