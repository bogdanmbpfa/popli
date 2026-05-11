<template>
  <div class="legal-document">
    <header class="legal-document__header">
      <h1 class="legal-document__title">{{ title }}</h1>
      <p v-if="effectiveDate" class="legal-document__meta">
        Effective date: {{ effectiveDate }}
      </p>
      <p v-if="brand" class="legal-document__brand">{{ brand }}</p>
    </header>

    <div class="legal-document__body">
      <slot />
    </div>

    <p class="legal-document__notice">
      These materials are written in plain legal English based on Romanian and
      European rules applicable at the effective date. They do not waive any
      mandatory consumer protection afforded to you by law.
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  effectiveDate: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
  },
});
</script>

<style lang="scss" scoped>
.legal-document {
  width: 100%;
  max-width: 52rem;
  margin: 0 auto;
  padding: 2rem 1.25rem 5rem;

  &__header {
    margin-bottom: 2.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid
      color-mix(in oklab, var(--neutral-400) 15%, transparent);
  }

  &__title {
    margin: 0 0 0.75rem;
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 700;
    color: var(--neutral-100);
    text-align: left;
    width: 100%;
  }

  &__meta {
    margin: 0 0 0.35rem;
    font-size: 0.875rem;
    color: var(--neutral-400);
  }

  &__brand {
    margin: 0;
    font-size: 0.875rem;
    color: var(--neutral-400);
  }

  &__body {
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--neutral-300);

    :deep(h2) {
      margin: 2.25rem 0 1rem;
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--neutral-100);
    }

    :deep(h3) {
      margin: 1.5rem 0 0.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--neutral-100);
    }

    :deep(p) {
      margin: 0 0 1rem;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 1rem;
      padding-left: 1.35rem;
    }

    :deep(li) {
      margin-bottom: 0.35rem;
    }

    :deep(strong) {
      color: var(--neutral-100);
      font-weight: 600;
    }

    :deep(a) {
      color: var(--primary-400);
      text-decoration: underline;

      &:hover {
        opacity: 0.9;
      }
    }

    :deep(table) {
      width: 100%;
      margin: 0 0 1.25rem;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    :deep(th),
    :deep(td) {
      border: 1px solid color-mix(in oklab, var(--neutral-400) 22%, transparent);
      padding: 0.65rem 0.75rem;
      vertical-align: top;
      text-align: left;
    }

    :deep(th) {
      background: color-mix(in oklab, var(--neutral-950) 85%, transparent);
      color: var(--neutral-100);
      font-weight: 600;
    }
  }

  &__notice {
    margin: 3rem 0 0;
    padding-top: 1.25rem;
    border-top: 1px solid
      color-mix(in oklab, var(--neutral-400) 12%, transparent);
    font-size: 0.8125rem;
    line-height: 1.55;
    color: var(--neutral-500);
  }
}
</style>
