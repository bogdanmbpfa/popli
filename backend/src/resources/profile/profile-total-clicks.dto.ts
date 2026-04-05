import { ApiProperty } from '@nestjs/swagger';

import { ELinkPlatform } from '../url';
import { EProfileClickType } from './profile-click-type.enum';

class ProfileCountryClicksDTO {
  @ApiProperty({
    type: String,
    description: 'Country name',
    example: 'Romania',
  })
  country: string;

  @ApiProperty({
    type: String,
    description: 'ISO country code',
    example: 'RO',
  })
  countryCode: string;

  @ApiProperty({
    type: Number,
    description: 'Total clicks from this country',
    example: 12,
  })
  clicks: number;
}

class ProfileTypeClicksDTO {
  @ApiProperty({
    enum: [
      ...Object.values(ELinkPlatform),
      ...Object.values(EProfileClickType),
    ],
    description: 'Click type key',
    example: 'PROFILE_ACCESS',
  })
  type: ELinkPlatform | EProfileClickType;

  @ApiProperty({
    type: Number,
    description: 'Total clicks for this type',
    example: 25,
  })
  clicks: number;
}

export class ProfileTotalClicksDTO {
  @ApiProperty({
    type: Number,
    description: 'Total number of clicks',
    example: 120,
  })
  totalClicks: number;

  @ApiProperty({
    type: () => ProfileCountryClicksDTO,
    isArray: true,
    description: 'Clicks split by country',
  })
  countryClicks: ProfileCountryClicksDTO[];

  @ApiProperty({
    type: () => ProfileTypeClicksDTO,
    isArray: true,
    description: 'Clicks split by type',
  })
  typeClicks: ProfileTypeClicksDTO[];
}
