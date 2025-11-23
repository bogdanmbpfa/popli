import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthRegisterDTO {
  @ApiProperty({
    type: String,
    description: 'The email of the account',
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'The password of the account',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @ApiProperty({
    type: String,
    description: 'The name of the account',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z-\\'\s]+$/, {
    message: 'Name must contain only letters, spaces, hyphens and apostrophes',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The handle of the account',
    example: 'john-doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_\-.]+$/, {
    message: 'Handle must contain only letters, numbers, underscores and dots',
  })
  handle: string;
}
