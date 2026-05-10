import type { ELinkPlatform } from '../../enums';

export interface IUpdatePrimaryLink {
  platform: ELinkPlatform;
  url: string;
}