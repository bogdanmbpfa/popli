import { ApiProperty } from '@nestjs/swagger';

export class UrlShortUrlCodeDTO {
  @ApiProperty({
    type: String,
    description: 'The short code',
    example: '12345678',
  })
  shortCode: string;
}
