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
		},
	});
</script>

<style lang="scss" scoped>
	@use '../../assets/mixins.scss' as *;

	.form-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		@include squircle(1.5rem);
		background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
		border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);

		.heading {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;

			.title {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				font-size: 1rem;
				font-weight: 500;
				color: var(--color-neutral-100);
			}

			.description {
				font-size: 0.875rem;
				font-weight: 400;
				color: var(--color-neutral-400);
			}
		}
	}
</style>
