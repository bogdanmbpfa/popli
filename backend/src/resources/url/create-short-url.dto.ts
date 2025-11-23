import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
} from 'class-validator';

export class UrlCreateShortUrlDTO {
  @ApiProperty({
    type: String,
    description: 'The original URL',
    example: 'https://example.com/long-url',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @ApiProperty({
    type: String,
    description: 'The alias for the short URL',
    example: 'my-short-url',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_\-.]+$/, {
    message: 'Alias must contain only letters, numbers, underscores and dots',
  })
  alias?: string;

  @ApiProperty({
    type: String,
    description: 'The title for the short URL',
    example: 'My Short URL',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;
}
