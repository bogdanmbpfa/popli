import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, asc, eq, isNull } from 'drizzle-orm';

import { db, profileModel, linkModel } from '@database';
import { ELinkType, ProfileDTO } from '@resources';
import { StorageUtility } from '@utilities';

@Injectable()
export class ProfileService {
  constructor(
    private readonly configService: ConfigService,
    private readonly storageUtility: StorageUtility,
  ) {}

  async getProfile(handle: string): Promise<ProfileDTO> {
    const profile = await db.query.profileModel.findFirst({
      where: and(
        eq(profileModel.handle, handle),
        isNull(profileModel.deletedAt),
      ),
    });

    if (!profile) {
      throw new NotFoundException(
        this.configService.get('errorMessage.profileNotFound'),
      );
    }

    let profileImageUrl: string | null = null;

    if (profile.profileImage) {
      profileImageUrl = await this.storageUtility.getUrl(profile.profileImage);
    }

    let coverImageUrl: string | null = null;

    if (profile.coverImage) {
      coverImageUrl = await this.storageUtility.getUrl(profile.coverImage);
    }

    const links = await db.query.linkModel.findMany({
      where: and(
        eq(linkModel.userId, profile.userId),
        isNull(linkModel.deletedAt),
      ),
      orderBy: [asc(linkModel.position)],
    });

    const linkDtos = await Promise.all(
      links.map(async (link) => {
        let backgroundImageUrl: string | null = null;

        if (link.backgroundImage) {
          backgroundImageUrl = await this.storageUtility.getUrl(
            link.backgroundImage,
          );
        }

        return {
          id: link.id,
          type: link.type,
          platform: link.platform,
          title: link.title,
          backgroundImage: backgroundImageUrl,
          titleColors: link.titleColors as string[] | null,
          backgroundColors: link.backgroundColors as string[] | null,
          position: link.position,
        };
      }),
    );

    return {
      name: profile.name,
      handle: profile.handle,
      handleColor: profile.handleColor,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
      bio: profile.bio,
      bioColor: profile.bioColor,
      primaryLinks: linkDtos.filter((link) => link.type === ELinkType.PRIMARY),
      secondaryLinks: linkDtos.filter(
        (link) => link.type === ELinkType.SECONDARY,
      ),
    };
  }
}
