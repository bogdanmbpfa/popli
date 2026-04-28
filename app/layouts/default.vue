<template>
  <div class="layout">
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
const isNavigationVisible = ref(false);

const toggleNavigationOverlay = () => {
  isNavigationVisible.value = !isNavigationVisible.value;
};
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100lvh;
  position: relative;
  padding-top: 4rem;

  main {
    flex: 1;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
