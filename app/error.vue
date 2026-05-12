<template>
  <div class="error-page">
    <div class="error-card">
      <p class="code">{{ error.status }}</p>
      <h1 class="title">
        {{ error.status === 404 ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p v-if="error.message" class="message">{{ error.message }}</p>
      <NuxtLink class="home-link" to="/" @click.prevent="clearAndHome">
        Back to home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{
  error: NuxtError;
}>();

const title =
  props.error.status === 404
    ? 'Page not found — Popli.one'
    : 'Error — Popli.one';

useHead({ title });

useSeoMeta({
  robots: 'noindex, nofollow',
  description:
    props.error.status === 404
      ? 'This page does not exist on Popli.one.'
      : 'An unexpected error occurred on Popli.one.',
});

const clearAndHome = () => clearError({ redirect: '/' });
</script>

<style lang="scss" scoped>
.error-page {
  min-height: 100lvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--background-primary, #0a0a0a);
}

.error-card {
  max-width: 28rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code {
  margin: 0;
  font-size: 3rem;
  font-weight: 600;
  color: var(--neutral-400, #a3a3a3);
  font-variant-numeric: tabular-nums;
}

.title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--neutral-100, #fafafa);
}

.message {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--neutral-400, #a3a3a3);
  word-break: break-word;
}

.home-link {
  display: inline-flex;
  align-self: center;
  margin-top: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  color: var(--primary-950, #0c0a09);
  background-image: var(
    --linear-gradient-primary,
    linear-gradient(90deg, #f97316, #fb923c)
  );
}
</style>
