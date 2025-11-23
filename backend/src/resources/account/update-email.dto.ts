import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class AccountUpdateEmailDTO {
  @ApiProperty({
    type: String,
    description: 'The email to update',
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    description: 'The code to update',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Code must be a number' })
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code: string;
}
