<template>
  <div v-if="qrCode" class="qr-code-advanced-configuration">
    <div class="content">
      <UiTabs
        v-model:value="tab"
        :tabs="[
          { value: 'colors', label: 'Colors' },
          { value: 'shapes', label: 'Shapes' },
          { value: 'logo', label: 'Logo' },
        ]"
      >
        <template #panel-colors>
          <div class="section">
            <div class="section-title">
              <span>Color presets</span>
            </div>

            <div class="section-items">
              <UiButton
                v-for="preset in colorPresets"
                :key="`color-reset-${preset.value}`"
                :class="{
                  active: colorPreset === preset.value,
                  [preset.value]: true,
                }"
                severity="secondary"
                :title="preset.label"
                :aria-label="`Set color preset to ${preset.label}`"
                @click="setColorPreset(preset.value)"
              />
            </div>
          </div>

          <hr />

          <div class="section">
            <div class="section-title">
              <span>Background Color</span>
            </div>

            <UiSelectButton
              v-model="backgroundColorType"
              :options="backgroundColorTypeOptions"
              option-label="label"
              option-value="value"
              @update:model-value="setBackgroundColorType"
            />

            <div
              v-if="backgroundColorType === 'solid'"
              class="color-picker-container"
            >
              <UiColorPicker
                id="background-color-solid"
                v-model="backgroundColor"
                fluid
                format="hex"
                @update:model-value="setBackgroundColor"
              />

              <UiInputText
                name="background-color-solid"
                :value="`#${backgroundColor}`"
                readonly
              />
            </div>

            <div
              v-if="backgroundColorType === 'gradient'"
              class="gradient-controls"
            >
              <div class="angle">
                <span class="title">Angle: </span>

                <UiInputNumber
                  v-model="backgroundGradient.rotation"
                  :min="0"
                  :max="360"
                  show-buttons
                  @update:model-value="setBackgroundGradientAngle($event as number)"
                />
              </div>

              <div class="gradient-stops">
                <div class="gradient-stop">
                  <div class="color-picker-container">
                    <UiColorPicker
                      id="background-color-gradient-0"
                      v-model="backgroundGradient.stops[0]!.color"
                      fluid
                      format="hex"
                      @update:model-value="
                        setBackgroundGradientStopColor($event, 0)
                      "
                    />
                  </div>

                  <UiInputText
                    name="background-color-gradient-0"
                    readonly
                    :value="`#${backgroundGradient.stops[0]!.color}`"
                  />
                </div>

                <div class="gradient-stop">
                  <div class="color-picker-container">
                    <UiColorPicker
                      id="background-color-gradient-1"
                      v-model="backgroundGradient.stops[1]!.color"
                      fluid
                      format="hex"
                      @update:model-value="
                        setBackgroundGradientStopColor($event, 1)
                      "
                    />
                  </div>

                  <UiInputText
                    name="background-color-gradient-1"
                    readonly
                    :value="`#${backgroundGradient.stops[1]!.color}`"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr />

          <div class="section">
            <div class="section-title">
              <span>Foreground Color</span>
            </div>

            <UiSelectButton
              v-model="foregroundColorType"
              :options="foregroundColorTypeOptions"
              option-label="label"
              option-value="value"
              @update:model-value="setForegroundColorType"
            />

            <div
              v-if="foregroundColorType === 'solid'"
              class="color-picker-container"
            >
              <UiColorPicker
                id="foreground-color-solid"
                v-model="foregroundColor"
                fluid
                format="hex"
                @update:model-value="setForegroundColor"
              />

              <UiInputText
                :value="`#${foregroundColor}`"
                name="foreground-color-solid"
                readonly
              />
            </div>

            <div
              v-if="foregroundColorType === 'gradient'"
              class="gradient-controls"
            >
              <div class="angle">
                <span class="title">Angle: </span>

                <UiInputNumber
                  v-model="foregroundGradient.rotation"
                  :min="0"
                  :max="360"
                  show-buttons
                  @update:model-value="setForegroundGradientAngle($event as number)"
                />
              </div>

              <div class="gradient-stops">
                <div class="gradient-stop">
                  <div class="color-picker-container">
                    <UiColorPicker
                      id="foreground-color-gradient-0"
                      v-model="foregroundGradient.stops[0]!.color"
                      fluid
                      format="hex"
                      @update:model-value="
                        setForegroundGradientStopColor($event, 0)
                      "
                    />
                  </div>

                  <UiInputText
                    name="foreground-color-gradient-0"
                    readonly
                    :value="`#${foregroundGradient.stops[0]!.color}`"
                  />
                </div>

                <div class="gradient-stop">
                  <div class="color-picker-container">
                    <UiColorPicker
                      id="foreground-color-gradient-1"
                      v-model="foregroundGradient.stops[1]!.color"
                      fluid
                      format="hex"
                      @update:model-value="
                        setForegroundGradientStopColor($event, 1)
                      "
                    />
                  </div>

                  <UiInputText
                    name="foreground-color-gradient-1"
                    readonly
                    :value="`#${foregroundGradient.stops[1]!.color}`"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr />

          <div class="section">
            <div class="section-title">
              <span>Shape</span>
            </div>

            <UiSelectButton
              v-model="shape"
              :options="shapeOptions"
              option-value="value"
              option-label="label"
              @update:model-value="setShape($event as 'circle' | 'square')"
            >
              <template #option="{ option }">
                <Icon class="default" :name="(option.icon as string)" />
                <span>{{ option.label }}</span>
              </template>
            </UiSelectButton>
          </div>

          <hr />

          <div class="section">
            <div class="section-title separated">
              <span>Background Border Radius</span>
              <span>{{ backgroundBorderRadius }}</span>
            </div>

            <UiSlider
              id="background"
              v-model="backgroundBorderRadius"
              fluid
              :min="0"
              :max="1"
              :step="0.01"
              @update:model-value="setBackgroundBorderRadius"
            />
          </div>

          <hr />

          <div class="section">
            <div class="section-title separated">
              <span>QR Code Size</span>
              <span>{{ width }}px</span>
            </div>

            <UiSlider
              id="size"
              v-model="width"
              fluid
              :min="128"
              :max="512"
              @update:model-value="setSize"
            />
          </div>
        </template>

        <template #panel-shapes>
          <div class="section-container">
            <span class="title"> Dots </span>

            <div class="subsection">
              <div class="subsection-title">
                <span>Shape</span>
              </div>

              <div class="subsection-items">
                <UiButton
                  v-for="dotShape in dotsShapes"
                  :key="dotShape.value"
                  type="button"
                  :severity="dotsType === dotShape.value ? 'contrast' : 'secondary'"
                  :label="dotShape.label"
                  :aria-label="`Set dots shape to ${dotShape.label}`"
                  @click="setDotsShape(dotShape.value)"
                />
              </div>
            </div>

            <div class="subsection">
              <div class="subsection-title">
                <span>Color</span>
              </div>

              <UiSelectButton
                v-model="dotsColorType"
                :options="dotsColorTypeOptions"
                option-label="label"
                option-value="value"
                @update:model-value="setDotsColorType($event as 'solid' | 'gradient')"
              />

              <div
                v-if="dotsColorType === 'solid'"
                class="color-picker-container"
              >
                <UiColorPicker
                  id="dots-color"
                  v-model="dotsColor"
                  fluid
                  format="hex"
                  @update:model-value="setDotsColor"
                />

                <UiInputText
                  name="dots-color"
                  readonly
                  :value="`#${dotsColor}`"
                />
              </div>

              <div
                v-if="dotsColorType === 'gradient'"
                class="gradient-controls"
              >
                <div class="angle">
                  <span class="title">Angle: </span>

                  <UiInputNumber
                    v-model="dotsGradient.rotation"
                    :min="0"
                    :max="360"
                    show-buttons
                    @update:model-value="setDotsGradientAngle($event as number)"
                  />
                </div>

                <div class="gradient-stops">
                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="dots-color-gradient-0"
                        v-model="dotsGradient.stops[0]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setDotsGradientStopColor($event, 0)
                        "
                      />
                    </div>

                    <UiInputText
                      name="dots-color-gradient-0"
                      readonly
                      :value="`#${dotsGradient.stops[0]!.color}`"
                    />
                  </div>

                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="dots-color-gradient-1"
                        v-model="dotsGradient.stops[1]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setDotsGradientStopColor($event, 1)
                        "
                      />
                    </div>

                    <UiInputText
                      name="dots-color-gradient-1"
                      readonly
                      :value="`#${dotsGradient.stops[1]!.color}`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-container">
            <span class="title"> Corner Dots </span>

            <div class="subsection">
              <div class="subsection-title">
                <span>Shape</span>
              </div>

              <div class="subsection-items">
                <UiButton
                  v-for="cornerDotShape in cornerDotsShapes"
                  :key="cornerDotShape.value"
                  type="button"
                  :severity="
                    cornerDotsType === cornerDotShape.value
                      ? 'contrast'
                      : 'secondary'
                  "
                  :label="cornerDotShape.label"
                  :aria-label="`Set corner dots shape to ${cornerDotShape.label}`"
                  @click="setCornerDotsShape(cornerDotShape.value)"
                />
              </div>
            </div>

            <div class="subsection">
              <div class="subsection-title">
                <span>Color</span>
              </div>

              <UiSelectButton
                v-model="cornerDotsColorType"
                :options="cornerDotsColorTypeOptions"
                option-label="label"
                option-value="value"
                @update:model-value="setCornerDotsColorType($event as 'solid' | 'gradient')"
              />

              <div
                v-if="cornerDotsColorType === 'solid'"
                class="color-picker-container"
              >
                <UiColorPicker
                  id="corner-dots-color"
                  v-model="cornerDotsColor"
                  fluid
                  format="hex"
                  @update:model-value="setCornerDotsColor"
                />

                <UiInputText
                  name="corner-dots-color"
                  readonly
                  :value="`#${cornerDotsColor}`"
                />
              </div>

              <div
                v-if="cornerDotsColorType === 'gradient'"
                class="gradient-controls"
              >
                <div class="angle">
                  <span class="title">Angle: </span>

                  <UiInputNumber
                    v-model="cornerDotsGradient.rotation"
                    :min="0"
                    :max="360"
                    show-buttons
                    @update:model-value="setCornerDotsGradientAngle($event as number)"
                  />
                </div>

                <div class="gradient-stops">
                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="corner-dots-color-gradient-0"
                        v-model="cornerDotsGradient.stops[0]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setCornerDotsGradientStopColor($event, 0)
                        "
                      />
                    </div>

                    <UiInputText
                      name="corner-dots-color-gradient-0"
                      readonly
                      :value="`#${cornerDotsGradient.stops[0]!.color}`"
                    />
                  </div>

                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="corner-dots-color-gradient-1"
                        v-model="cornerDotsGradient.stops[1]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setCornerDotsGradientStopColor($event, 1)
                        "
                      />
                    </div>

                    <UiInputText
                      name="corner-dots-color-gradient-1"
                      readonly
                      :value="`#${cornerDotsGradient.stops[1]!.color}`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section-container">
            <span class="title"> Corner Squares </span>

            <div class="subsection">
              <div class="subsection-title">
                <span>Shape</span>
              </div>

              <div class="subsection-items">
                <UiButton
                  v-for="cornerSquareShape in cornerSquaresShapes"
                  :key="cornerSquareShape.value"
                  type="button"
                  :severity="
                    cornerSquaresType === cornerSquareShape.value
                      ? 'contrast'
                      : 'secondary'
                  "
                  :label="cornerSquareShape.label"
                  :aria-label="`Set corner squares shape to ${cornerSquareShape.label}`"
                  @click="setCornerSquaresShape(cornerSquareShape.value)"
                />
              </div>
            </div>

            <div class="subsection">
              <div class="subsection-title">
                <span>Color</span>
              </div>

              <UiSelectButton
                v-model="cornerSquaresColorType"
                :options="cornerSquaresColorTypeOptions"
                option-label="label"
                option-value="value"
                @update:model-value="setCornerSquaresColorType($event as 'solid' | 'gradient')"
              />

              <div
                v-if="cornerSquaresColorType === 'solid'"
                class="color-picker-container"
              >
                <UiColorPicker
                  id="corner-squares-color"
                  v-model="cornerSquaresColor"
                  fluid
                  format="hex"
                  @update:model-value="setCornerSquaresColor"
                />

                <UiInputText
                  name="corner-squares-color"
                  readonly
                  :value="`#${cornerSquaresColor}`"
                />
              </div>

              <div
                v-if="cornerSquaresColorType === 'gradient'"
                class="gradient-controls"
              >
                <div class="angle">
                  <span class="title">Angle: </span>

                  <UiInputNumber
                    v-model="cornerSquaresGradient.rotation"
                    :min="0"
                    :max="360"
                    show-buttons
                    @update:model-value="setCornerSquaresGradientAngle($event as number)"
                  />
                </div>

                <div class="gradient-stops">
                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="corner-squares-color-gradient-0"
                        v-model="cornerSquaresGradient.stops[0]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setCornerSquaresGradientStopColor($event, 0)
                        "
                      />
                    </div>

                    <UiInputText
                      name="corner-squares-color-gradient-0"
                      readonly
                      :value="`#${cornerSquaresGradient.stops[0]!.color}`"
                    />
                  </div>

                  <div class="gradient-stop">
                    <div class="color-picker-container">
                      <UiColorPicker
                        id="corner-squares-color-gradient-1"
                        v-model="cornerSquaresGradient.stops[1]!.color"
                        fluid
                        format="hex"
                        @update:model-value="
                          setCornerSquaresGradientStopColor($event, 1)
                        "
                      />
                    </div>

                    <UiInputText
                      name="corner-squares-color-gradient-1"
                      readonly
                      :value="`#${cornerSquaresGradient.stops[1]!.color}`"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #panel-logo>
          <div
            v-if="!image"
            class="file-upload-area"
            @click="imageInput?.click()"
          >
            <input
              id="image"
              ref="imageInput"
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
              @change="setImage"
            />

            <Icon
              name="popli:add-photo-alternate-outline-rounded"
              size="2rem"
            />

            <span class="upload-text"> Click to upload a logo </span>

            <span class="upload-description">
              Upload a logo to be displayed in the center of the QR Code. PNG,
              JPEG, JPG, WEBP, SVG are supported up to 5MB.
            </span>
          </div>

          <div v-if="imageUrl" class="file-preview">
            <div class="preview-content">
              <div class="preview-info">
                <NuxtImg
                  :src="imageUrl"
                  alt="Logo image"
                  width="50"
                  height="50"
                  fit="contain"
                />

                <div class="info-text">
                  <span class="title"> Logo uploaded </span>

                  <span class="description"> Ready to use in QR Code </span>
                </div>
              </div>

              <UiButton
                class="naked"
                type="button"
                severity="danger"
                icon="popli:times-outline"
                aria-label="Remove logo"
                @click="removeImage"
              />
            </div>

            <div class="control-section">
              <span class="title">Image Size: {{ imageSizePercentage }}%</span>

              <UiSlider
                id="image-size"
                v-model="imageSize"
                fluid
                :min="0"
                :max="0.4"
                :step="0.01"
                @update:model-value="setImageSize($event as number)"
              />
            </div>
          </div>
        </template>
      </UiTabs>

      <div class="preview">
        <span class="title">Preview</span>

        <div class="container">
          <div
            id="qr-code-advanced-canvas"
            :style="`width: ${qrCodeOptions.width}px; height: ${qrCodeOptions.height}px;`"
          />

          <span class="caption-title"> Sample QR Code Preview </span>

          <span class="caption-description">
            This QR Code is generated with sample content for preview purposes.
            <br />
            The actual content will be set when you generate the QR Code.
          </span>
        </div>
      </div>
    </div>

    <div class="submit">
      <UiMessage severity="info">
        Use colors that are visible on the background to ensure the QR Code is
        readable.
      </UiMessage>

      <UiButton
        severity="contrast"
        label="Save QR Code"
        fluid
        aria-label="Save QR Code"
        @click="saveQRCode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import debounce from 'lodash/debounce';
