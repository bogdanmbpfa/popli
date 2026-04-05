import { ApiProperty } from '@nestjs/swagger';

class QrCodeCountryDistributionDTO {
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

class QrCodeDailyScansDTO {
  @ApiProperty({
    type: String,
    description: 'The date of the daily scans',
    example: '2021-01-01',
  })
  date: string;

  @ApiProperty({
    type: Number,
    description: 'The number of scans on the date',
    example: 100,
  })
  scans: number;
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

  @ApiProperty({
    type: () => QrCodeDailyScansDTO,
    description: 'The list of daily scans',
    isArray: true,
  })
  dailyScans: QrCodeDailyScansDTO[];
}
