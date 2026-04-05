import { ApiProperty } from '@nestjs/swagger';

export class UrlLinkCountryClicksDTO {
  @ApiProperty({
    type: String,
    description: 'The country of the clicks',
    example: 'United States',
  })
  country: string;

  @ApiProperty({
    type: String,
    description: 'The ISO country code of the clicks',
    example: 'US',
  })
  countryCode: string;

  @ApiProperty({
    type: Number,
    description: 'The number of clicks',
    example: 100,
  })
  clicks: number;
}
