<template>
	<div class="account-layout">
		<PDrawer
			v-model:visible="drawerVisible"
			class="default"
			:dismissable="isMobile"
			:show-close-icon="isMobile"
			position="left">
			<template #header>
				<nuxt-img :src="images.logo" alt="Popli.one" loading="lazy" />

				<div class="title">
					<span class="name">Dashboard</span>

					<span class="handle">@{{ profile.handle }}</span>
				</div>
			</template>

			<template #default>
				<div class="link-group">
					<span class="title">Manage</span>

					<nuxt-link to="/account">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-user"
							label="Profile"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/link-in-bio">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-link"
							label="Link in Bio"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/appearance">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-palette"
							label="Appearance"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/analytics">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-chart-line"
							label="Analytics"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/settings">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-cog"
							label="Settings"
							fluid />
					</nuxt-link>
				</div>

				<div class="link-group">
					<span class="title">Tools</span>

					<nuxt-link to="/account/url-shortener">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-link"
							label="URL Shortener"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/qr-code">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-qrcode"
							label="QR Code"
							fluid />
					</nuxt-link>

					<nuxt-link to="/account/digital-store">
						<PButton
							class="default"
							as="a"
							variant="link"
							icon="pi pi-shopping-bag"
							label="Digital Store"
							fluid />
					</nuxt-link>
				</div>
			</template>

			<template #footer>
				<nuxt-link to="/">
					<PButton class="default" as="a" variant="link" icon="pi pi-home" label="Home" fluid />
				</nuxt-link>

				<PButton
					class="default"
					as="a"
					variant="link"
					severity="danger"
					icon="pi pi-sign-out"
					label="Sign Out"
					fluid
					@click="signOut" />
			</template>
		</PDrawer>

		<div class="wrapper">
			<div class="top-bar">
				<PButton
					v-if="isMobile"
					class="default"
					as="a"
					variant="link"
					icon="pi pi-bars"
					@click="toggleDrawer" />

				<div class="title">
					<span class="name">{{ heading.name }}</span>

					<span class="description">{{ heading.description }}</span>
				</div>
			</div>

			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
	import { PDrawer } from '#components';

	const { isMobile } = useDevice();
	const globalStore = useGlobalStore();
	const {
		public: { images },
	} = useRuntimeConfig();
	const toast = useToast();
	const userStore = useUserStore();

	const drawerVisible = ref(true);

	const darkMode = computed(() => globalStore.getDarkMode);
	const heading = computed(() => {
		const { path } = useRoute();

		switch (path) {
			case '/account':
				return { name: 'Profile', description: 'Update your profile information.' };
			case '/account/link-in-bio':
				return { name: 'Link in Bio', description: 'Create a link in bio for your account.' };
			case '/account/appearance':
				return { name: 'Appearance', description: 'Customize your account appearance.' };
			case '/account/analytics':
				return { name: 'Analytics', description: 'View your account analytics.' };
			case '/account/settings':
				return { name: 'Settings', description: 'Update your account settings.' };
			case '/account/url-shortener':
				return { name: 'URL Shortener', description: 'Create a URL shortener for your account.' };
			case '/account/qr-code':
				return { name: 'QR Code', description: 'Create a QR code for your account.' };
			case '/account/digital-store':
				return { name: 'Digital Store', description: 'Create a digital store for your account.' };
			default:
				return { name: 'Profile', description: 'Update your profile information.' };
		}
	});
	const profile = computed(() => userStore.getProfile!);
	const user = computed(() => userStore.getUser!);

	if (import.meta.client) {
		darkMode.value
			? (document.documentElement.setAttribute('data-theme', 'dark'), globalStore.setDarkMode(true))
			: (document.documentElement.setAttribute('data-theme', 'light'),
			  globalStore.setDarkMode(false));
	}

	if (isMobile) drawerVisible.value = false;

	onMounted(() => {
		if (!user.value) {
			return navigateTo('/');
		}
	});

	const toggleDrawer = () => {
		drawerVisible.value = !drawerVisible.value;
	};

	const signOut = () => {
		useSignOut();
		userStore.setUser(null);
		userStore.setProfile(null);

		toast.add({
			severity: 'success',
			summary: 'Signed Out',
			detail: 'You have been signed out successfully.',
			life: 3000,
			closable: false,
		});

		return navigateTo('/');
	};
</script>

<style lang="scss" scoped>
	.account-layout {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-height: 100vh;
		position: relative;
		width: 100%;

		.wrapper {
			display: flex;
			flex-direction: column;
			align-items: center;
			min-height: 100vh;
			position: relative;
			width: 100%;
			padding-left: 20rem;
			padding-top: 5rem;

			.top-bar {
				position: fixed;
				top: 0;
				left: 20rem;
				right: 0;
				width: calc(100% - 20rem);
				height: 100%;
				max-height: 5rem;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: flex-start;
				gap: 1rem;
				padding: 1rem;
				border-bottom: 1px solid var(--border-1);
				background-color: var(--background-2);
				z-index: 10;

				.title {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;

					.name {
						font-size: 1.25rem;
						font-weight: 500;
						color: var(--text-100);
					}

					.description {
						font-size: 0.875rem;
						color: var(--text-300);
					}
				}
			}
		}
	}

	@media (max-width: 768px) {
		.account-layout {
			.wrapper {
				padding-left: 0;

				.top-bar {
					left: 0;
					width: 100%;
				}
			}
		}
	}
</style>
