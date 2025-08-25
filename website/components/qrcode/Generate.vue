<template>
	<div class="qrcode-generate">
		<div class="header">
			<span class="title">Create new QR Code</span>

			<span class="description"> Generate a new QR Code for any type of content. </span>
		</div>

		<div class="content">
			<FormInput id="type" label="Type" size="half" required>
				<PSelect
					id="type"
					v-model="type"
					class="default"
					overlay-class="default"
					fluid
					:options="typeOptions"
					:option-label="(option) => option.label"
					:option-value="(option) => option.value" />
			</FormInput>

			<FormInput id="title" label="Title" size="half">
				<PInputText id="title" v-model="title" class="default" overlay-class="default" fluid />
			</FormInput>

			<FormInput id="data" label="Data" required>
				<PInputText
					v-if="type === 'url'"
					id="data"
					v-model="qrCodeOptions.data"
					class="default"
					overlay-class="default"
					fluid
					placeholder="https://example.com" />

				<PInputText
					v-else-if="type === 'email'"
					id="data"
					type="email"
					v-model="qrCodeOptions.data"
					class="default"
					overlay-class="default"
					fluid
					placeholder="example@example.com" />

				<PInputText
					v-else-if="type === 'phone'"
					id="data"
					type="tel"
					v-model="qrCodeOptions.data"
					class="default"
					overlay-class="default"
					fluid
					placeholder="1234567890" />

				<PTextarea
					v-else
					id="data"
					v-model="qrCodeOptions.data"
					class="default"
					overlay-class="default"
					fluid
					placeholder="My QR Code"
					rows="3" />
			</FormInput>
		</div>

		<hr />

		<div class="appearance">
			<span class="title">Appearance</span>

			<div class="content">
				<div class="shape">
					<span class="title">Shape</span>

					<div class="shapes">
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

				<div class="background-border-radius">
					<span class="title">
						Background Border Radius
						{{ Math.floor(qrCodeOptions.backgroundOptions!.round! * 100) }}%
					</span>

					<PSlider
						id="background"
						v-model="qrCodeOptions.backgroundOptions!.round"
						class="default"
						fluid
						:min="0"
						:max="1"
						:step="0.01" />
				</div>

				<div class="size">
					<span class="title">QR Code size: {{ size }}px</span>

					<PSlider
						id="size"
						v-model="size"
						class="default"
						fluid
						:min="128"
						:max="512"
						@value-change="setSize" />
				</div>

				<div class="color-presets">
					<div class="heading">
						<Icon name="material-symbols:palette-outline" size="1rem" />

						<span class="title">Color Presets</span>
					</div>

					<div class="presets">
						<PButton
							v-for="preset in colorPresets"
							:key="preset.value"
							type="button"
							class="default"
							:class="{ active: colorPreset === preset.value, [preset.value]: true }"
							severity="secondary"
							icon="pi pi-circle-fill"
							icon-pos="left"
							:label="preset.label"
							@click="setColorPreset(preset.value)" />
					</div>
				</div>

				<div class="background-color">
					<span class="title">Background Color</span>

					<div class="type">
						<div class="radio-button-item">
							<PRadioButton
								input-id="background-color-type-solid"
								v-model="backgroundColorType"
								class="default"
								name="backgroundColorType"
								value="solid" />

							<label for="background-color-type-solid">Solid</label>
						</div>

						<div class="radio-button-item">
							<PRadioButton
								input-id="background-color-type-gradient"
								v-model="backgroundColorType"
								name="backgroundColorType"
								class="default"
								value="gradient" />

							<label for="background-color-type-gradient">Gradient</label>
						</div>
					</div>

					<div v-if="backgroundColorType === 'solid'" class="solid-color">
						<PColorPicker
							id="background-color-solid"
							v-model="backgroundColor"
							class="default"
							overlay-class="default"
							fluid
							format="hex"
							@change="setBackgroundColor" />
					</div>

					<div v-if="backgroundColorType === 'gradient'" class="gradient-color">
						<div class="angle">
							<span class="title">Angle: </span>

							<PSlider
								id="background-color-gradient-angle"
								v-model="backgroundGradient.rotation"
								class="default"
								fluid
								:min="0"
								:max="360"
								@value-change="setBackgroundGradientAngle" />

							<span class="angle-value">{{ backgroundGradient.rotation }}°</span>
						</div>

						<div class="gradient-color-items">
							<div
								v-for="(stop, index) in backgroundGradient.stops"
								:key="`gradient-color-${index}`"
								class="gradient-color-item">
								<div class="color-picker">
									<PColorPicker
										id="background-color-gradient"
										v-model="stop.color"
										class="default"
										overlay-class="default"
										fluid
										format="hex"
										@value-change="setBackgroundGradientStopColor(index, stop.color)" />
								</div>

								<div class="offset">
									<PSlider
										id="background-color-gradient-offset"
										v-model="stop.offset"
										class="default"
										fluid
										:min="0"
										:max="100"
										@value-change="setBackgroundGradientStopOffset(index, stop.offset)" />

									<span class="offset-value">{{ stop.offset }}%</span>
								</div>

								<div v-if="backgroundGradient.stops.length > 2" class="remove-stop">
									<PButton
										type="button"
										class="default"
										icon="pi pi-minus"
										@click="removeBackgroundGradientStop(index)" />
								</div>
							</div>
						</div>

						<div class="add-stop">
							<PButton
								type="button"
								class="default"
								severity="secondary"
								icon="pi pi-plus"
								icon-pos="left"
								label="Add Stop"
								@click="addBackgroundGradientStop" />
						</div>
					</div>
				</div>

				<div class="image">
					<div class="heading">
						<Icon name="material-symbols:add-photo-alternate-outline-rounded" size="1rem" />

						<span class="title">Logo</span>
					</div>

					<div v-if="!image" class="input" @click="imageInput?.click()">
						<input
							id="image"
							ref="imageInput"
							type="file"
							accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
							@change="setImage" />

						<Icon name="material-symbols:add-photo-alternate-outline-rounded" size="2rem" />

						<span class="cta"> Click to upload a logo </span>

						<span class="description">
							Upload a logo to be displayed in the center of the QR Code. PNG, JPEG, JPG, WEBP, SVG
							are supported up to 5MB.
						</span>
					</div>

					<div v-if="imageUrl" class="image-preview">
						<div class="content">
							<div class="preview">
								<nuxt-img :src="imageUrl" alt="Logo" width="50" height="50" fit="contain" />

								<div class="info">
									<span class="title"> Logo uploaded </span>

									<span class="description"> Ready to use in QR Code </span>
								</div>
							</div>

							<PButton
								type="button"
								class="default"
								severity="danger"
								icon="pi pi-times"
								@click="removeImage" />
						</div>

						<div class="image-size">
							<span class="title">Image Size: {{ Math.floor(imageSize * 100) }}%</span>

							<PSlider
								id="image-size"
								v-model="imageSize"
								class="default"
								fluid
								:min="0"
								:max="0.4"
								:step="0.01"
								@value-change="setImageSize" />
						</div>
					</div>
				</div>

				<div class="dots-shapes">
					<span class="title">Dots Shapes</span>

					<div class="shapes">
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

				<div class="corner-dots-shapes">
					<span class="title">Corner Dots Shapes</span>

					<div class="shapes">
						<PButton
							v-for="shape in cornerDotsShapes"
							:key="shape.value"
							type="button"
							class="default"
							:class="{ active: qrCodeOptions.cornersDotOptions!.type === shape.value }"
							severity="secondary"
							:label="shape.label"
							@click="setCornerDotsShape(shape.value)" />
					</div>
				</div>

				<div class="corner-squares-shapes">
					<span class="title">Corner Squares Shapes</span>

					<div class="shapes">
						<PButton
							v-for="shape in cornerSquaresShapes"
							:key="shape.value"
							type="button"
							class="default"
							:class="{ active: qrCodeOptions.cornersSquareOptions!.type === shape.value }"
							severity="secondary"
							:label="shape.label"
							@click="setCornerSquaresShape(shape.value)" />
					</div>
				</div>
			</div>
		</div>

		<hr />

		<div class="preview">
			<span class="title">Preview</span>

			<div class="container">
				<div
					v-show="qrCodeOptions.data"
					id="qr-code-canvas"
					:style="`width: ${qrCodeOptions.width}px; height: ${qrCodeOptions.height}px;`" />

				<span v-show="!qrCodeOptions.data" class="no-data">
					Input your data to generate a QR Code
				</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import debounce from 'lodash/debounce';
	import type { ColorPickerChangeEvent } from 'primevue/colorpicker';
	import QRCodeStyling, {
		type CornerDotType,
		type CornerSquareType,
		type DotType,
		type Options,
	} from 'qr-code-styling';

	const qrCodeOptions = reactive<Options>({
		width: 128,
		height: 128,
		data: 'My QR Code',
		margin: 6,
		type: 'canvas',
		shape: 'square',
		image: undefined,
		qrOptions: {},
		imageOptions: {
			crossOrigin: 'anonymous',
			imageSize: 0.4,
			hideBackgroundDots: true,
			saveAsBlob: true,
		},
		dotsOptions: {
			color: '#000000',
			type: 'square',
		},
		cornersSquareOptions: {
			type: 'square',
			color: '#000000',
		},
		cornersDotOptions: {
			type: 'square',
			color: '#000000',
		},
		backgroundOptions: {
			color: 'white',
			round: 0,
		},
	});

	const backgroundColorType = ref<'solid' | 'gradient'>('solid');
	const backgroundColor = ref('ffffff');
	const backgroundGradient = reactive<{
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
	const dotsShapes = ref<{ label: string; value: DotType }[]>([
		{ label: 'Dots', value: 'dots' },
		{ label: 'Square', value: 'square' },
		{ label: 'Rounded', value: 'rounded' },
		{ label: 'Classy', value: 'classy' },
		{ label: 'Classy Rounded', value: 'classy-rounded' },
		{ label: 'Extra Rounded', value: 'extra-rounded' },
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
	const image = ref<File | null>(null);
	const imageInput = ref<HTMLInputElement | null>(null);
	const imageSize = ref<number>(0.4);
	const imageUrl = ref<string | null>(null);
	const qrCode = ref<QRCodeStyling | null>(null);
	const size = ref<number>(128);
	const type = ref<'text' | 'url' | 'email' | 'phone'>('url');
	const title = ref('');

	const typeOptions = [
		{
			label: 'Text',
			value: 'text',
		},
		{
			label: 'URL',
			value: 'url',
		},
		{
			label: 'Email',
			value: 'email',
		},
		{
			label: 'Phone',
			value: 'phone',
		},
	];

	onMounted(() => {
		qrCode.value = new QRCodeStyling(qrCodeOptions);
		setTimeout(() => {
			qrCode.value?.append(document.getElementById('qr-code-canvas') as HTMLElement);
		}, 300);
	});

	const setColorPreset = (preset: string) => {
		switch (preset) {
			case 'classic':
				qrCodeOptions.dotsOptions!.color = '#000000';
				qrCodeOptions.cornersSquareOptions!.color = '#000000';
				qrCodeOptions.cornersDotOptions!.color = '#000000';
				qrCodeOptions.backgroundOptions!.color = 'white';
				colorPreset.value = 'classic';
				break;

			case 'blue':
				qrCodeOptions.dotsOptions!.color = '#155dfc';
				qrCodeOptions.cornersSquareOptions!.color = '#155dfc';
				qrCodeOptions.cornersDotOptions!.color = '#155dfc';
				qrCodeOptions.backgroundOptions!.color = 'white';
				colorPreset.value = 'blue';
				break;

			case 'purple':
				qrCodeOptions.dotsOptions!.color = '#9810fa';
				qrCodeOptions.cornersSquareOptions!.color = '#9810fa';
				qrCodeOptions.cornersDotOptions!.color = '#9810fa';
				qrCodeOptions.backgroundOptions!.color = 'white';
				colorPreset.value = 'purple';
				break;

			case 'pink':
				qrCodeOptions.dotsOptions!.color = '#e60076';
				qrCodeOptions.cornersSquareOptions!.color = '#e60076';
				qrCodeOptions.cornersDotOptions!.color = '#e60076';
				qrCodeOptions.backgroundOptions!.color = 'white';
				colorPreset.value = 'pink';
				break;

			case 'darkMode':
				qrCodeOptions.dotsOptions!.color = '#ffffff';
				qrCodeOptions.cornersSquareOptions!.color = '#ffffff';
				qrCodeOptions.cornersDotOptions!.color = '#ffffff';
				qrCodeOptions.backgroundOptions!.color = '#4a5565';
				colorPreset.value = 'darkMode';
				break;

			case 'ocean':
				qrCodeOptions.dotsOptions!.color = '#2b7fff';
				qrCodeOptions.cornersSquareOptions!.color = '#2b7fff';
				qrCodeOptions.cornersDotOptions!.color = '#2b7fff';
				qrCodeOptions.backgroundOptions!.color = '#ecfeff';
				colorPreset.value = 'ocean';
				break;

			case 'forest':
				qrCodeOptions.dotsOptions!.color = '#00a63e';
				qrCodeOptions.cornersSquareOptions!.color = '#00a63e';
				qrCodeOptions.cornersDotOptions!.color = '#00a63e';
				qrCodeOptions.backgroundOptions!.color = '#ecfdf5';
				colorPreset.value = 'forest';
				break;

			case 'sunset':
				qrCodeOptions.dotsOptions!.color = '#ca3500';
				qrCodeOptions.cornersSquareOptions!.color = '#ca3500';
				qrCodeOptions.cornersDotOptions!.color = '#ca3500';
				qrCodeOptions.backgroundOptions!.color = '#fef2f2';
				colorPreset.value = 'sunset';
				break;

			default:
				colorPreset.value = null;
				break;
		}
	};

	const setShape = (shape: 'circle' | 'square') => {
		qrCodeOptions.shape = shape;
	};

	const setDotsShape = (shape: DotType) => {
		qrCodeOptions.dotsOptions!.type = shape;
	};

	const setCornerDotsShape = (shape: CornerDotType) => {
		qrCodeOptions.cornersDotOptions!.type = shape;
	};

	const setCornerSquaresShape = (shape: CornerSquareType) => {
		qrCodeOptions.cornersSquareOptions!.type = shape;
	};

	const setBackgroundColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.backgroundOptions!.color = `#${event.value}`;
	};

	const setSize = (value: number | number[]) => {
		qrCodeOptions.width = value as number;
		qrCodeOptions.height = value as number;
	};

	const setImage = (event: Event) => {
		const file = (event.target as HTMLInputElement).files?.[0];

		if (file) {
			image.value = file;

			imageUrl.value = URL.createObjectURL(file);
			qrCodeOptions.image = imageUrl.value;
		}
	};

	const removeImage = () => {
		image.value = null;
		imageUrl.value = null;
		qrCodeOptions.image = undefined;
	};

	const setImageSize = (value: number | number[]) => {
		qrCodeOptions.imageOptions!.imageSize = value as number;
	};

	const setBackgroundGradientAngle = debounce((value: number | number[]) => {
		qrCodeOptions.backgroundOptions!.gradient!.rotation = value as number;
	}, 100);

	const setBackgroundGradientStopColor = debounce((index: number, color: string) => {
		backgroundGradient.stops[index].color = color;
		qrCodeOptions.backgroundOptions!.gradient!.colorStops[index].color = `#${color}`;
	}, 100);

	const setBackgroundGradientStopOffset = debounce((index: number, offset: number) => {
		backgroundGradient.stops[index].offset = offset;
		qrCodeOptions.backgroundOptions!.gradient!.colorStops[index].offset = offset;
	}, 100);

	const removeBackgroundGradientStop = (index: number) => {
		backgroundGradient.stops.splice(index, 1);
		qrCodeOptions.backgroundOptions!.gradient!.colorStops.splice(index, 1);
	};

	const addBackgroundGradientStop = () => {
		backgroundGradient.stops.splice(backgroundGradient.stops.length - 1, 0, {
			color: 'ffffff',
			offset: 50,
		});

		qrCodeOptions.backgroundOptions!.gradient!.colorStops.splice(
			qrCodeOptions.backgroundOptions!.gradient!.colorStops.length - 1,
			0,
			{ offset: 50, color: '#ffffff' }
		);
	};

	watch(
		qrCodeOptions,
		async (options) => {
			const canvas = document.getElementById('qr-code-canvas') as HTMLElement;

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

	watch(backgroundColorType, () => {
		if (backgroundColorType.value === 'gradient') {
			qrCodeOptions.backgroundOptions!.color = undefined;
			qrCodeOptions.backgroundOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: backgroundGradient.stops.map((stop) => ({
					offset: Math.floor(stop.offset / 100),
					color: `#${stop.color}`,
				})),
			};
		} else {
			qrCodeOptions.backgroundOptions!.gradient = undefined;
			qrCodeOptions.backgroundOptions!.color = `#${backgroundColor.value}`;
		}
	});
</script>

<style lang="scss" scoped>
	.qrcode-generate {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.header {
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
				font-weight: 400;
				color: var(--text-300);
			}
		}

		.content {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem;
		}

		hr {
			border: none;
			border-top: 1px solid var(--border-1);
			margin: 0;
		}

		.appearance {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.title {
				font-size: 1rem;
				font-weight: 500;
				color: var(--text-100);
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: 1.5rem;

				.shape {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--text-100);
					}

					.shapes {
						display: flex;
						flex-direction: row;
						gap: 0.5rem;

						:deep(.p-button) {
							min-width: 8rem;
						}
					}
				}

				.background-border-radius {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--text-100);
					}
				}

				.size {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--text-100);
					}
				}

				.color-presets {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;

					.heading {
						display: flex;
						flex-direction: row;
						gap: 0.5rem;

						.title {
							font-size: 0.75rem;
							font-weight: 400;
							color: var(--text-100);
						}
					}

					.presets {
						display: flex;
						flex-direction: row;
						flex-wrap: wrap;
						gap: 0.5rem;

						:deep(.p-button) {
							min-width: 8rem;

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
									color: var(--color-gray-600);
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
				}

				.background-color {
					display: flex;
					flex-direction: column;
					gap: 1rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--text-100);
					}

					.type {
						display: flex;
						flex-direction: row;
						gap: 1rem;
					}

					.solid-color {
						width: fit-content;
						background-color: var(--background-2);
						border-radius: 0.5rem;
						padding: 0.5rem;
					}

					.gradient-color {
						display: flex;
						flex-direction: column;
						gap: 1rem;

						.angle {
							display: flex;
							flex-direction: row;
							align-items: center;
							gap: 1rem;

							.title {
								font-size: 0.75rem;
								font-weight: 400;
								color: var(--text-100);
							}

							:deep(.p-slider) {
								width: 10rem;
							}

							.angle-value {
								font-size: 0.75rem;
								font-weight: 400;
								color: var(--text-100);
							}
						}

						.gradient-color-items {
							display: flex;
							flex-direction: row;
							flex-wrap: wrap;
							gap: 1rem;

							.gradient-color-item {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 1rem;

								.color-picker {
									padding: 0.5rem;
									background-color: var(--background-2);
									border-radius: 0.5rem;
								}

								.offset {
									display: flex;
									flex-direction: row;
									align-items: center;
									gap: 1rem;

									:deep(.p-slider) {
										width: 10rem;
									}

									.offset-value {
										font-size: 0.75rem;
										font-weight: 400;
										color: var(--text-100);
									}
								}
							}
						}
					}
				}

				.image {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;

					.heading {
						display: flex;
						flex-direction: row;
						align-items: center;
						gap: 0.5rem;

						.title {
							font-size: 0.75rem;
							font-weight: 400;
							color: var(--text-100);
						}
					}

					.input {
						width: 100%;
						padding: 1rem;
						border: 2px dashed var(--border-1);
						border-radius: 0.5rem;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						gap: 0.5rem;
						cursor: pointer;
						position: relative;

						input {
							position: absolute;
							top: 0;
							left: 0;
							width: 0;
							height: 0;
							opacity: 0;
						}

						.cta {
							font-size: 1rem;
							font-weight: 400;
							color: var(--text-100);
						}

						.description {
							font-size: 0.75rem;
							font-weight: 400;
							color: var(--text-300);
						}
					}

					.image-preview {
						display: flex;
						flex-direction: column;
						gap: 0.5rem;

						.content {
							border: 1px solid var(--border-1);
							border-radius: 0.5rem;
							padding: 1rem;
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: space-between;

							.preview {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 0.5rem;

								img {
									border-radius: 0.5rem;
									overflow: hidden;
								}

								.info {
									display: flex;
									flex-direction: column;

									.title {
										font-size: 0.825rem;
										font-weight: 500;
										color: var(--text-100);
									}

									.description {
										font-size: 0.75rem;
										font-weight: 400;
										color: var(--text-300);
									}
								}
							}
						}

						.image-size {
							display: flex;
							flex-direction: column;
							gap: 0.25rem;

							.title {
								font-size: 0.75rem;
								font-weight: 400;
								color: var(--text-100);
							}
						}
					}
				}

				.dots-shapes,
				.corner-dots-shapes,
				.corner-squares-shapes {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--text-300);
					}

					.shapes {
						display: flex;
						flex-direction: row;
						flex-wrap: wrap;
						gap: 0.5rem;

						:deep(.p-button) {
							min-width: 8rem;
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
				color: var(--text-100);
			}

			.container {
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				padding: 2rem;
				background-color: var(--background-2);
				border-radius: 1.5rem;
				border: 2px dashed var(--border-1);

				#qr-code-canvas {
					overflow: hidden;
					height: fit-content;
					width: fit-content;
					line-height: 1;
				}

				.no-data {
					font-size: 0.75rem;
					font-weight: 400;
					color: var(--text-300);
				}
			}
		}
	}
</style>
