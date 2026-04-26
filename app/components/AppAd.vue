<template>
  <div :class="['app-ads', { open: isOpen }]">
    <div class="content">
      <div :class="['toggle-button', { open: isOpen }]" @click="toggleAd">
        <span v-if="!isOpen">Show Ad</span>
        <span v-else>Hide Ad</span>
      </div>

      <div class="disclaimer">Thank you very much for your support!</div>

      <div class="ad-container">
        <Adsbygoogle
          v-if="isOpen"
          :key="adKey"
          ad-format="fixed"
          ad-slot="1698276428"
          :ad-full-width-responsive="false"
          :ad-style="{ display: 'block', width: '30rem', height: '10rem' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false);
const adKey = ref(0);
const lastOpened = ref(0);

const toggleAd = () => {
  isOpen.value = !isOpen.value;

  const now = Date.now();

  if (now - lastOpened.value > 30000) {
    adKey.value += 1;
    lastOpened.value = now;
  }
};
</script>

<style lang="scss" scoped>
.app-ads {
  position: fixed;
  bottom: -15rem;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 15rem;
  max-height: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 40;
  transition: bottom 0.3s ease-in-out;

  &.open {
    bottom: 0;
  }

  .content {
    height: 100%;
    width: 100%;
    max-width: 40rem;
    background: var(--linear-gradient-primary);
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    .toggle-button {
      position: absolute;
      top: -1.25rem;
      left: 0;
      right: 0;
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 6rem;
      height: 1.25rem;
      background: var(--linear-gradient-primary);
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.3s ease-in-out;
      padding: 0.25rem 0.5rem;

      span {
        font-size: 0.75rem;
        line-height: 1;
        font-weight: 400;
        color: white;
      }
    }

    .disclaimer {
      font-size: 0.75rem;
      line-height: 1;
      font-weight: 400;
      color: white;
    }

    .ad-container {
      background: white;
      width: 30rem;
      height: 10rem;
    }
  }
}
</style>
