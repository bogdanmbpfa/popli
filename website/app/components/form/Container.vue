<template>
	<div class="form-container">
		<div class="heading">
			<div class="title">
				<Icon v-if="titleIcon" :name="titleIcon" size="1.5rem" />

				<span>{{ title }}</span>
			</div>

			<span class="description">{{ description }}</span>
		</div>

		<slot />
	</div>
</template>

<script setup lang="ts">
	defineProps({
		title: {
			type: String,
			required: true,
		},
		titleIcon: {
			type: String,
			default: '',
			required: false,
		},
		description: {
			type: String,
			default: '',
			required: false,
		},
	});
</script>

<style lang="scss" scoped>
	.form-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: 2rem;
		border-radius: 0.5rem;
		background-color: color-mix(in oklab, var(--neutral-950) 60%, transparent);
		border: none;
		position: relative;
		overflow: hidden;

		.heading {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			.title {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				font-size: 1.25rem;
				font-weight: 500;
				color: var(--neutral-100);
			}

			.description {
				font-size: 0.875rem;
				font-weight: 400;
				color: var(--neutral-400);
			}
		}
	}
</style>
