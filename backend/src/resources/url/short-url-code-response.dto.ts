import { ApiProperty } from '@nestjs/swagger';

export class UrlShortUrlCodeResponseDTO {
  @ApiProperty({
    type: String,
    description: 'The URL',
    example: 'https://example.com/long-url',
  })
  url: string;
}
