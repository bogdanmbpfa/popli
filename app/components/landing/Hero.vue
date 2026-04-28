<template>
  <div class="hero">
    <BackgroundBlur position="top-left" type="primary" />
    <BackgroundBlur position="bottom-right" type="secondary" />

    <div class="container">
      <div class="heading">
        <h1 class="large">Pop Your Links.</h1>
        <h1 class="large">Amplify Your <span class="contrast">Reach.</span></h1>
      </div>

      <span class="subheading">
        The ultimate toolkit for modern creators. Shorten URLs, generate dynamic
        QR codes, and build stunning link-in-bio profiles in seconds.
      </span>

      <NuxtLink to="/sign-up" class="contrast"> Start for free </NuxtLink>

      <div class="features">
        <div v-for="feature in features" :key="feature.name" class="feature">
          <Icon :name="feature.icon" size="1.5rem" />

          <span class="name">{{ feature.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const features = ref([
  { icon: 'popli:link-chain', name: 'Link-in-Bio' },
  { icon: 'popli:lightning-bolt', name: 'Shorten URLs' },
  { icon: 'popli:outline-qr-code-scanner', name: 'QR Codes' },
  // {
  //   icon: 'popli:shopping-bag-outline',
  //   name: 'Digital Products',
  // },
]);
</script>

<style lang="scss" scoped>
.hero {
  width: 100%;
  padding: 4rem;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;

  .container {
    width: 100%;
    max-width: 80rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;

    .heading {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    span.subheading {
      text-align: center;
      font-size: 1.25rem;
      color: var(--neutral-400);
      max-width: 40rem;
    }

    .features {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;

      .feature {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        .name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--neutral-400);
          text-align: center;
        }
      }
    }
  }
}
</style>
