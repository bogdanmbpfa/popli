import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class AccountVerifyEmailDTO {
  @ApiProperty({
    type: String,
    description: 'The code to verify the email',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Code must be a number' })
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code: string;
}
