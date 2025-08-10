<template>
	<div class="auth-layout">
		<slot />
	</div>
</template>

<script setup lang="ts">
	const globalStore = useGlobalStore();

	const darkMode = computed(() => globalStore.getDarkMode);

	if (import.meta.client) {
		darkMode.value
			? (document.documentElement.setAttribute('data-theme', 'dark'), globalStore.setDarkMode(true))
			: (document.documentElement.setAttribute('data-theme', 'light'),
			  globalStore.setDarkMode(false));
	}
</script>

<style lang="scss" scoped>
	.auth-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		position: relative;
		width: 100%;
	}
</style>
