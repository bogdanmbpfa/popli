import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class AccountChangePasswordDTO {
  @ApiProperty({
    type: String,
    description: 'The current password',
    example: 'password',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    type: String,
    description: 'The new password',
    example: 'newpassword',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}
