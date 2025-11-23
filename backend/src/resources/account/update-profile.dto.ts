import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class AccountUpdateProfileDTO {
  @ApiProperty({
    type: String,
    description: 'The name to update',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z-\\'\s]+$/, {
    message: 'Name must contain only letters, apostrophes, and spaces',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The bio to update',
    example: 'I am a software engineer',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bio: string;
}
