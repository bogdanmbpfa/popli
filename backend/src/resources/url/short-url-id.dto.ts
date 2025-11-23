import { ApiProperty } from '@nestjs/swagger';

export class UrlShortUrlIdDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the short URL',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;
}
