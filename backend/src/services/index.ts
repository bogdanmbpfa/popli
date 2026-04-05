import { AccountService } from './account.service';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { ClickQueueProcessor } from './click-queue.processor';
import { ProfileService } from './profile.service';
import { QrCodeService } from './qrcode.service';
import { UrlService } from './url.service';

export const Services = [
  AccountService,
  AppService,
  AuthService,
  ClickQueueProcessor,
  ProfileService,
  QrCodeService,
  UrlService,
];

export {
  AccountService,
  AppService,
  AuthService,
  ClickQueueProcessor,
  ProfileService,
  QrCodeService,
  UrlService,
};
