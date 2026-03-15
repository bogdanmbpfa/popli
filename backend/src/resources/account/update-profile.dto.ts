import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class AccountUpdateProfileDTO {
  @ApiProperty({
    type: String,
    description: 'The name to update',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z-\\'\s]+$/, {
    message: 'Name must contain only letters, apostrophes, and spaces',
  })
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The handle to update',
    example: 'john-doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(40)
  @Matches(/^[a-zA-Z0-9_\-.]+$/, {
    message:
      'Handle must contain only letters, numbers, underscores, and hyphens',
  })
  handle?: string;

  @ApiProperty({
    type: String,
    description: 'The handle color to update',
    example: '#000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(6)
  @Matches(/^[0-9a-fA-F]+$/, {
    message: 'Handle color must be a valid hex color',
  })
  handleColor?: string;

  @ApiProperty({
    type: String,
    description: 'The bio to update',
    example: 'I am a software engineer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bio?: string;

  @ApiProperty({
    type: String,
    description: 'The bio color to update',
    example: '#000000',
  })
  @IsOptional()
  @IsString()
  @MaxLength(6)
  @Matches(/^[0-9a-fA-F]+$/, {
    message: 'Bio color must be a valid hex color',
  })
  bioColor?: string;
}
