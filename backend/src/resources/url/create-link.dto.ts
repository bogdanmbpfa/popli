import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsUrl,
  ValidateIf,
  MinLength,
  MaxLength,
  ValidateNested,
  IsOptional,
  IsArray,
  IsHexColor,
  IsNumber,
  IsUUID,
} from 'class-validator';

import { FileDTO } from '../common';
import { ELinkPlatform } from './link-platform.enum';
import { ELinkType } from './link-type.enum';

export class CreateLinkDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({
    type: String,
    description: 'The type of the link',
    example: ELinkType.PRIMARY,
  })
  @IsEnum(ELinkType)
  type: ELinkType;

  @ApiProperty({
    type: String,
    description: 'The platform of the link',
    example: ELinkPlatform.X,
  })
  @ValidateIf((_, value) => value === ELinkType.PRIMARY)
  @IsEnum(ELinkPlatform)
  platform: ELinkPlatform;

  @ApiProperty({
    type: String,
    description: 'The URL of the link',
    example: 'https://example.com/link',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    type: String,
    description: 'The title of the link',
    example: 'My Link',
  })
  @ValidateIf((object) => object.type === ELinkType.SECONDARY)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    type: String,
    description: 'The background image of the link',
    example: 'https://example.com/background-image.webp',
  })
  @IsOptional()
  @Type(() => FileDTO)
  @ValidateNested()
  backgroundImage?: FileDTO;

  @ApiProperty({
    type: [String],
    description: 'The title colors of the link',
    example: ['#000000', '#FFFFFF'],
  })
  @IsOptional()
  @IsArray()
  @IsHexColor({ each: true })
  titleColors?: string[];

  @ApiProperty({
    type: [String],
    description: 'The background colors of the link',
    example: ['#000000', '#FFFFFF'],
  })
  @IsOptional()
  @IsArray()
  @IsHexColor({ each: true })
  backgroundColors?: string[];

  @ApiProperty({
    type: Number,
    description: 'The position of the link',
    example: 0,
  })
  @Type(() => Number)
  @IsNumber()
  position: number;
}
