import { AccountService } from './account.service';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { QrCodeService } from './qrcode.service';
import { UrlService } from './url.service';

export const Services = [
  AccountService,
  AppService,
  AuthService,
  QrCodeService,
  UrlService,
];

export { AccountService, AppService, AuthService, QrCodeService, UrlService };
