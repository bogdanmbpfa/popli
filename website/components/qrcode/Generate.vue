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
					:option-value="(option) => option.value"
					@value-change="qrCodeOptions.data = undefined" />
			</FormInput>

			<FormInput id="title" label="Title" size="half" required>
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

		<!-- <div class="appearance">
			<span class="title">Appearance</span>

			<div class="content">
				<div class="control-section">
					<span class="title">Shape</span>

					<div class="button-group">
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

				<div class="control-section">
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

				<div class="control-section">
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

				<div class="control-section">
					<div class="section-header">
						<Icon name="material-symbols:palette-outline" size="1rem" />

						<span class="title">Color Presets</span>
					</div>

					<div class="button-group">
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

				<div class="control-section">
					<span class="title">Background Color</span>

					<div class="radio-group">
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

					<div v-if="backgroundColorType === 'solid'" class="color-picker-container">
						<PColorPicker
							id="background-color-solid"
							v-model="backgroundColor"
							class="default"
							overlay-class="default"
							fluid
							format="hex"
							@change="setBackgroundColor" />
					</div>

					<div v-if="backgroundColorType === 'gradient'" class="gradient-controls">
						<div class="slider-control">
							<span class="title">Angle: </span>

							<PSlider
								id="background-color-gradient-angle"
								v-model="backgroundGradient.rotation"
								class="default"
								fluid
								:min="0"
								:max="360"
								@value-change="setBackgroundGradientAngle" />

							<span class="value-display">{{ backgroundGradient.rotation }}°</span>
						</div>

						<div class="gradient-stops">
							<div
								v-for="(stop, index) in backgroundGradient.stops"
								:key="`gradient-color-${index}`"
								class="gradient-stop">
								<div class="color-picker-container">
									<PColorPicker
										id="background-color-gradient"
										v-model="stop.color"
										class="default"
										overlay-class="default"
										fluid
										format="hex"
										@value-change="setBackgroundGradientStopColor(index, stop.color)" />
								</div>

								<div class="slider-control">
									<PSlider
										id="background-color-gradient-offset"
										v-model="stop.offset"
										class="default"
										fluid
										:min="0"
										:max="100"
										@value-change="setBackgroundGradientStopOffset(index, stop.offset)" />

									<span class="value-display">{{ stop.offset }}%</span>
								</div>

								<div v-if="backgroundGradient.stops.length > 2" class="remove-button">
									<PButton
										type="button"
										class="default"
										icon="pi pi-minus"
										@click="removeBackgroundGradientStop(index)" />
								</div>
							</div>
						</div>

						<div class="add-button">
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

				<hr />

				<div class="control-section">
					<div class="section-header">
						<Icon name="material-symbols:add-photo-alternate-outline-rounded" size="1rem" />

						<span class="title">Logo</span>
					</div>

					<div v-if="!image" class="file-upload-area" @click="imageInput?.click()">
						<input
							id="image"
							ref="imageInput"
							type="file"
							accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
							@change="setImage" />

						<Icon name="material-symbols:add-photo-alternate-outline-rounded" size="2rem" />

						<span class="upload-text"> Click to upload a logo </span>

						<span class="upload-description">
							Upload a logo to be displayed in the center of the QR Code. PNG, JPEG, JPG, WEBP, SVG
							are supported up to 5MB.
						</span>
					</div>

					<div v-if="imageUrl" class="file-preview">
						<div class="preview-content">
							<div class="preview-info">
								<nuxt-img :src="imageUrl" alt="Logo" width="50" height="50" fit="contain" />

								<div class="info-text">
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

						<div class="control-section">
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

				<hr />

				<div class="control-section">
					<div class="section-header">
						<Icon name="mdi:cog-outline" size="1rem" />

						<span class="title">Advanced</span>

						<PToggleSwitch class="default" v-model="advanced" input-id="advanced" name="advanced" />
					</div>

					<div v-if="advanced" class="advanced-options">
						<div class="advanced-control-section">
							<span class="title"> Dots </span>

							<div class="control-section">
								<span class="title">Shape</span>

								<div class="button-group">
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

							<div class="control-section">
								<span class="title">Color</span>

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
									<div class="slider-control">
										<span class="title">Angle: </span>

										<PSlider
											id="dots-color-gradient-angle"
											v-model="dotsGradient.rotation"
											class="default"
											fluid
											:min="0"
											:max="360"
											@value-change="setDotsGradientAngle" />

										<span class="value-display">{{ dotsGradient.rotation }}°</span>
									</div>

									<div class="gradient-stops">
										<div
											v-for="(stop, index) in dotsGradient.stops"
											:key="`dots-color-gradient-${index}`"
											class="gradient-stop">
											<div class="color-picker-container">
												<PColorPicker
													id="dots-color-gradient"
													v-model="stop.color"
													class="default"
													overlay-class="default"
													fluid
													format="hex"
													@value-change="setDotsGradientStopColor(index, stop.color)" />
											</div>

											<div class="slider-control">
												<PSlider
													id="dots-color-gradient-offset"
													v-model="stop.offset"
													class="default"
													fluid
													:min="0"
													:max="100"
													@value-change="setDotsGradientStopOffset(index, stop.offset)" />

												<span class="value-display">{{ stop.offset }}%</span>
											</div>

											<div v-if="dotsGradient.stops.length > 2" class="remove-button">
												<PButton
													type="button"
													class="default"
													icon="pi pi-minus"
													@click="removeDotsGradientStop(index)" />
											</div>
										</div>
									</div>

									<div class="add-button">
										<PButton
											type="button"
											class="default"
											severity="secondary"
											icon="pi pi-plus"
											icon-pos="left"
											label="Add Stop"
											@click="addDotsGradientStop" />
									</div>
								</div>
							</div>
						</div>

						<div class="advanced-control-section">
							<span class="title"> Corner Squares </span>

							<div class="control-section">
								<span class="title">Shape</span>

								<div class="button-group">
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

							<div class="control-section">
								<span class="title">Color</span>

								<div class="radio-group">
									<div class="radio-button-item">
										<PRadioButton
											input-id="corner-squares-color-type-solid"
											v-model="cornerSquaresColorType"
											name="cornerSquaresColorType"
											class="default"
											value="solid"
											@value-change="setCornerSquaresColorType" />

										<label for="corner-squares-color-type-solid">Solid</label>
									</div>

									<div class="radio-button-item">
										<PRadioButton
											input-id="corner-squares-color-type-gradient"
											v-model="cornerSquaresColorType"
											name="cornerSquaresColorType"
											class="default"
											value="gradient"
											@value-change="setCornerSquaresColorType" />

										<label for="corner-squares-color-type-gradient">Gradient</label>
									</div>
								</div>

								<div v-if="cornerSquaresColorType === 'solid'" class="color-picker-container">
									<PColorPicker
										id="corner-squares-color"
										v-model="qrCodeOptions.cornersSquareOptions!.color"
										class="default"
										overlay-class="default"
										fluid
										format="hex"
										@change="setCornerSquaresColor" />
								</div>

								<div v-if="cornerSquaresColorType === 'gradient'" class="gradient-controls">
									<div class="slider-control">
										<span class="title">Angle: </span>

										<PSlider
											id="corner-squares-color-gradient-angle"
											v-model="cornerSquaresGradient.rotation"
											class="default"
											fluid
											:min="0"
											:max="360"
											@value-change="setCornerSquaresGradientAngle" />

										<span class="value-display">{{ cornerSquaresGradient.rotation }}°</span>
									</div>

									<div class="gradient-stops">
										<div
											v-for="(stop, index) in cornerSquaresGradient.stops"
											:key="`corner-squares-color-gradient-${index}`"
											class="gradient-stop">
											<div class="color-picker-container">
												<PColorPicker
													id="corner-squares-color-gradient"
													v-model="stop.color"
													class="default"
													overlay-class="default"
													fluid
													format="hex"
													@value-change="setCornerSquaresGradientStopColor(index, stop.color)" />
											</div>

											<div class="slider-control">
												<PSlider
													id="corner-squares-color-gradient-offset"
													v-model="stop.offset"
													class="default"
													fluid
													:min="0"
													:max="100"
													@value-change="setCornerSquaresGradientStopOffset(index, stop.offset)" />

												<span class="value-display">{{ stop.offset }}%</span>
											</div>

											<div v-if="cornerSquaresGradient.stops.length > 2" class="remove-button">
												<PButton
													type="button"
													class="default"
													icon="pi pi-minus"
													@click="removeCornerSquaresGradientStop(index)" />
											</div>
										</div>
									</div>

									<div class="add-button">
										<PButton
											type="button"
											class="default"
											severity="secondary"
											icon="pi pi-plus"
											icon-pos="left"
											label="Add Stop"
											@click="addCornerSquaresGradientStop" />
									</div>
								</div>
							</div>
						</div>

						<div class="advanced-control-section">
							<span class="title">Cornor Dots</span>

							<div class="control-section">
								<span class="title">Shape</span>

								<div class="button-group">
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

							<div class="control-section">
								<span class="title">Color</span>

								<div class="radio-group">
									<div class="radio-button-item">
										<PRadioButton
											input-id="corner-dots-color-type-solid"
											v-model="cornerDotsColorType"
											name="cornerDotsColorType"
											class="default"
											value="solid"
											@value-change="setCornerDotsColorType" />

										<label for="corner-dots-color-type-solid">Solid</label>
									</div>

									<div class="radio-button-item">
										<PRadioButton
											input-id="corner-dots-color-type-gradient"
											v-model="cornerDotsColorType"
											name="cornerDotsColorType"
											class="default"
											value="gradient"
											@value-change="setCornerDotsColorType" />

										<label for="corner-dots-color-type-gradient">Gradient</label>
									</div>
								</div>

								<div v-if="cornerDotsColorType === 'solid'" class="color-picker-container">
									<PColorPicker
										id="corner-dots-color"
										v-model="qrCodeOptions.cornersDotOptions!.color"
										class="default"
										overlay-class="default"
										fluid
										format="hex"
										@change="setCornerDotsColor" />
								</div>

								<div v-if="cornerDotsColorType === 'gradient'" class="gradient-controls">
									<div class="slider-control">
										<span class="title">Angle: </span>

										<PSlider
											id="corner-dots-color-gradient-angle"
											v-model="cornerDotsGradient.rotation"
											class="default"
											fluid
											:min="0"
											:max="360"
											@value-change="setCornerDotsGradientAngle" />

										<span class="value-display">{{ cornerDotsGradient.rotation }}°</span>
									</div>

									<div class="gradient-stops">
										<div
											v-for="(stop, index) in cornerDotsGradient.stops"
											:key="`corner-dots-color-gradient-${index}`"
											class="gradient-stop">
											<div class="color-picker-container">
												<PColorPicker
													id="corner-dots-color-gradient"
													v-model="stop.color"
													class="default"
													overlay-class="default"
													fluid
													format="hex"
													@value-change="setCornerDotsGradientStopColor(index, stop.color)" />
											</div>

											<div class="slider-control">
												<PSlider
													id="corner-dots-color-gradient-offset"
													v-model="stop.offset"
													class="default"
													fluid
													:min="0"
													:max="100"
													@value-change="setCornerDotsGradientStopOffset(index, stop.offset)" />

												<span class="value-display">{{ stop.offset }}%</span>
											</div>

											<div v-if="cornerDotsGradient.stops.length > 2" class="remove-button">
												<PButton
													type="button"
													class="default"
													icon="pi pi-minus"
													@click="removeCornerDotsGradientStop(index)" />
											</div>
										</div>
									</div>

									<div class="add-button">
										<PButton
											type="button"
											class="default"
											severity="secondary"
											icon="pi pi-plus"
											icon-pos="left"
											label="Add Stop"
											@click="addCornerDotsGradientStop" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div> -->

		<hr />

		<div class="preview">
			<span class="title">Preview</span>

			<div class="container">
				<div
					id="qr-code-canvas"
					:style="`width: ${qrCodeOptions.width}px; height: ${qrCodeOptions.height}px;`" />

				<span class="caption-title"> Sample QR Code Preview </span>

				<span class="caption-description">
					This QR Code is generated with sample content for preview purposes. <br />
					The actual content will be set when you generate the QR Code.
				</span>
			</div>
		</div>

		<PButton
			type="button"
			class="default"
			severity="secondary"
			fluid
			icon="pi pi-cog"
			label="Advanced Configuration"
			@click="openQrCodeAdvancedConfigurationDialog" />

		<PButton
			type="button"
			class="default"
			severity="contrast"
			fluid
			icon="pi pi-plus"
			label="Create QR Code"
			:disabled="!title || !qrCodeOptions.data"
			@click="generateQRCode" />
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

	const QrCodeAdvancedConfigurationDialog = defineAsyncComponent(
		() => import('~/components/dialog/QrCodeAdvancedConfiguration.vue')
	);

	const dialog = useDialog();

	const qrCodeOptions = reactive<Options>({
		width: 128,
		height: 128,
		data: 'Preview QR Code',
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

	const dotsGradient = reactive<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});

	const cornerSquaresGradient = reactive<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});

	const cornerDotsGradient = reactive<{
		rotation: number;
		stops: { color: string; offset: number }[];
	}>({
		rotation: 0,
		stops: [
			{ color: 'ffffff', offset: 0 },
			{ color: '000000', offset: 100 },
		],
	});

	const dotsColorType = ref<'solid' | 'gradient'>('solid');
	const cornerDotsColorType = ref<'solid' | 'gradient'>('solid');
	const cornerSquaresColorType = ref<'solid' | 'gradient'>('solid');
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

	const openQrCodeAdvancedConfigurationDialog = () =>
		dialog.open(QrCodeAdvancedConfigurationDialog, {
			data: qrCodeOptions,
			props: {
				blockScroll: true,
				closable: false,
				closeOnEscape: false,
				dismissableMask: false,
				draggable: false,
				header: 'Advanced QR Code Configuration',
				modal: true,
				position: 'center',
				pt: { root: { class: 'default' } },
				style: { width: '40rem' },
			},
			onClose: () => {},
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

	const setDotsGradientAngle = debounce((value: number | number[]) => {
		dotsGradient.rotation = value as number;
		qrCodeOptions.dotsOptions!.gradient!.rotation = value as number;
	}, 100);

	const setDotsColorType = (value: 'solid' | 'gradient') => {
		if (value === 'solid') {
			qrCodeOptions.dotsOptions!.gradient = undefined;
			qrCodeOptions.dotsOptions!.color = '#000000';
		} else {
			qrCodeOptions.dotsOptions!.color = undefined;
			qrCodeOptions.dotsOptions!.gradient = {
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
		qrCodeOptions.dotsOptions!.color = `#${event.value}`;
	};

	const setDotsGradientStopColor = (index: number, color: string) => {
		dotsGradient.stops[index].color = color;

		if (!qrCodeOptions.dotsOptions!.gradient) {
			qrCodeOptions.dotsOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.dotsOptions!.gradient!.colorStops[index].color = `#${color}`;
	};

	const setDotsGradientStopOffset = debounce((index: number, offset: number) => {
		dotsGradient.stops[index].offset = offset;

		if (!qrCodeOptions.dotsOptions!.gradient) {
			qrCodeOptions.dotsOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.dotsOptions!.gradient!.colorStops[index].offset = offset;
	});

	const addDotsGradientStop = () => {
		if (!qrCodeOptions.dotsOptions!.gradient) {
			qrCodeOptions.dotsOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		dotsGradient.stops.splice(dotsGradient.stops.length - 1, 0, {
			color: '#ffffff',
			offset: 50,
		});

		qrCodeOptions.dotsOptions!.gradient!.colorStops.splice(
			qrCodeOptions.dotsOptions!.gradient!.colorStops.length - 1,
			0,
			{ offset: 50, color: '#ffffff' }
		);
	};

	const removeDotsGradientStop = (index: number) => {
		dotsGradient.stops.splice(index, 1);
		qrCodeOptions.dotsOptions!.gradient!.colorStops.splice(index, 1);
	};

	const setCornerSquaresColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.cornersSquareOptions!.color = `#${event.value}`;
	};

	const setCornerSquaresColorType = (value: 'solid' | 'gradient') => {
		if (value === 'solid') {
			qrCodeOptions.cornersSquareOptions!.gradient = undefined;
			qrCodeOptions.cornersSquareOptions!.color = '#000000';
		} else {
			qrCodeOptions.cornersSquareOptions!.color = undefined;
			qrCodeOptions.cornersSquareOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}
	};

	const setCornerSquaresGradientAngle = debounce((value: number | number[]) => {
		cornerSquaresGradient.rotation = value as number;
		qrCodeOptions.cornersSquareOptions!.gradient!.rotation = value as number;
	}, 100);

	const setCornerSquaresGradientStopColor = debounce((index: number, color: string) => {
		cornerSquaresGradient.stops[index].color = color;

		if (!qrCodeOptions.cornersSquareOptions!.gradient) {
			qrCodeOptions.cornersSquareOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.cornersSquareOptions!.gradient!.colorStops[index].color = `#${color}`;
	}, 100);

	const setCornerSquaresGradientStopOffset = debounce((index: number, offset: number) => {
		cornerSquaresGradient.stops[index].offset = offset;

		if (!qrCodeOptions.cornersSquareOptions!.gradient) {
			qrCodeOptions.cornersSquareOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.cornersSquareOptions!.gradient!.colorStops[index].offset = offset;
	}, 100);

	const removeCornerSquaresGradientStop = (index: number) => {
		cornerSquaresGradient.stops.splice(index, 1);
		qrCodeOptions.cornersSquareOptions!.gradient!.colorStops.splice(index, 1);
	};

	const addCornerSquaresGradientStop = () => {
		if (!qrCodeOptions.cornersSquareOptions!.gradient) {
			qrCodeOptions.cornersSquareOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		cornerSquaresGradient.stops.splice(cornerSquaresGradient.stops.length - 1, 0, {
			color: '#ffffff',
			offset: 50,
		});

		qrCodeOptions.cornersSquareOptions!.gradient!.colorStops.splice(
			qrCodeOptions.cornersSquareOptions!.gradient!.colorStops.length - 1,
			0,
			{ offset: 50, color: '#ffffff' }
		);
	};

	const setCornerDotsColorType = (value: 'solid' | 'gradient') => {
		if (value === 'solid') {
			qrCodeOptions.cornersDotOptions!.gradient = undefined;
			qrCodeOptions.cornersDotOptions!.color = '#000000';
		} else {
			qrCodeOptions.cornersDotOptions!.color = undefined;
			qrCodeOptions.cornersDotOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}
	};

	const setCornerDotsColor = (event: ColorPickerChangeEvent) => {
		qrCodeOptions.cornersDotOptions!.color = `#${event.value}`;
	};

	const setCornerDotsGradientAngle = debounce((value: number | number[]) => {
		cornerDotsGradient.rotation = value as number;
		qrCodeOptions.cornersDotOptions!.gradient!.rotation = value as number;
	}, 100);

	const setCornerDotsGradientStopColor = debounce((index: number, color: string) => {
		cornerDotsGradient.stops[index].color = color;

		if (!qrCodeOptions.cornersDotOptions!.gradient) {
			qrCodeOptions.cornersDotOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.cornersDotOptions!.gradient!.colorStops[index].color = `#${color}`;
	}, 100);

	const setCornerDotsGradientStopOffset = debounce((index: number, offset: number) => {
		cornerDotsGradient.stops[index].offset = offset;

		if (!qrCodeOptions.cornersDotOptions!.gradient) {
			qrCodeOptions.cornersDotOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		qrCodeOptions.cornersDotOptions!.gradient!.colorStops[index].offset = offset;
	}, 100);

	const removeCornerDotsGradientStop = (index: number) => {
		cornerDotsGradient.stops.splice(index, 1);
		qrCodeOptions.cornersDotOptions!.gradient!.colorStops.splice(index, 1);
	};

	const addCornerDotsGradientStop = () => {
		if (!qrCodeOptions.cornersDotOptions!.gradient) {
			qrCodeOptions.cornersDotOptions!.gradient = {
				type: 'linear',
				rotation: 0,
				colorStops: [
					{ offset: 0, color: '#ffffff' },
					{ offset: 100, color: '#000000' },
				],
			};
		}

		cornerDotsGradient.stops.splice(cornerDotsGradient.stops.length - 1, 0, {
			color: '#ffffff',
			offset: 50,
		});

		qrCodeOptions.cornersDotOptions!.gradient!.colorStops.splice(
			qrCodeOptions.cornersDotOptions!.gradient!.colorStops.length - 1,
			0,
			{ offset: 50, color: '#ffffff' }
		);
	};

	const generateQRCode = async () => {};

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
	@use '../../assets/mixins.scss' as *;

	.qrcode-generate {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		backdrop-filter: blur(1.5rem) saturate(180%);
		-webkit-backdrop-filter: blur(1.5rem) saturate(180%);
		background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
		padding: 1.5rem;
		@include squircle(1.5rem);
		border: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);

		.header {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.title {
				font-size: 1rem;
				font-weight: 500;
				color: var(--color-neutral-100);
			}

			.description {
				font-size: 0.75rem;
				font-weight: 400;
				color: var(--color-neutral-400);
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
			border-top: 1px solid color-mix(in oklab, var(--color-gray-700) 30%, transparent);
			margin: 0;
		}

		.appearance {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;

			.title {
				font-size: 1rem;
				font-weight: 500;
				color: var(--color-neutral-100);
			}

			.content {
				display: flex;
				flex-direction: column;
				gap: 1.5rem;

				.control-section,
				.advanced-control-section {
					display: flex;
					flex-direction: column;
					gap: 0.75rem;

					.title {
						font-size: 0.75rem;
						font-weight: 400;
						color: var(--color-neutral-100);
					}

					.button-group {
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

					.section-header {
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

					.radio-group {
						display: flex;
						flex-direction: row;
						gap: 1rem;
					}

					.color-picker-container {
						width: fit-content;
						background-color: color-mix(in oklab, var(--color-gray-900) 40%, transparent);
						border-radius: 0.5rem;
						padding: 0.5rem;
					}

					.gradient-controls {
						display: flex;
						flex-direction: column;
						gap: 1rem;

						.slider-control {
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

							.value-display {
								font-size: 0.75rem;
								font-weight: 400;
								color: var(--text-100);
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
								gap: 1rem;

								.color-picker-container {
									padding: 0.5rem;
									background-color: var(--background-2);
									border-radius: 0.5rem;
								}

								.slider-control {
									display: flex;
									flex-direction: row;
									align-items: center;
									gap: 1rem;

									:deep(.p-slider) {
										width: 10rem;
									}

									.value-display {
										font-size: 0.75rem;
										font-weight: 400;
										color: var(--text-100);
									}
								}
							}
						}
					}

					.file-upload-area {
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

						.upload-text {
							font-size: 1rem;
							font-weight: 400;
							color: var(--text-100);
						}

						.upload-description {
							font-size: 0.75rem;
							font-weight: 400;
							color: var(--text-300);
						}
					}

					.file-preview {
						display: flex;
						flex-direction: column;
						gap: 0.5rem;

						.preview-content {
							border: 1px solid var(--border-1);
							border-radius: 0.5rem;
							padding: 1rem;
							display: flex;
							flex-direction: row;
							align-items: center;
							justify-content: space-between;

							.preview-info {
								display: flex;
								flex-direction: row;
								align-items: center;
								gap: 0.5rem;

								img {
									border-radius: 0.5rem;
									overflow: hidden;
								}

								.info-text {
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
					}

					.advanced-options {
						display: flex;
						flex-direction: column;
						gap: 1rem;
					}
				}

				.advanced-control-section {
					padding: 1rem;
					border: 1px solid var(--border-1);
					border-radius: 0.5rem;
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

				#qr-code-canvas {
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
