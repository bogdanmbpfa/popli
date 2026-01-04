<template>
	<div v-if="qrCode" class="qr-code-advanced-configuration">
		<PTabs v-model:value="tab" class="default">
			<PTabList>
				<PTab value="colors">Colors</PTab>
				<PTab value="shapes">Shapes</PTab>
				<PTab value="logo">Logo</PTab>
			</PTabList>

			<PTabPanels>
				<PTabPanel value="colors">
					<div class="section">
						<div class="section-title">
							<Icon name="mdi:palette-outline" size="1rem" />

							<span>Color presets</span>
						</div>

						<div class="section-items">
							<PButton
								v-for="preset in colorPresets"
								:key="`color-reset-${preset.value}`"
								class="default"
								:class="{ active: colorPreset === preset.value, [preset.value]: true }"
								severity="secondary"
								icon="pi pi-circle-fill"
								icon-pos="left"
								:label="preset.label"
								@click="setColorPreset(preset.value)" />
						</div>
					</div>

					<hr />

					<div class="section">
						<div class="section-title">
							<span>Background Color</span>
						</div>

						<div class="radio-group">
							<div class="radio-button-item">
								<PRadioButton
									input-id="background-color-type-solid"
									v-model="backgroundColorType"
									class="default"
									name="backgroundColorType"
									value="solid"
									@change="setBackgroundColorType" />

								<label for="background-color-type-solid">Solid</label>
							</div>

							<div class="radio-button-item">
								<PRadioButton
									input-id="background-color-type-gradient"
									v-model="backgroundColorType"
									name="backgroundColorType"
									class="default"
									value="gradient"
									@change="setBackgroundColorType" />

								<label for="background-color-type-gradient">Gradient</label>
							</div>
						</div>

						<div v-if="backgroundColorType === 'solid'" class="color-picker-container">
							<PColorPicker
								id="background-color-solid"
								v-model="backgroundColor"
								class="default"
								overlay-class="default"
								fluid
								format="hex"
								@change="setBackgroundColor" />

							<PInputText
								:value="`${backgroundColor ? `#${backgroundColor}` : ''}`"
								class="default"
								readonly />
						</div>

						<div v-if="backgroundColorType === 'gradient'" class="gradient-controls">
							<div class="angle">
								<span class="title">Angle: </span>

								<PInputNumber
									v-model="backgroundGradient.rotation"
									class="default"
									input-class="default"
									:min="0"
									:max="360"
									show-buttons
									@value-change="setBackgroundGradientAngle" />
							</div>

							<div class="gradient-stops">
								<div class="gradient-stop">
									<div class="color-picker-container">
										<PColorPicker
											id="background-color-gradient-0"
											v-model="backgroundGradient.stops[0]!.color"
											class="default"
											overlay-class="default"
											fluid
											format="hex"
											@change="setBackgroundGradientStopColor($event, 0)" />
									</div>

									<PInputText
										class="default"
										input-class="default"
										readonly
										:value="`#${backgroundGradient.stops[0]!.color}`" />
								</div>

								<div class="gradient-stop">
									<div class="color-picker-container">
										<PColorPicker
											id="background-color-gradient-1"
											v-model="backgroundGradient.stops[1]!.color"
											class="default"
											overlay-class="default"
											fluid
											format="hex"
											@change="setBackgroundGradientStopColor($event, 1)" />
									</div>

									<PInputText
										class="default"
										input-class="default"
										readonly
										:value="`#${backgroundGradient.stops[1]!.color}`" />
								</div>
							</div>
						</div>
					</div>

					<hr />

					<div class="section">
						<div class="section-title">
							<span>Foreground Color</span>
						</div>

						<div class="radio-group">
							<div class="radio-button-item">
								<PRadioButton
									input-id="foreground-color-type-solid"
									v-model="foregroundColorType"
									class="default"
									name="foregroundColorType"
									value="solid"
									@change="setForegroundColorType" />

								<label for="foreground-color-type-solid">Solid</label>
							</div>

							<div class="radio-button-item">
								<PRadioButton
									input-id="foreground-color-type-gradient"
									v-model="foregroundColorType"
									name="foregroundColorType"
									class="default"
									value="gradient"
									@change="setForegroundColorType" />

								<label for="foreground-color-type-gradient">Gradient</label>
							</div>
						</div>

						<div v-if="foregroundColorType === 'solid'" class="color-picker-container">
							<PColorPicker
								id="foreground-color-solid"
								v-model="foregroundColor"
								class="default"
								overlay-class="default"
								fluid
								format="hex"
								@change="setForegroundColor" />

							<PInputText
								:value="`${foregroundColor ? `#${foregroundColor}` : ''}`"
								class="default"
								readonly />
						</div>

						<div v-if="foregroundColorType === 'gradient'" class="gradient-controls">
							<div class="angle">
								<span class="title">Angle: </span>

								<PInputNumber
									v-model="foregroundGradient.rotation"
									class="default"
									input-class="default"
									:min="0"
									:max="360"
									show-buttons
									@value-change="setForegroundGradientAngle" />
							</div>

							<div class="gradient-stops">
								<div class="gradient-stop">
									<div class="color-picker-container">
										<PColorPicker
											id="foreground-color-gradient-0"
											v-model="foregroundGradient.stops[0]!.color"
											class="default"
											overlay-class="default"
											fluid
											format="hex"
											@change="setForegroundGradientStopColor($event, 0)" />
									</div>

									<PInputText
										class="default"
										input-class="default"
										readonly
										:value="`#${foregroundGradient.stops[0]!.color}`" />
								</div>

								<div class="gradient-stop">
									<div class="color-picker-container">
										<PColorPicker
											id="foreground-color-gradient-1"
											v-model="foregroundGradient.stops[1]!.color"
											class="default"
											overlay-class="default"
											fluid
											format="hex"
											@change="setForegroundGradientStopColor($event, 1)" />
									</div>

									<PInputText
										class="default"
										input-class="default"
										readonly
										:value="`#${foregroundGradient.stops[1]!.color}`" />
								</div>
							</div>
						</div>
					</div>

					<hr />

					<div class="section">
						<div class="section-title">
							<span>Shape</span>
						</div>

						<div class="section-items">
							<PButton
								type="button"
								class="default"
								severity="secondary"
								:class="{ active: qrCodeOptions.shape === 'circle' }"
								icon="pi pi-circle-fill"
								icon-pos="left"
								label="Circle"
								@click="setShape('circle')" />

							<PButton
								type="button"
								class="default"
								severity="secondary"
								:class="{ active: qrCodeOptions.shape === 'square' }"
								label="Square"
								@click="setShape('square')">
								<template #icon>
									<Icon name="ic:sharp-square" />
								</template>
							</PButton>
						</div>
					</div>

					<hr />

					<div
						v-if="
							qrCodeOptions.backgroundOptions && qrCodeOptions.backgroundOptions.round !== undefined
						"
						class="section">
						<div class="section-title">
							<span>Background Border Radius: {{ qrCodeOptions.backgroundOptions.round }}</span>
						</div>

						<PSlider
							id="background"
							v-model="qrCodeOptions.backgroundOptions.round"
							class="default"
							fluid
							:min="0"
							:max="1"
							:step="0.01" />
					</div>

					<hr />

					<div v-if="qrCodeOptions.width !== undefined" class="section">
						<div class="section-title">
							<span>QR Code Size: {{ qrCodeOptions.width }}px</span>
						</div>

						<PSlider
							id="size"
							v-model="qrCodeOptions.width"
							class="default"
							fluid
							:min="128"
							:max="512"
							@value-change="setSize" />
					</div>
				</PTabPanel>

				<PTabPanel value="shapes">
					<div class="section-container">
						<span class="title"> Dots </span>

						<div class="subsection">
							<div class="subsection-title">
								<span>Shape</span>
							</div>

							<div class="subsection-items">
								<PButton
									v-for="shape in dotsShapes"
									:key="shape.value"
									type="button"
									class="default"
									:class="{ active: qrCodeOptions.dotsOptions!.type === shape.value }"
									severity="secondary"
									:label="shape.label"
									@click="setDotsShape(shape.value)" />
							</div>
						</div>

						<div class="subsection">
							<div class="subsection-title">
								<span>Color</span>
							</div>

							<div class="radio-group">
								<div class="radio-button-item">
									<PRadioButton
										input-id="dots-color-type-solid"
										v-model="dotsColorType"
										name="dotsColorType"
										class="default"
										value="solid"
										@value-change="setDotsColorType" />

									<label for="dots-color-type-solid">Solid</label>
								</div>

								<div class="radio-button-item">
									<PRadioButton
										input-id="dots-color-type-gradient"
										v-model="dotsColorType"
										name="dotsColorType"
										class="default"
										value="gradient"
										@value-change="setDotsColorType" />

									<label for="dots-color-type-gradient">Gradient</label>
								</div>
							</div>

							<div v-if="dotsColorType === 'solid'" class="color-picker-container">
								<PColorPicker
									id="dots-color"
									v-model="qrCodeOptions.dotsOptions!.color"
									class="default"
									overlay-class="default"
									fluid
									format="hex"
									@change="setDotsColor" />
							</div>

							<div v-if="dotsColorType === 'gradient'" class="gradient-controls">
								<div class="angle">
									<span class="title">Angle: </span>

									<PInputNumber
										v-model="dotsGradient.rotation"
										class="default"
										input-class="default"
										:min="0"
										:max="360"
										show-buttons
										@value-change="setDotsGradientAngle" />
								</div>

								<div class="gradient-stops">
									<div class="gradient-stop">
										<div class="color-picker-container">
											<PColorPicker
												id="dots-color-gradient-0"
												v-model="dotsGradient.stops[0]!.color"
												class="default"
												overlay-class="default"
												fluid
												format="hex"
												@change="setDotsGradientStopColor($event, 0)" />
										</div>

										<PInputText
											class="default"
											input-class="default"
											readonly
											:value="`#${dotsGradient.stops[0]!.color}`" />
									</div>

									<div class="gradient-stop">
										<div class="color-picker-container">
											<PColorPicker
												id="dots-color-gradient-1"
												v-model="dotsGradient.stops[1]!.color"
												class="default"
												overlay-class="default"
												fluid
												format="hex"
												@change="setDotsGradientStopColor($event, 1)" />
										</div>

										<PInputText
											class="default"
											input-class="default"
											readonly
											:value="`#${dotsGradient.stops[1]!.color}`" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</PTabPanel>

				<PTabPanel value="logo">
					<div class="logo">
						<div class="logo-picker"></div>
					</div>
				</PTabPanel>
			</PTabPanels>
		</PTabs>

		<div class="preview">
			<span class="title">Preview</span>

			<div class="container">
				<div
					id="qr-code-advanced-canvas"
					:style="`width: ${qrCodeOptions.width}px; height: ${qrCodeOptions.height}px;`" />

				<span class="caption-title"> Sample QR Code Preview </span>

				<span class="caption-description">
					This QR Code is generated with sample content for preview purposes. <br />
					The actual content will be set when you generate the QR Code.
				</span>
			</div>
		</div>

		<PButton class="default" severity="contrast" label="Save QR Code" fluid @click="saveQRCode" />
	</div>
