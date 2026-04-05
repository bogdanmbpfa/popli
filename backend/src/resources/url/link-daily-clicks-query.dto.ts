import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

export class UrlLinkDailyClicksQueryDTO {
  @ApiPropertyOptional({
    type: Number,
    description: 'How many days to include (default: 7).',
    example: 7,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}
