import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthLoginDTO {
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
  password: string;
}
