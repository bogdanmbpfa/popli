<template>
  <div class="layout">
    <AppNavbar />

    <main>
      <slot />
    </main>

    <AppAd />

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100lvh;
  position: relative;

  main {
    flex: 1;
    width: 100%;
  }
}
</style>
