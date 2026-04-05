import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class UrlLinkCountryClicksQueryDTO {
  @ApiPropertyOptional({
    type: String,
    description:
      'Interval start (ISO string, inclusive). Defaults to the current month.',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601()
  start?: string;

  @ApiPropertyOptional({
    type: String,
    description:
      'Interval end (ISO string, inclusive). Defaults to the current moment.',
    example: '2026-03-20T12:34:56.789Z',
  })
  @IsOptional()
  @IsISO8601()
  end?: string;
}
