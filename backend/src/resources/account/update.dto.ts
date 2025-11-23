import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AccountUpdateDTO {
  @ApiProperty({
    type: String,
    description: 'The name of the account',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    type: String,
    description: 'The handle of the account',
    example: 'john-doe',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  handle?: string;

  @ApiProperty({
    description: 'The bio of the account',
    example: 'I am a software engineer',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  bio?: string;
}