import QRCodeStyling, {
  type CornerDotType,
  type CornerSquareType,
  type DotType,
  type Options,
} from 'qr-code-styling';

const qrCodeStore = useQrCodeStore();
const uiDynamicDialog = useUiDynamicDialog();

const props = defineProps<{
  qrCodeOptions: Options;
}>();

const backgroundBorderRadius = ref<number>(0);
const backgroundColor = ref<string>('ffffff');
const backgroundColorType = ref<'solid' | 'gradient'>('solid');
const backgroundColorTypeOptions = ref([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
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
  | 'classic'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'darkMode'
  | 'ocean'
  | 'forest'
  | 'sunset'
  | null
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
const cornerDotsColor = ref<string>('000000');
const cornerDotsColorType = ref<'solid' | 'gradient'>('solid');
const cornerDotsColorTypeOptions = ref([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const cornerDotsGradient = ref<{
  rotation: number;
  stops: { color: string; offset: number }[];
}>({
  rotation: 0,
  stops: [
    { color: 'ffffff', offset: 0 },
    { color: '000000', offset: 100 },
  ],
});
const cornerDotsType = ref<CornerDotType>('square');
const cornerSquaresColor = ref<string>('000000');
const cornerSquaresColorType = ref<'solid' | 'gradient'>('solid');
const cornerSquaresColorTypeOptions = ref([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const cornerSquaresGradient = ref<{
  rotation: number;
  stops: { color: string; offset: number }[];
}>({
  rotation: 0,
  stops: [
    { color: 'ffffff', offset: 0 },
    { color: '000000', offset: 100 },
  ],
});
const cornerSquaresType = ref<CornerSquareType>('square');
const dotsColor = ref<string>('000000');
const dotsColorType = ref<'solid' | 'gradient'>('solid');
const dotsColorTypeOptions = ref([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
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
const dotsType = ref<DotType>('square');
const foregroundColorType = ref<'solid' | 'gradient'>('solid');
const foregroundColorTypeOptions = ref([
  { label: 'Solid', value: 'solid' },
  { label: 'Gradient', value: 'gradient' },
]);
const foregroundColor = ref<string>('000000');
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
const qrCodeOptionsRef = ref<Options>({});
const image = ref<File | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const imageSize = ref<number>(0.4);
const imageUrl = ref<string | null>(null);
const shape = ref<'circle' | 'square'>('square');
const shapeOptions = ref<
  { label: string; value: 'circle' | 'square'; icon: string }[]
>([
  { label: 'Circle', value: 'circle', icon: 'popli:circle' },
  { label: 'Square', value: 'square', icon: 'popli:square' },
]);
const tab = ref<'colors' | 'shapes' | 'logo'>('colors');
const width = ref<number>(128);

const data = computed(() => qrCodeStore.getData);
const imageSizePercentage = computed(() =>
  Math.floor((imageSize.value * 100) / 0.4),
);

onMounted(() => {
  qrCodeOptionsRef.value = props.qrCodeOptions;
  qrCode.value = new QRCodeStyling(qrCodeOptionsRef.value);

  if (data.value) {
    backgroundBorderRadius.value = data.value.backgroundBorderRadius;
    backgroundColor.value = data.value.backgroundColor;
    backgroundColorType.value = data.value.backgroundColorType;
    backgroundGradient.value = data.value.backgroundGradient;
    colorPreset.value = data.value.colorPreset;
    cornerDotsColor.value = data.value.cornerDotsColor;
    cornerDotsColorType.value = data.value.cornerDotsColorType;
    cornerDotsGradient.value = data.value.cornerDotsGradient;
    cornerDotsType.value = data.value.cornerDotsType;
    cornerSquaresColor.value = data.value.cornerSquaresColor;
    cornerSquaresColorType.value = data.value.cornerSquaresColorType;
    cornerSquaresGradient.value = data.value.cornerSquaresGradient;
    cornerSquaresType.value = data.value.cornerSquaresType;
    dotsColor.value = data.value.dotsColor;
    dotsColorType.value = data.value.dotsColorType;
    dotsGradient.value = data.value.dotsGradient;
    dotsType.value = data.value.dotsType;
    foregroundColor.value = data.value.foregroundColor;
    foregroundColorType.value = data.value.foregroundColorType;
    foregroundGradient.value = data.value.foregroundGradient;
    image.value = data.value.image;
    imageSize.value = data.value.imageSize;
    imageUrl.value = data.value.imageUrl;
    width.value = data.value.width;
  }

  setTimeout(() => {
    qrCode.value?.append(
      document.getElementById('qr-code-advanced-canvas') as HTMLElement,
    );
  }, 300);
});

watch(
  qrCodeOptionsRef,
  async (options) => {
    const canvas = document.getElementById(
      'qr-code-advanced-canvas',
    ) as HTMLElement;

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
  { deep: true },
);

const setColorPreset = (preset: string) => {
  switch (preset) {
    case 'classic':
      qrCodeOptionsRef.value.dotsOptions!.color = '#000000';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#000000';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#000000';
      qrCodeOptionsRef.value.backgroundOptions!.color = 'white';
      colorPreset.value = 'classic';
      break;

    case 'blue':
      qrCodeOptionsRef.value.dotsOptions!.color = '#155dfc';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#155dfc';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#155dfc';
      qrCodeOptionsRef.value.backgroundOptions!.color = 'white';
      colorPreset.value = 'blue';
      break;

    case 'purple':
      qrCodeOptionsRef.value.dotsOptions!.color = '#9810fa';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#9810fa';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#9810fa';
      qrCodeOptionsRef.value.backgroundOptions!.color = 'white';
      colorPreset.value = 'purple';
      break;

    case 'pink':
      qrCodeOptionsRef.value.dotsOptions!.color = '#e60076';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#e60076';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#e60076';
      qrCodeOptionsRef.value.backgroundOptions!.color = 'white';
      colorPreset.value = 'pink';
      break;

    case 'darkMode':
      qrCodeOptionsRef.value.dotsOptions!.color = '#ffffff';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#ffffff';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#ffffff';
      qrCodeOptionsRef.value.backgroundOptions!.color = '#0a0a0a';
      colorPreset.value = 'darkMode';
      break;

    case 'ocean':
      qrCodeOptionsRef.value.dotsOptions!.color = '#2b7fff';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#2b7fff';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#2b7fff';
      qrCodeOptionsRef.value.backgroundOptions!.color = '#ecfeff';
      colorPreset.value = 'ocean';
      break;

    case 'forest':
      qrCodeOptionsRef.value.dotsOptions!.color = '#00a63e';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#00a63e';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#00a63e';
      qrCodeOptionsRef.value.backgroundOptions!.color = '#ecfdf5';
      colorPreset.value = 'forest';
      break;

    case 'sunset':
      qrCodeOptionsRef.value.dotsOptions!.color = '#ca3500';
      qrCodeOptionsRef.value.cornersSquareOptions!.color = '#ca3500';
      qrCodeOptionsRef.value.cornersDotOptions!.color = '#ca3500';
      qrCodeOptionsRef.value.backgroundOptions!.color = '#fef2f2';
      colorPreset.value = 'sunset';
      break;

    default:
      colorPreset.value = null;
      break;
  }
};

const setBackgroundColorType = () => {
  if (backgroundColorType.value === 'solid') {
    qrCodeOptionsRef.value.backgroundOptions!.color = `#${backgroundColor.value}`;
    qrCodeOptionsRef.value.backgroundOptions!.gradient = undefined;
  } else {
    qrCodeOptionsRef.value.backgroundOptions!.gradient = {
      type: 'linear',
      rotation: (backgroundGradient.value.rotation / 180) * Math.PI,
      colorStops: backgroundGradient.value.stops.map((stop) => ({
        offset: stop.offset,
        color: `#${stop.color}`,
      })),
    };
    qrCodeOptionsRef.value.backgroundOptions!.color = undefined;
  }
};

const setBackgroundColor = (value: string) => {
  qrCodeOptionsRef.value.backgroundOptions!.color = value;
  qrCodeOptionsRef.value.backgroundOptions!.gradient = undefined;
};

const setBackgroundGradientAngle = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.backgroundOptions!.gradient!.rotation =
    ((value as number) / 180) * Math.PI;
}, 100);

const setBackgroundGradientStopColor = debounce(
  (value: string, index: number) => {
    backgroundGradient.value.stops[index]!.color = value;
    qrCodeOptionsRef.value.backgroundOptions!.gradient!.colorStops[index]!.color =
      value;
  },
  100,
);

const setForegroundColorType = () => {
  if (foregroundColorType.value === 'solid') {
    qrCodeOptionsRef.value.dotsOptions!.color = `#${foregroundColor.value}`;
    qrCodeOptionsRef.value.dotsOptions!.gradient = undefined;
  } else {
    qrCodeOptionsRef.value.dotsOptions!.gradient = {
      type: 'linear',
      rotation: (foregroundGradient.value.rotation / 180) * Math.PI,
      colorStops: foregroundGradient.value.stops.map((stop) => ({
        offset: stop.offset,
        color: `#${stop.color}`,
      })),
    };
    qrCodeOptionsRef.value.dotsOptions!.color = undefined;
  }
};

const setForegroundColor = (value: string) => {
  qrCodeOptionsRef.value.dotsOptions!.color = value;
  qrCodeOptionsRef.value.dotsOptions!.gradient = undefined;
};

const setForegroundGradientAngle = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.dotsOptions!.gradient!.rotation =
    ((value as number) / 180) * Math.PI;
}, 100);

const setForegroundGradientStopColor = debounce(
  (value: string, index: number) => {
    foregroundGradient.value.stops[index]!.color = value;
    qrCodeOptionsRef.value.dotsOptions!.gradient!.colorStops[index]!.color = value;
  },
  100,
);

const setShape = (shape: 'circle' | 'square') => {
  qrCodeOptionsRef.value.shape = shape;
};

const setSize = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.width = value as number;
  qrCodeOptionsRef.value.height = value as number;
}, 300);

const setBackgroundBorderRadius = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.backgroundOptions!.round = value as number;
}, 300);

const setDotsShape = (shape: DotType) => {
  qrCodeOptionsRef.value.dotsOptions!.type = shape;
  dotsType.value = shape;
};

const setCornerDotsShape = (shape: CornerDotType) => {
  qrCodeOptionsRef.value.cornersDotOptions!.type = shape;
  cornerDotsType.value = shape;
};

const setCornerSquaresShape = (shape: CornerSquareType) => {
  qrCodeOptionsRef.value.cornersSquareOptions!.type = shape;
  cornerSquaresType.value = shape;
};

const setDotsColorType = (value: 'solid' | 'gradient') => {
  if (value === 'solid') {
    qrCodeOptionsRef.value.dotsOptions!.gradient = undefined;
    qrCodeOptionsRef.value.dotsOptions!.color = '#000000';
  } else {
    qrCodeOptionsRef.value.dotsOptions!.color = undefined;
    qrCodeOptionsRef.value.dotsOptions!.gradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#ffffff' },
        { offset: 100, color: '#000000' },
      ],
    };
  }
};

