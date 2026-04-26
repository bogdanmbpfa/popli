<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'account',
  middleware: 'is-logged-in',
});

onMounted(async () => {
  await navigateTo('/account/settings');
});
</script>
