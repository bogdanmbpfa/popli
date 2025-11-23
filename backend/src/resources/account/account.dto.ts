import { ApiProperty } from '@nestjs/swagger';

export class AccountDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the account',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The email of the account',
    example: 'test@example.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    description: 'The email confirmed at of the account',
    example: '2021-01-01T00:00:00.000Z',
  })
  emailConfirmedAt: string | null;

  @ApiProperty({
    type: String,
    description: 'The email confirmation code of the account',
    example: '123456',
  })
  emailConfirmationCode: string | null;

  @ApiProperty({
    type: String,
    description: 'The email confirmation code expires at of the account',
    example: '2021-01-01T00:00:00.000Z',
  })
  emailConfirmationCodeExpiresAt: string | null;

  @ApiProperty({
    type: String,
    description: 'The created at of the account',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    description: 'The updated at of the account',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}