const setDotsColor = (value: string) => {
  qrCodeOptionsRef.value.dotsOptions!.color = value;
};

const setDotsGradientAngle = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.dotsOptions!.gradient!.rotation =
    ((value as number) / 180) * Math.PI;
}, 100);

const setDotsGradientStopColor = debounce((value: string, index: number) => {
  qrCodeOptionsRef.value.dotsOptions!.gradient!.colorStops[index]!.color = value;
}, 100);

const setCornerDotsColorType = (value: 'solid' | 'gradient') => {
  if (value === 'solid') {
    qrCodeOptionsRef.value.cornersDotOptions!.gradient = undefined;
    qrCodeOptionsRef.value.cornersDotOptions!.color = '#000000';
  } else {
    qrCodeOptionsRef.value.cornersDotOptions!.color = undefined;
    qrCodeOptionsRef.value.cornersDotOptions!.gradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#ffffff' },
        { offset: 100, color: '#000000' },
      ],
    };
  }
};

const setCornerDotsColor = (value: string) => {
  qrCodeOptionsRef.value.cornersDotOptions!.color = value;
};

const setCornerDotsGradientAngle = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.cornersDotOptions!.gradient!.rotation =
    ((value as number) / 180) * Math.PI;
}, 100);

const setCornerDotsGradientStopColor = debounce(
  (value: string, index: number) => {
    cornerDotsGradient.value.stops[index]!.color = value;
    qrCodeOptionsRef.value.cornersDotOptions!.gradient!.colorStops[index]!.color =
      value;
  },
  100,
);

