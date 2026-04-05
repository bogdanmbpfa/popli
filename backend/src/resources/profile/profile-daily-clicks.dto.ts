import { ApiProperty } from '@nestjs/swagger';

export class ProfileDailyClickDTO {
  @ApiProperty({
    type: String,
    description: 'The date of the clicks',
    example: '2026-03-31',
  })
  date: string;

  @ApiProperty({
    type: Number,
    description: 'The total number of clicks for the date',
    example: 42,
  })
  clicks: number;
}

export class ProfileDailyClicksDTO {
  @ApiProperty({
    type: () => ProfileDailyClickDTO,
    isArray: true,
    description: 'The daily clicks for the last 30 days',
  })
  dailyClicks: ProfileDailyClickDTO[];

  @ApiProperty({
    type: Number,
    description: 'Percentage change versus previous 30 days',
    example: 12.5,
  })
  changePercentage: number;
}
