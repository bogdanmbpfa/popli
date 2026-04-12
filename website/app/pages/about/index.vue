<template>
  <div class="about">
    <h1>About</h1>
  </div>
</template>

<script setup lang="ts">
const { seo } = useAppConfig();

usePageSeo({
  title: seo.aboutTitle,
  description: seo.aboutDescription,
  path: '/about',
  keywords:
    'Popli.one, about, link in bio, URL shortener, QR codes, creator platform',
  ogImage: seo.defaultOgImagePath,
});
</script>
