import { EmailUtilityService } from './email.utility';
import { formatErrors } from './format-errors.utility';
import { JWTUtilityService } from './jwt.utility';
import { StorageUtility } from './storage.utility';

export const UtilityServices = [
  EmailUtilityService,
  JWTUtilityService,
  StorageUtility,
];

export { EmailUtilityService, formatErrors, JWTUtilityService, StorageUtility };
