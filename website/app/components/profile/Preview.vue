<template>
	<div class="profile-preview">
		<div class="heading">
			<span class="title"> Live Preview </span>

			<span class="description"> See how your profile looks in real time. </span>
		</div>

		<div class="preview">
			<div class="cover-image">
				<nuxt-img
					v-if="profile.coverImage"
					:src="profile.coverImage"
					alt="Cover Image"
					loading="lazy" />
			</div>

			<div class="body">
				<div class="info">
					<span class="name">{{ profile.name }}</span>

					<span class="handle">@{{ profile.handle }}</span>

					<span class="bio">{{ profile.bio }}</span>
				</div>

				<div class="main-social-links">
					<nuxt-link to="https://instagram.com/{{ profile.handle }}" target="_blank" external>
						<Icon name="skill-icons:instagram" size="1rem" />
					</nuxt-link>

					<nuxt-link to="https://x.com/{{ profile.handle }}" target="_blank" external>
						<Icon name="devicon:twitter" size="1rem" />
					</nuxt-link>

					<nuxt-link to="https://linkedin.com/in/{{ profile.handle }}" target="_blank" external>
						<Icon name="skill-icons:linkedin" size="1rem" />
					</nuxt-link>

					<nuxt-link to="https://github.com/{{ profile.handle }}" target="_blank" external>
						<Icon name="mdi:github" size="1rem" />
					</nuxt-link>
				</div>
			</div>

			<div class="bottom-bar" />
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { IAccountUser } from '~/../interfaces';

	defineProps<{
		profile: IAccountUser;
	}>();

	const { isMobile } = useDevice();

	const isPreviewOpen = ref(!isMobile);

	const togglePreview = () => {
		isPreviewOpen.value = !isPreviewOpen.value;
	};
</script>

<style lang="scss" scoped>
	.profile-preview {
		position: fixed;
		top: 5rem;
		right: 0;
		bottom: 0;
		z-index: 20;
		width: 100%;
		max-width: 30rem;
		height: calc(100% - 5rem);
		display: flex;
		flex-direction: column;
		flex: 1;
		gap: 4rem;
		border-left: 1px solid var(--border-1);
		border-top: 1px solid var(--border-1);
		padding: 2rem;
		background-color: var(--background-1);

		.heading {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.title {
				font-size: 1rem;
				font-weight: 500;
				color: var(--text-100);
			}

			.description {
				font-size: 0.75rem;
				color: var(--text-300);
			}
		}

		.preview {
			position: relative;
			width: 100%;
			max-width: 20rem;
			height: 100%;
			max-height: 40rem;
			border: 2px solid var(--border-1);
			border-radius: 1.5rem;
			box-shadow: var(--box-shadow-1);
			overflow-y: auto;
			overflow-x: hidden;
			scrollbar-width: none;
			-ms-overflow-style: none;
			z-index: 1;

			&::-webkit-scrollbar {
				display: none;
			}

			.cover-image {
				position: sticky;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				width: 100%;
				height: 100%;
				max-height: 12rem;
				z-index: 1;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
					object-position: center;
				}
			}

			.body {
				width: 100%;
				border-top-left-radius: 1.5rem;
				border-top-right-radius: 1.5rem;
				background-color: var(--background-1);
				z-index: 3;
				position: relative;
				margin-top: -1.5rem;

				.info {
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					padding: 0.5rem;
					position: relative;

					.name {
						font-size: 1rem;
						font-weight: 500;
						color: var(--text-100);
						text-align: center;
					}

					.handle {
						font-size: 0.75rem;
						color: var(--text-300);
						text-align: center;
					}

					.bio {
						font-size: 0.75rem;
						color: var(--text-300);
						text-align: center;
					}
				}

				.main-social-links {
					display: flex;
					flex-direction: row;
					gap: 0.5rem;
					align-items: center;
					justify-content: center;

					a {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 1.75rem;
						height: 1.75rem;
						background-color: var(--background-1);
						border-radius: 50%;
					}
				}
			}

			.bottom-bar {
				position: absolute;
				bottom: 0.5rem;
				left: 0;
				right: 0;
				height: 0.25rem;
				width: 6rem;
				margin: 0 auto;
				background-color: var(--border-1);
				border-radius: 0.25rem;
			}
		}
	}
</style>
