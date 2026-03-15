import { ApiProperty } from '@nestjs/swagger';

import { ELinkPlatform } from './link-platform.enum';
import { ELinkType } from './link-type.enum';

export class LinkDTO {
  @ApiProperty({
    type: String,
    description: 'The ID of the link',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'The ID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    type: String,
    description: 'The type of the link',
    example: ELinkType.PRIMARY,
  })
  type: ELinkType;

  @ApiProperty({
    type: String,
    description: 'The platform of the link',
    example: ELinkPlatform.X,
  })
  platform: ELinkPlatform | null;

  @ApiProperty({
    type: String,
    description: 'The URL of the link',
    example: 'https://example.com/link',
  })
  url: string;

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

  @ApiProperty({
    type: String,
    description: 'The date and time the link was created',
    example: '2021-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    type: String,
    description: 'The date and time the link was updated',
    example: '2021-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    type: String,
    description: 'The date and time the link was deleted',
    example: '2021-01-01T00:00:00.000Z',
    nullable: true,
  })
  deletedAt: string | null;
}
