import { ApiProperty } from '@nestjs/swagger';

export class UrlUniqueVisitorsDTO {
  @ApiProperty({
    type: String,
    description: 'The date',
    example: '2021-01-01',
  })
  date: string;

  @ApiProperty({
    type: Number,
    description: 'The number of unique visitors',
    example: 100,
  })
  visitors: number;
}
