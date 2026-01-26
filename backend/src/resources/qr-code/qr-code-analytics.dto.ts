import { ApiProperty } from '@nestjs/swagger';

export class QrCodeCountryDistributionDTO {
  @ApiProperty({
    type: String,
    description: 'The country name',
    example: 'United States',
  })
  country: string;

  @ApiProperty({
    type: String,
    description: 'The ISO country code',
    example: 'US',
  })
  countryCode: string;

  @ApiProperty({
    type: Number,
    description: 'The total number of scans from this country',
    example: 150,
  })
  totalScans: number;
}

export class QrCodeAnalyticsDTO {
  @ApiProperty({
    type: Number,
    description: 'The total number of scans',
    example: 500,
  })
  totalScans: number;

  @ApiProperty({
    type: Number,
    description: 'The total number of countries where the QR code was scanned',
    example: 25,
  })
  totalCountries: number;

  @ApiProperty({
    type: Number,
    description: 'The average number of scans per country',
    example: 20.0,
  })
  averageScansPerCountry: number;

  @ApiProperty({
    type: () => QrCodeCountryDistributionDTO,
    description: 'The list of countries with their scan distribution',
    isArray: true,
  })
  countryDistribution: QrCodeCountryDistributionDTO[];
}
