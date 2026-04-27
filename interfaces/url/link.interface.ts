import type { ELinkPlatform, ELinkType } from '../../enums';

export interface ILink {
  id: string;
  userId?: string;
  type: ELinkType;
  platform?: ELinkPlatform;
  url?: string;
  title?: string;
  backgroundImage?: string | File | null;
  titleColors?: string[];
  backgroundColors?: string[];
  position: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}
