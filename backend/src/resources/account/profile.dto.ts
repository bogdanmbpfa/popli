import { ApiProperty } from '@nestjs/swagger';

export class AccountProfileDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the profile',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The user ID of the profile',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    type: String,
    description: 'The name of the account',
    example: 'John Doe',
  })
  name: string | null;

  @ApiProperty({
    type: String,
    description: 'The handle of the account',
    example: 'john-doe',
  })
  handle: string | null;

  @ApiProperty({
    type: String,
    description: 'The handle color of the account',
    example: '#000000',
  })
  handleColor: string | null;

  @ApiProperty({
    type: String,
    description: 'The profile image of the account',
    example: 'https://example.com/profile.jpg',
  })
  profileImage: string | null;

  @ApiProperty({
    type: String,
    description: 'The cover image of the account',
    example: 'https://example.com/cover.jpg',
  })
  coverImage: string | null;

  @ApiProperty({
    type: String,
    description: 'The bio of the account',
    example: 'I am a software engineer',
  })
  bio: string | null;

  @ApiProperty({
    type: String,
    description: 'The bio color of the account',
    example: '#000000',
  })
  bioColor: string | null;

  @ApiProperty({
    type: String,
    description: 'The created at of the profile',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    description: 'The updated at of the profile',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    type: String,
    description: 'The deleted at of the profile',
    example: '2021-01-01T00:00:00.000Z',
  })
  deletedAt: string | null;
}
