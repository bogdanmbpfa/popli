<template>
	<div class="qr-code-page">
		<div class="container">
			<PTabs v-model:value="tab" class="default secondary">
				<PTabList>
					<PTab value="generate"> <Icon name="mdi:plus" size="1rem" /> Create new </PTab>
					<PTab value="manage"> <Icon name="mdi:qrcode" size="1rem" /> Manage QR Codes </PTab>
					<PTab value="analytics"> <Icon name="lucide:bar-chart-3" size="1rem" /> Analytics </PTab>
				</PTabList>

				<PTabPanels>
					<PTabPanel value="generate">
						<QrcodeGenerate />
					</PTabPanel>

					<PTabPanel value="manage"> </PTabPanel>
					<PTabPanel value="analytics"> </PTabPanel>
				</PTabPanels>
			</PTabs>
		</div>
	</div>
</template>

<script setup lang="ts">
	definePageMeta({
		layout: 'account',
		middleware: 'is-logged-in',
	});

	const tab = ref<'generate' | 'manage' | 'analytics'>('generate');
</script>

<style lang="scss" scoped>
	.qr-code-page {
		display: flex;
		flex-direction: row;
		height: 100%;
		width: 100%;
		flex: 1;
		position: relative;

		.container {
			display: flex;
			flex-direction: column;
			gap: 2rem;
			flex: 1;
			width: 100%;
			padding: 2rem;
		}
	}
</style>