</template>

<script setup lang="ts">
	import debounce from 'lodash/debounce';
	import type { ColorPickerChangeEvent } from 'primevue/colorpicker';
	import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions';
	import QRCodeStyling, {
		type CornerDotType,
		type CornerSquareType,
		type DotType,
		type Options,
	} from 'qr-code-styling';

	const dialogRef = inject<{ value: DynamicDialogInstance }>('dialogRef');

	const backgroundColor = ref();
	const backgroundColorType = ref<'solid' | 'gradient'>('solid');
	const backgroundGradient = ref<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});
	const colorPreset = ref<
		'classic' | 'blue' | 'purple' | 'pink' | 'darkMode' | 'ocean' | 'forest' | 'sunset' | null
	>('classic');
	const colorPresets = ref([
		{
			label: 'Classic',
			value: 'classic',
		},
		{
			label: 'Blue',
			value: 'blue',
		},
		{
			label: 'Purple',
			value: 'purple',
		},
		{
			label: 'Pink',
			value: 'pink',
		},
		{
			label: 'Dark Mode',
			value: 'darkMode',
		},
		{
			label: 'Ocean',
			value: 'ocean',
		},
		{
			label: 'Forest',
			value: 'forest',
		},
		{
			label: 'Sunset',
			value: 'sunset',
		},
	]);
	const cornerDotsShapes = ref<{ label: string; value: CornerDotType }[]>([
		{ label: 'Dot', value: 'dot' },
		{ label: 'Dots', value: 'dots' },
		{ label: 'Square', value: 'square' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Classy', value: 'classy' },
		{ label: 'Classy Rounded', value: 'classy-rounded' },
		{ label: 'Extra Rounded', value: 'extra-rounded' },
	]);
	const cornerSquaresShapes = ref<{ label: string; value: CornerSquareType }[]>([
		{ label: 'Dot', value: 'dot' },
		{ label: 'Dots', value: 'dots' },
		{ label: 'Square', value: 'square' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Classy', value: 'classy' },
		{ label: 'Classy Rounded', value: 'classy-rounded' },
		{ label: 'Extra Rounded', value: 'extra-rounded' },
	]);
	const dotsColorType = ref<'solid' | 'gradient'>('solid');
	const dotsGradient = ref<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});
	const dotsShapes = ref<{ label: string; value: DotType }[]>([
		{ label: 'Dots', value: 'dots' },
		{ label: 'Square', value: 'square' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Classy', value: 'classy' },
		{ label: 'Classy Rounded', value: 'classy-rounded' },
		{ label: 'Extra Rounded', value: 'extra-rounded' },
	]);
	const foregroundColorType = ref<'solid' | 'gradient'>('solid');
	const foregroundColor = ref();
	const foregroundGradient = ref<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});
	const qrCode = ref<QRCodeStyling | null>(null);
	const qrCodeOptions = ref<Options>({});
	const tab = ref<'colors' | 'shapes' | 'logo'>('shapes');

	onMounted(() => {
		qrCodeOptions.value = dialogRef?.value.data;

		qrCode.value = new QRCodeStyling(qrCodeOptions.value);
		setTimeout(() => {
			qrCode.value?.append(document.getElementById('qr-code-advanced-canvas') as HTMLElement);
		}, 300);
	});

	watch(
		qrCodeOptions,
		async (options) => {
			const canvas = document.getElementById('qr-code-advanced-canvas') as HTMLElement;

			if (!options.data) {
				qrCode.value = null;
			} else {
				if (!qrCode.value) {
					qrCode.value = new QRCodeStyling(options);
					qrCode.value?.append(canvas);
				}

				qrCode.value?.update(options);
			}
		},
		{ deep: true }
	);

	const setColorPreset = (preset: string) => {
		switch (preset) {
			case 'classic':
				qrCodeOptions.value.dotsOptions!.color = '#000000';
				qrCodeOptions.value.cornersSquareOptions!.color = '#000000';
				qrCodeOptions.value.cornersDotOptions!.color = '#000000';
				qrCodeOptions.value.backgroundOptions!.color = 'white';
				colorPreset.value = 'classic';
				break;

			case 'blue':
				qrCodeOptions.value.dotsOptions!.color = '#155dfc';
				qrCodeOptions.value.cornersSquareOptions!.color = '#155dfc';
				qrCodeOptions.value.cornersDotOptions!.color = '#155dfc';
				qrCodeOptions.value.backgroundOptions!.color = 'white';
				colorPreset.value = 'blue';
				break;

			case 'purple':
				qrCodeOptions.value.dotsOptions!.color = '#9810fa';
				qrCodeOptions.value.cornersSquareOptions!.color = '#9810fa';
				qrCodeOptions.value.cornersDotOptions!.color = '#9810fa';
				qrCodeOptions.value.backgroundOptions!.color = 'white';
				colorPreset.value = 'purple';
				break;

			case 'pink':
				qrCodeOptions.value.dotsOptions!.color = '#e60076';
				qrCodeOptions.value.cornersSquareOptions!.color = '#e60076';
				qrCodeOptions.value.cornersDotOptions!.color = '#e60076';
				qrCodeOptions.value.backgroundOptions!.color = 'white';
				colorPreset.value = 'pink';
				break;

			case 'darkMode':
				qrCodeOptions.value.dotsOptions!.color = '#ffffff';
				qrCodeOptions.value.cornersSquareOptions!.color = '#ffffff';
				qrCodeOptions.value.cornersDotOptions!.color = '#ffffff';
				qrCodeOptions.value.backgroundOptions!.color = '#0a0a0a';
				colorPreset.value = 'darkMode';
				break;

			case 'ocean':
				qrCodeOptions.value.dotsOptions!.color = '#2b7fff';
				qrCodeOptions.value.cornersSquareOptions!.color = '#2b7fff';
				qrCodeOptions.value.cornersDotOptions!.color = '#2b7fff';
				qrCodeOptions.value.backgroundOptions!.color = '#ecfeff';
				colorPreset.value = 'ocean';
				break;

			case 'forest':
				qrCodeOptions.value.dotsOptions!.color = '#00a63e';
				qrCodeOptions.value.cornersSquareOptions!.color = '#00a63e';
				qrCodeOptions.value.cornersDotOptions!.color = '#00a63e';
				qrCodeOptions.value.backgroundOptions!.color = '#ecfdf5';
				colorPreset.value = 'forest';
				break;

			case 'sunset':
				qrCodeOptions.value.dotsOptions!.color = '#ca3500';
				qrCodeOptions.value.cornersSquareOptions!.color = '#ca3500';
				qrCodeOptions.value.cornersDotOptions!.color = '#ca3500';
				qrCodeOptions.value.backgroundOptions!.color = '#fef2f2';
				colorPreset.value = 'sunset';
				break;

			default:
				colorPreset.value = null;
				break;
		}
	};

	const setBackgroundColorType = () => {
		if (backgroundColorType.value === 'solid') {
			qrCodeOptions.value.backgroundOptions!.color = `#${backgroundColor.value}`;
			qrCodeOptions.value.backgroundOptions!.gradient = undefined;
		} else {
			qrCodeOptions.value.backgroundOptions!.gradient = {
				type: 'linear',
				rotation: backgroundGradient.value.rotation / 180 * Math.PI,
				colorStops: backgroundGradient.value.stops.map((stop) => ({
					offset: stop.offset,
					color: `#${stop.color}`,
				})),
			};
			qrCodeOptions.value.backgroundOptions!.color = undefined;
		}
	};

	const setBackgroundColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.value.backgroundOptions!.color = `#${event.value}`;
		qrCodeOptions.value.backgroundOptions!.gradient = undefined;
	};

	const setBackgroundGradientAngle = debounce((value: number | number[]) => {
		qrCodeOptions.value.backgroundOptions!.gradient!.rotation = (value as number) / 180 * Math.PI;
	}, 100);

	const setBackgroundGradientStopColor = debounce(
		(event: ColorPickerChangeEvent, index: number) => {
			backgroundGradient.value.stops[index]!.color = event.value;
			qrCodeOptions.value.backgroundOptions!.gradient!.colorStops[index]!.color = `#${event.value}`;
		},
		100
	);

	const setForegroundColorType = () => {
		if (foregroundColorType.value === 'solid') {
			qrCodeOptions.value.dotsOptions!.color = `#${foregroundColor.value}`;
			qrCodeOptions.value.dotsOptions!.gradient = undefined;
		} else {
			qrCodeOptions.value.dotsOptions!.gradient = {
				type: 'linear',
				rotation: foregroundGradient.value.rotation / 180 * Math.PI,
				colorStops: foregroundGradient.value.stops.map((stop) => ({
					offset: stop.offset,
					color: `#${stop.color}`,
				})),
			};
			qrCodeOptions.value.dotsOptions!.color = undefined;
		}
	};

	const setForegroundColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.value.dotsOptions!.color = `#${event.value}`;
		qrCodeOptions.value.dotsOptions!.gradient = undefined;
	};

	const setForegroundGradientAngle = debounce((value: number | number[]) => {
		qrCodeOptions.value.dotsOptions!.gradient!.rotation = (value as number) / 180 * Math.PI;
	}, 100);

	const setForegroundGradientStopColor = debounce(
		(event: ColorPickerChangeEvent, index: number) => {
			foregroundGradient.value.stops[index]!.color = event.value;
			qrCodeOptions.value.dotsOptions!.gradient!.colorStops[index]!.color = `#${event.value}`;
		},
		100
	);

	const setShape = (shape: 'circle' | 'square') => {
		qrCodeOptions.value.shape = shape;
	};

	const setSize = (value: number | number[]) => {
		qrCodeOptions.value.width = value as number;
		qrCodeOptions.value.height = value as number;
	};

	const setDotsShape = (shape: DotType) => {
		qrCodeOptions.value.dotsOptions!.type = shape;
	};

	const setCornerDotsShape = (shape: CornerDotType) => {
		qrCodeOptions.value.cornersDotOptions!.type = shape;
	};

	const setCornerSquaresShape = (shape: CornerSquareType) => {
		qrCodeOptions.value.cornersSquareOptions!.type = shape;
	};

	const setDotsColorType = (value: 'solid' | 'gradient') => {
		if (value === 'solid') {
			qrCodeOptions.value.dotsOptions!.gradient = undefined;
			qrCodeOptions.value.dotsOptions!.color = '#000000';
		} else {
			qrCodeOptions.value.dotsOptions!.color = undefined;
			qrCodeOptions.value.dotsOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}
	};

	const setDotsColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.value.dotsOptions!.color = `#${event.value}`;
	};

	const setDotsGradientAngle = debounce((value: number | number[]) => {
		qrCodeOptions.value.dotsOptions!.gradient!.rotation = (value as number) / 180 * Math.PI;
	}, 100);

	const setDotsGradientStopColor = debounce((event: ColorPickerChangeEvent, index: number) => {
		qrCodeOptions.value.dotsOptions!.gradient!.colorStops[index]!.color = `#${event.value}`;
	}, 100);

	const saveQRCode = () => {
		dialogRef?.value.close(qrCodeOptions.value);
	};
