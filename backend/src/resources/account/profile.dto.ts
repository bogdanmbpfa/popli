import { ApiProperty } from '@nestjs/swagger';

export class AccountProfileDTO {
  @ApiProperty({
    type: String,
    description: 'The name of the account',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    type: String,
    description: 'The handle of the account',
    example: 'john-doe',
  })
  handle: string;

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
}
