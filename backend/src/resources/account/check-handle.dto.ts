import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class AccountCheckHandleDTO {
  @ApiProperty({
    type: String,
    description: 'The handle to check',
    example: 'john-doe',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @Matches(/^[a-zA-Z0-9_\-.]+$/, {
    message:
      'Handle must contain only letters, numbers, underscores, and hyphens',
  })
  handle: string;
}