</script>

<style lang="scss" scoped>
	@use '../../assets/mixins.scss' as *;

	.qr-code-advanced-configuration {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;

		hr {
			border: none;
			border-top: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
			margin: 0;
		}

		:deep(.p-tabs) {
			.p-tabpanels {
				.p-tabpanel {
					display: flex;
					flex-direction: column;
					gap: 1.5rem;

					.section {
						display: flex;
						flex-direction: column;
						gap: 0.5rem;

						.section-title {
							display: flex;
							align-items: center;
							gap: 0.5rem;

							.iconify {
								filter: brightness(0) saturate(100%) invert(100%) sepia(2%) saturate(37%)
									hue-rotate(355deg) brightness(113%) contrast(92%);
							}

							span {
								font-size: 0.75rem;
								font-weight: 500;
								color: var(--color-neutral-100);
							}
						}

						.section-items {
							display: flex;
							flex-direction: row;
							flex-wrap: wrap;
							gap: 0.5rem;

							.p-button {
								&.classic {
									.p-button-icon {
										color: var(--color-black);
									}
								}

								&.blue {
									.p-button-icon {
										color: var(--color-blue-600);
									}
								}

								&.purple {
									.p-button-icon {
										color: var(--color-purple-600);
									}
								}

								&.pink {
									.p-button-icon {
										color: var(--color-pink-600);
									}
								}

								&.darkMode {
									.p-button-icon {
										color: var(--color-neutral-950);
									}
								}

								&.ocean {
									.p-button-icon {
										color: var(--color-blue-500);
									}
								}

								&.forest {
									.p-button-icon {
										color: var(--color-green-600);
									}
								}

								&.sunset {
									.p-button-icon {
										color: var(--color-orange-700);
									}
								}
							}
						}

						.radio-group {
							display: flex;
							flex-direction: row;
							gap: 1rem;
						}

						.color-picker-container {
							display: flex;
							flex-direction: row;
							align-items: center;
							gap: 0.5rem;
						}

						.gradient-controls {
							display: flex;
							flex-direction: column;
							gap: 1rem;

							.angle {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 0.5rem;

								.title {
									font-size: 1rem;
									font-weight: 400;
									color: var(--color-neutral-100);
								}
							}

							.gradient-stops {
								display: flex;
								flex-direction: row;
								flex-wrap: wrap;
								gap: 1rem;

								.gradient-stop {
									display: flex;
									flex-direction: row;
									align-items: center;
									gap: 0.5rem;
								}
							}
						}
					}

					.section-container {
						@include squircle(1.5rem);
						border: 1px solid color-mix(in oklab, var(--color-gray-700) 60%, transparent);
						padding: 1rem;
						background-color: color-mix(in oklab, var(--color-gray-800) 40%, transparent);
						display: flex;
						flex-direction: column;
						gap: 0.5rem;

						.title {
							font-size: 1rem;
							font-weight: 500;
							color: var(--color-neutral-100);
						}

						.subsection {
							display: flex;
							flex-direction: column;
							gap: 0.5rem;

							.subsection-title {
								font-size: 0.75rem;
								font-weight: 500;
								color: var(--color-neutral-100);
							}

							.subsection-items {
								display: flex;
								flex-direction: row;
								flex-wrap: wrap;
								gap: 0.5rem;
							}
						}
					}
				}
			}
		}

		.preview {
			display: flex;
			flex-direction: column;
			gap: 1rem;

			.title {
				font-size: 1rem;
				font-weight: 500;
				color: var(--color-neutral-100);
			}

			.container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 0.5rem;
				padding: 2rem;
				background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
				@include squircle(1.5rem);
				border: 2px dashed color-mix(in oklab, var(--color-gray-700) 30%, transparent);

				#qr-code-advanced-canvas {
					overflow: hidden;
					height: fit-content;
					width: fit-content;
					line-height: 1;
				}

				.caption-title {
					font-size: 0.75rem;
					font-weight: 400;
					color: var(--color-neutral-400);
				}

				.caption-description {
					font-size: 0.75rem;
					font-weight: 400;
					color: var(--color-neutral-400);
					text-align: center;
				}
			}
		}
	}
</style>
