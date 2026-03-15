import type { ELinkPlatform, ELinkType } from '../../enums';

interface IProfileLink {
  id: string;
  type: ELinkType;
  platform: ELinkPlatform | null;
  title: string | null;
  backgroundImage: string | null;
  titleColors: string[] | null;
  backgroundColors: string[] | null;
  position: number;
}

export interface IProfile {
  name: string | null;
  handle: string | null;
  handleColor: string | null;
  profileImage: string | null;
  coverImage: string | null;
  bio: string | null;
  bioColor: string | null;
  primaryLinks: IProfileLink[];
  secondaryLinks: IProfileLink[];
}