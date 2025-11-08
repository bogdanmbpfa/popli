<template>
	<div class="auth-layout">
		<slot />
	</div>
</template>

<script setup lang="ts"></script>

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
