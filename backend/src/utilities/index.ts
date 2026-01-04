import { EmailUtilityService } from './email.utility';
import { formatErrors } from './format-errors.utility';
import { processImage } from './image.utility';
import { JWTUtilityService } from './jwt.utility';
import { generateRandomNumericString } from './random-numeric-string.utility';
import { StorageUtility } from './storage.utility';

export const UtilityServices = [
  EmailUtilityService,
  JWTUtilityService,
  StorageUtility,
];

export {
  EmailUtilityService,
  formatErrors,
  generateRandomNumericString,
  JWTUtilityService,
  StorageUtility,
  processImage,
};
