import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class AccountRequestEmailUpdateDTO {
  @ApiProperty({
    type: String,
    description: 'The email to request an email update',
    example: 'test@example.com',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
