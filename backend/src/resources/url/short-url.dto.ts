import { ApiProperty } from '@nestjs/swagger';

import { UrlUniqueVisitorsDTO } from './unique-visitors.dto';

export class UrlShortUrlDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the short URL',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The original URL',
    example: 'https://example.com/long-url',
  })
  originalUrl: string;

  @ApiProperty({
    type: String,
    description: 'The short code URL',
    example: 'https://example.com/short-code',
  })
  shortCodeUrl: string;

  @ApiProperty({
    type: String,
    description: 'The alias for the short URL',
    example: 'my-short-url',
  })
  alias: string | null;

  @ApiProperty({
    type: String,
    description: 'The alias URL',
    example: 'https://example.com/my-short-url',
  })
  aliasUrl: string | null;

  @ApiProperty({
    type: String,
    description: 'The title for the short URL',
    example: 'My Short URL',
  })
  title: string;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the short URL is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    type: String,
    description: 'The date and time the short URL was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    description: 'The date and time the short URL was updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    type: Number,
    description: 'The number of clicks today',
    example: 100,
  })
  todayClicks: number;

  @ApiProperty({
    type: () => UrlUniqueVisitorsDTO,
    isArray: true,
    description: 'The daily unique visitors',
    example: [
      { date: '2021-01-01', visitors: 100 },
      { date: '2021-01-02', visitors: 200 },
    ],
  })
  dailyUniqueVisitors: UrlUniqueVisitorsDTO[];

  @ApiProperty({
    type: Number,
    description: 'The number of unique visitors today',
    example: 100,
  })
  todayUniqueVisitors: number;

  @ApiProperty({
    type: Number,
    description: 'The number of total clicks',
    example: 100,
  })
  totalClicks: number;

  @ApiProperty({
    type: Number,
    description: 'The number of total unique visitors',
    example: 100,
  })
  totalUniqueVisitors: number;
}
