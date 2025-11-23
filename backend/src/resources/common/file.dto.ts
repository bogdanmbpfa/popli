import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class FileDTO {
  @ApiProperty({ type: Buffer })
  buffer!: Buffer;

  @ApiProperty({ type: String })
  @IsString()
  mimetype!: string;

  @ApiProperty({ type: Number })
  @IsNumber()
  size!: number;

  @ApiProperty({ type: String })
  @IsString()
  originalname!: string;
}
