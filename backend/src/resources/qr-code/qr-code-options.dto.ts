import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

enum EQRCodeShape {
  SQUARE = 'square',
  CIRCLE = 'circle',
}

class ImageOptionsDTO {
  @ApiProperty({
    type: Boolean,
    description: 'Whether to save the image as a blob',
    example: true,
  })
  @IsBoolean()
  saveAsBlob: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether to hide the background dots',
    example: true,
  })
  @IsBoolean()
  hideBackgroundDots: boolean;

  @ApiProperty({
    type: Number,
    description: 'The size of the image',
    example: 0.4,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  imageSize: number;

  @ApiProperty({
    type: String,
    description: 'The cross origin of the image',
    example: 'anonymous',
  })
  @IsString()
  crossOrigin: string;

  @ApiProperty({
    type: Number,
    description: 'The margin of the image',
    example: 6,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  margin: number;
}

class ColorStopDTO {
  @ApiProperty({
    type: String,
    description: 'The color of the color stop',
    example: '#000000',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    type: Number,
    description: 'The offset of the color stop',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  offset: number;
}

class GradientDTO {
  @ApiProperty({
    type: String,
    description: 'The type of the gradient',
    example: 'linear',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['linear', 'radial'])
  type: 'linear' | 'radial';

  @ApiProperty({
    type: Number,
    description: 'The rotation of the gradient',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  rotation: number;

  @ApiProperty({
    type: () => ColorStopDTO,
    isArray: true,
    description: 'The color stops of the gradient',
  })
  @Type(() => ColorStopDTO)
  @ValidateNested({ each: true })
  colorStops: ColorStopDTO[];
}

class DotsOptionsDTO {
  @ApiProperty({
    type: String,
    description: 'The color of the dots',
    example: '#000000',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    type: String,
    description: 'The type of the dots',
    example: 'square',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'square',
    'rounded',
    'classy',
    'classy-rounded',
    'dots',
    'extra-rounded',
  ])
  type:
    | 'square'
    | 'rounded'
    | 'classy'
    | 'classy-rounded'
    | 'dots'
    | 'extra-rounded';

  @ApiProperty({
    type: () => GradientDTO,
    description: 'The gradient of the dots',
  })
  @IsOptional()
  @Type(() => GradientDTO)
  @ValidateNested({ each: true })
  gradient?: GradientDTO;
}

class CornerSquareOptionsDTO {
  @ApiProperty({
    type: String,
    description: 'The color of the corner squares',
    example: '#000000',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    type: String,
    description: 'The type of the corner squares',
    example: 'square',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'square',
    'rounded',
    'classy',
    'classy-rounded',
    'dots',
    'extra-rounded',
    'dot',
  ])
  type:
    | 'square'
    | 'rounded'
    | 'classy'
    | 'classy-rounded'
    | 'dots'
    | 'extra-rounded'
    | 'dot';

  @ApiProperty({
    type: () => GradientDTO,
    description: 'The gradient of the corner squares',
  })
  @IsOptional()
  @Type(() => GradientDTO)
  @ValidateNested({ each: true })
  gradient?: GradientDTO;
}

class CornerDotOptionsDTO {
  @ApiProperty({
    type: String,
    description: 'The color of the corner dots',
    example: '#000000',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    type: String,
    description: 'The type of the corner dots',
    example: 'square',
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum([
    'square',
    'rounded',
    'classy',
    'classy-rounded',
    'dots',
    'extra-rounded',
    'dot',
  ])
  type:
    | 'square'
    | 'rounded'
    | 'classy'
    | 'classy-rounded'
    | 'dots'
    | 'extra-rounded'
    | 'dot';

  @ApiProperty({
    type: () => GradientDTO,
    description: 'The gradient of the corner dots',
  })
  @IsOptional()
  @Type(() => GradientDTO)
  @ValidateNested({ each: true })
  gradient?: GradientDTO;
}

class BackgroundOptionsDTO {
  @ApiProperty({
    type: Number,
    description: 'The round of the background',
    example: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  round: number;

  @ApiProperty({
    type: String,
    description: 'The color of the background',
    example: '#000000',
  })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({
    type: () => GradientDTO,
    description: 'The gradient of the background',
  })
  @IsOptional()
  @Type(() => GradientDTO)
  @ValidateNested({ each: true })
  gradient?: GradientDTO;
}

export class QrCodeOptionsDTO {
  @ApiProperty({
    enum: EQRCodeShape,
    description: 'The shape of the QR code',
    example: EQRCodeShape.SQUARE,
  })
  @IsEnum(EQRCodeShape)
  shape: EQRCodeShape;

  @ApiProperty({
    type: String,
    description: 'The type of the QR code',
    example: 'url',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    type: Number,
    description: 'The width of the QR code',
    example: 128,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(128)
  @Max(512)
  width: number;

  @ApiProperty({
    type: Number,
    description: 'The height of the QR code',
    example: 128,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(128)
  @Max(512)
  height: number;

  @ApiProperty({
    type: Number,
    description: 'The margin of the QR code',
    example: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(10)
  margin: number;

  @ApiProperty({
    type: String,
    description: 'The data of the QR code',
    example: 'https://example.com',
  })
  @IsString()
  @IsNotEmpty()
  data: string;

  @ApiProperty({
    type: String,
    description: 'The image URL of the QR code',
    example: 'https://example.com/image.webp',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    type: Object,
    description: 'The options of the QR code',
  })
  @IsOptional()
  @IsObject()
  qrOptions?: Record<string, unknown>;

  @ApiProperty({
    type: () => ImageOptionsDTO,
    description: 'The options of the image',
  })
  @IsOptional()
  @Type(() => ImageOptionsDTO)
  @ValidateNested()
  imageOptions?: ImageOptionsDTO;

  @ApiProperty({
    type: () => DotsOptionsDTO,
    description: 'The options of the dots',
  })
  @IsOptional()
  @Type(() => DotsOptionsDTO)
  @ValidateNested()
  dotsOptions?: DotsOptionsDTO;

  @ApiProperty({
    type: () => CornerSquareOptionsDTO,
    description: 'The options of the corner squares',
  })
  @IsOptional()
  @Type(() => CornerSquareOptionsDTO)
  @ValidateNested()
  cornersSquareOptions?: CornerSquareOptionsDTO;

  @ApiProperty({
    type: () => CornerDotOptionsDTO,
    description: 'The options of the corner dots',
  })
  @IsOptional()
  @Type(() => CornerDotOptionsDTO)
  @ValidateNested()
  cornersDotOptions?: CornerDotOptionsDTO;

  @ApiProperty({
    type: () => BackgroundOptionsDTO,
    description: 'The options of the background',
  })
  @IsOptional()
  @Type(() => BackgroundOptionsDTO)
  @ValidateNested()
  backgroundOptions?: BackgroundOptionsDTO;
}
