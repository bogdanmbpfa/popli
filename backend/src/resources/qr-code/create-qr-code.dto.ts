import { ApiProperty } from '@nestjs/swagger';
import { plainToClass, Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { FileDTO } from '../common';
import { EQRCodeDataType } from './qr-code-data-type.enum';
import { QrCodeOptionsDTO } from './qr-code-options.dto';

export class CreateQrCodeDTO {
  @ApiProperty({
    type: String,
    description: 'The title of the QR code',
    example: 'QR Code',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    type: String,
    description: 'The type of the QR code',
    example: EQRCodeDataType.URL,
  })
  @IsEnum(EQRCodeDataType)
  type: EQRCodeDataType;

  @ApiProperty({
    type: () => FileDTO,
    description: 'The image of the QR code',
  })
  @IsOptional()
  @Type(() => FileDTO)
  @ValidateNested({ each: true })
  image?: FileDTO;

  @ApiProperty({
    type: () => QrCodeOptionsDTO,
    description: 'The options of the QR code',
  })
  @Transform(({ value }) =>
    value ? plainToClass(QrCodeOptionsDTO, JSON.parse(value)) : undefined,
  )
  @Type(() => QrCodeOptionsDTO)
  @ValidateNested()
  options: QrCodeOptionsDTO;
}
