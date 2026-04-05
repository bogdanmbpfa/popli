import { ApiProperty } from '@nestjs/swagger';

export class UrlLinkDailyClicksDTO {
  @ApiProperty({
    type: String,
    description: 'The date of the daily clicks',
    example: '2021-01-01',
  })
  date: string;

  @ApiProperty({
    type: Number,
    description: 'The number of clicks',
    example: 100,
  })
  clicks: number;
}
