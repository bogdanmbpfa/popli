<template>
	<div class="wrapper">
		<NuxtLayout :key="route.path">
			<NuxtPage />
		</NuxtLayout>
	</div>

	<PConfirmDialog class="default" />
	<PDynamicDialog class="default" />
	<PToast class="default" position="top-center" />
</template>

<script setup lang="ts">
	import { configure } from 'vee-validate';

	useHead({
		title: 'Popli.one - Pop your links',
		meta: [{ name: 'description', content: 'Popli.one - Pop your links' }],
	});

	const route = useRoute();

	configure({
		validateOnInput: false,
		validateOnModelUpdate: false,
		validateOnBlur: false,
		validateOnChange: true,
	});
</script>
