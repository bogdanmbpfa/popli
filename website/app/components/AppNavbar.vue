<template>
  <nav>
    <div class="container">
      <div class="left">
        <nuxt-link to="/">
          <nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

          <span>Popli.one</span>
        </nuxt-link>
      </div>

      <div class="center">
        <nuxt-link to="#features"> Features </nuxt-link>

        <nuxt-link to="#pricing"> Pricing </nuxt-link>

        <nuxt-link to="/about"> About </nuxt-link>
      </div>

      <div class="right">
        <nuxt-link v-if="!user" to="/auth/sign-in">
          <PButton class="default" as="a" variant="link" label="Sign In" />
        </nuxt-link>

        <nuxt-link v-if="!user" to="/auth/sign-up">
          <PButton
            class="default"
            severity="contrast"
            as="a"
            label="Get Started"
          />
        </nuxt-link>

        <nuxt-link v-if="user" to="/account">
          <PButton
            class="default"
            severity="contrast"
            icon="pi pi-user"
            label="Account"
          />
        </nuxt-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { EApiEndpoint } from '~~/enums';

const {
  public: { images },
} = useRuntimeConfig();
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
  backdrop-filter: blur(8px);
  background-color: color-mix(
    in oklab,
    var(--background-primary) 60%,
    transparent
  );
  border-bottom: 1px solid var(--border-1);
  outline-color: color-mix(
    in oklab,
    var(--background-primary) 50%,
    transparent
  );
  color: var(--text-100);
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
          color: var(--text-100);
        }
      }
    }

    .center {
      display: flex;
      align-items: center;
      gap: 1rem;

      a {
        text-decoration: none;
        color: var(--text-300);
        padding: 0.5rem 1rem;
        z-index: 1;
      }
    }

    .right {
      display: flex;
      align-items: center;
      gap: 0.5rem;

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