const setCornerSquaresColorType = (value: 'solid' | 'gradient') => {
  if (value === 'solid') {
    qrCodeOptionsRef.value.cornersSquareOptions!.gradient = undefined;
    qrCodeOptionsRef.value.cornersSquareOptions!.color = '#000000';
  } else {
    qrCodeOptionsRef.value.cornersSquareOptions!.color = undefined;
    qrCodeOptionsRef.value.cornersSquareOptions!.gradient = {
      type: 'linear',
      rotation: 0,
      colorStops: [
        { offset: 0, color: '#ffffff' },
        { offset: 100, color: '#000000' },
      ],
    };
  }
};

const setCornerSquaresColor = (value: string) => {
  qrCodeOptionsRef.value.cornersSquareOptions!.color = value;
};

const setCornerSquaresGradientAngle = debounce((value: number | number[]) => {
  qrCodeOptionsRef.value.cornersSquareOptions!.gradient!.rotation =
    ((value as number) / 180) * Math.PI;
}, 100);

const setCornerSquaresGradientStopColor = debounce(
  (value: string, index: number) => {
    cornerSquaresGradient.value.stops[index]!.color = value;
    qrCodeOptionsRef.value.cornersSquareOptions!.gradient!.colorStops[
      index
    ]!.color = value;
  },
  100,
);

