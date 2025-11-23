import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
} from 'class-validator';

export class AuthResetPasswordDTO {
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
    description: 'The code to reset the password',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Code must be a number' })
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code: string;

  @ApiProperty({
    type: String,
    description: 'The new password',
    example: 'newpassword',
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
}
