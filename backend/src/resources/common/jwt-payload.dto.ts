import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class JWTPayloadDTO {
  @IsUUID()
  id!: string;

  @IsEmail()
  email!: string;

  @IsBoolean()
  requiresOtp!: boolean;

  @IsOptional()
  @IsString()
  purpose?: string;
}
