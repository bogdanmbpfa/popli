import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UrlShortUrlUpdateDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the short URL',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @ApiProperty({
    type: String,
    description: 'The URL of the short URL',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  url?: string;

  @ApiProperty({
    type: String,
    description: 'The alias of the short URL',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_\-.]+$/, {
    message: 'Alias must contain only letters, numbers, underscores and dots',
  })
  alias?: string;

  @ApiProperty({
    type: String,
    description: 'The title of the short URL',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title?: string;
}