const setImage = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];

  if (file) {
    image.value = file;

    imageUrl.value = URL.createObjectURL(file);
    qrCodeOptionsRef.value.image = imageUrl.value;
  }
};

const removeImage = () => {
  image.value = null;
  imageUrl.value = null;
  qrCodeOptionsRef.value.image = undefined;
};

const setImageSize = (value: number | number[]) => {
  qrCodeOptionsRef.value.imageOptions!.imageSize = value as number;
};

const saveQRCode = () => {
  qrCodeStore.setData({
    backgroundBorderRadius: backgroundBorderRadius.value,
    backgroundColor: backgroundColor.value,
    backgroundColorType: backgroundColorType.value,
    backgroundGradient: backgroundGradient.value,
    colorPreset: colorPreset.value,
    cornerDotsColor: cornerDotsColor.value,
    cornerDotsColorType: cornerDotsColorType.value,
    cornerDotsGradient: cornerDotsGradient.value,
    cornerDotsType: cornerDotsType.value,
    cornerSquaresColor: cornerSquaresColor.value,
    cornerSquaresColorType: cornerSquaresColorType.value,
    cornerSquaresGradient: cornerSquaresGradient.value,
    cornerSquaresType: cornerSquaresType.value,
    dotsColor: dotsColor.value,
    dotsColorType: dotsColorType.value,
    dotsGradient: dotsGradient.value,
    dotsType: dotsType.value,
    foregroundColor: foregroundColor.value,
    foregroundColorType: foregroundColorType.value,
    foregroundGradient: foregroundGradient.value,
    image: image.value,
    imageSize: imageSize.value,
    imageUrl: imageUrl.value,
    width: width.value,
  });

  return uiDynamicDialog.close();
};
</script>

