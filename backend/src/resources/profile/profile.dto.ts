import { ApiProperty } from '@nestjs/swagger';
import { ELinkPlatform, ELinkType } from '../url';

class LinkDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    enum: ELinkType,
    description: 'The type of the link',
    example: ELinkType.PRIMARY,
  })
  type: ELinkType;

  @ApiProperty({
    enum: ELinkPlatform,
    description: 'The platform of the link',
    example: ELinkPlatform.X,
  })
  platform: ELinkPlatform | null;

  @ApiProperty({
    type: String,
    description: 'The title of the link',
    example: 'My Link',
  })
  title: string | null;

  @ApiProperty({
    type: String,
    description: 'The background image of the link',
    example: 'https://example.com/background-image.webp',
  })
  backgroundImage: string | null;

  @ApiProperty({
    type: [String],
    description: 'The title colors of the link',
    example: ['#000000', '#FFFFFF'],
  })
  titleColors: string[] | null;

  @ApiProperty({
    type: [String],
    description: 'The background colors of the link',
    example: ['#000000', '#FFFFFF'],
  })
  backgroundColors: string[] | null;

  @ApiProperty({
    type: Number,
    description: 'The position of the link',
    example: 0,
  })
  position: number;
}

export class ProfileDTO {
  @ApiProperty({
    type: String,
    description: 'The name of the profile',
    example: 'John Doe',
  })
  name: string | null;

  @ApiProperty({
    type: String,
    description: 'The handle of the profile',
    example: 'john-doe',
  })
  handle: string | null;

  @ApiProperty({
    type: String,
    description: 'The handle color of the profile',
    example: '#000000',
  })
  handleColor: string | null;

  @ApiProperty({
    type: String,
    description: 'The profile image of the profile',
    example: 'https://example.com/profile-image.webp',
  })
  profileImage: string | null;

  @ApiProperty({
    type: String,
    description: 'The cover image of the profile',
    example: 'https://example.com/cover-image.webp',
  })
  coverImage: string | null;

  @ApiProperty({
    type: String,
    description: 'The bio of the profile',
    example: 'I am a software engineer',
  })
  bio: string | null;

  @ApiProperty({
    type: String,
    description: 'The bio color of the profile',
    example: '#000000',
  })
  bioColor: string | null;

  @ApiProperty({
    type: () => LinkDTO,
    isArray: true,
    description: 'The primary links of the profile',
  })
  primaryLinks: LinkDTO[];

  @ApiProperty({
    type: () => LinkDTO,
    isArray: true,
    description: 'The secondary links of the profile',
  })
  secondaryLinks: LinkDTO[];
}
