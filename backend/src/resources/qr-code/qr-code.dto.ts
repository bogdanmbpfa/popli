import { ApiProperty } from '@nestjs/swagger';

import { EQRCodeDataType } from './qr-code-data-type.enum';

export class QrCodeDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the QR code',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The title of the QR code',
    example: 'My QR Code',
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'The image URL of the QR code',
    example: 'https://example.com/image.webp',
  })
  imageUrl: string | null;

  @ApiProperty({
    type: String,
    description: 'The data type of the QR code',
    example: EQRCodeDataType.TEXT,
  })
  dataType: EQRCodeDataType;

  @ApiProperty({
    type: Object,
    description: 'The options of the QR code',
  })
  options: Record<string, unknown>;

  @ApiProperty({
    type: Number,
    description: 'The total number of scans of the QR code',
    example: 100,
  })
  totalScans: number;

  @ApiProperty({
    type: Date,
    description: 'The date and time the QR code was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date and time the QR code was updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    type: Date,
    description: 'The date and time the QR code was deleted',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true,
  })
  deletedAt: Date | null;
}