<style lang="scss" scoped>
.qr-code-advanced-configuration {
  position: relative;
  display: flex;
  flex-direction: column;

  .content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-height: 40rem;
    overflow-y: auto;
    padding-bottom: 2rem;

    /* Hide scrollbars in configuration dialog */
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    hr {
      border: none;
      border-top: 1px solid
        color-mix(in oklab, var(--neutral-400) 20%, transparent);
      margin: 0;
    }

    :deep(.ui-tabs) {
      .tabs-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;

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
              color: var(--neutral-400);
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

        .section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            span {
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--neutral-400);
            }

            &.separated {
              justify-content: space-between;

              span {
                &:last-child {
                  color: var(--primary-400);
                }
              }
            }
          }

          .section-items {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.5rem;
            padding: 0 0.25rem;

            .ui-button {
              border-radius: 0.25rem;
              height: 3rem;
              flex: 1;
              border: none;

              &.classic {
                background-color: #000000;
              }

              &.blue {
                background-color: oklch(54.6% 0.245 262.881);
              }

              &.purple {
                background-color: oklch(59.1% 0.293 322.896);
              }

              &.pink {
                background-color: oklch(51.8% 0.253 323.949);
              }

              &.darkMode {
                background-color: oklch(20.5% 0 0);
              }

              &.ocean {
                background-color: oklch(62.3% 0.214 259.815);
              }

              &.forest {
                background-color: oklch(69.6% 0.17 162.48);
              }

              &.sunset {
                background-color: oklch(55.5% 0.163 48.998);
              }

              &.active {
                outline: 1px solid var(--primary-400);
              }
            }
          }

          .radio-group {
            display: flex;
            flex-direction: row;
            gap: 1rem;
          }
        }

        .color-picker-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.5rem;
        }

        .section-container {
          border-radius: 0.25rem;
          border: 1px solid
            color-mix(in oklab, var(--neutral-400) 20%, transparent);
          padding: 1rem;
          background-color: transparent;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .title {
            font-size: 1rem;
            font-weight: 500;
            color: var(--neutral-100);
          }

          .subsection {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .subsection-title {
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--neutral-400);
            }

            .subsection-items {
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              gap: 0.5rem;
            }

            .radio-group {
              display: flex;
              flex-direction: row;
              gap: 1rem;
            }
          }
        }

        .file-upload-area {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background-color: transparent;
          border-radius: 0.25rem;
          border: 1px solid
            color-mix(in oklab, var(--neutral-400) 20%, transparent);
          cursor: pointer;

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
            color: var(--neutral-100);
          }

          .upload-description {
            text-align: center;
            max-width: 20rem;
            font-size: 0.75rem;
            font-weight: 400;
            color: var(--neutral-400);
          }
        }

        .file-preview {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .preview-content {
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
                  color: var(--neutral-100);
                }

                .description {
                  font-size: 0.75rem;
                  font-weight: 400;
                  color: var(--neutral-400);
                }
              }
            }
          }

          .control-section {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .title {
              font-size: 0.75rem;
              font-weight: 400;
              color: var(--neutral-400);
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
        color: var(--neutral-100);
      }

      .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 2rem;
        background-color: var(--background-secondary);
        border-radius: 0.25rem;
        border: 2px dashed
          color-mix(in oklab, var(--neutral-400) 20%, transparent);

        #qr-code-advanced-canvas {
          overflow: hidden;
          height: fit-content;
          width: fit-content;
          line-height: 1;
        }

        .caption-title {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--neutral-400);
        }

        .caption-description {
          font-size: 0.75rem;
          font-weight: 400;
          color: var(--neutral-400);
          text-align: center;
        }
      }
    }
  }

  .submit {
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--background-primary);

    :deep(.ui-message) {
      width: 60%;
      font-size: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .qr-code-advanced-configuration {
    max-height: 60lvh;
  }
}
</style>
