import { config } from 'dotenv';

import { EEnvironment } from '@resources';

config();

export default {
  nodeEnv: process.env.NODE_ENV as EEnvironment,
  port: process.env.PORT ? Number(process.env.PORT) : 8000,
  host: process.env.HOST || '0.0.0.0',

  appName: 'Popli API',

  webappUrl: process.env.WEBAPP_URL,

  enforceHttps: process.env.ENFORCE_HTTPS === 'true',

  database: {
    readHost: process.env.DATABASE_READ_HOST,
    writeHost: process.env.DATABASE_WRITE_HOST,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },

  errorMessage: {
    userAlreadyExists: 'USER_ALREADY_EXISTS',
    invalidCredentials: 'INVALID_CREDENTIALS',
    rateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
    passwordResetCodeExpired: 'PASSWORD_RESET_CODE_EXPIRED',
    invalidCode: 'INVALID_CODE',
    accountNotFound: 'ACCOUNT_NOT_FOUND',
    emailConfirmationCodeExpired: 'EMAIL_CONFIRMATION_CODE_EXPIRED',
    unauthorized: 'UNAUTHORIZED',
    emailAlreadyConfirmed: 'EMAIL_ALREADY_CONFIRMED',
    fileRequired: 'FILE_REQUIRED',
    passwordSameAsCurrent: 'PASSWORD_SAME_AS_CURRENT',
    handleAlreadyExists: 'HANDLE_ALREADY_EXISTS',
    emailSameAsCurrent: 'EMAIL_SAME_AS_CURRENT',
    aliasAlreadyExists: 'ALIAS_ALREADY_EXISTS',
    shortUrlNotFound: 'SHORT_URL_NOT_FOUND',
    ipProxy: 'IP_PROXY',
  },

  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    storage: {
      serviceAccountEmail:
        process.env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_EMAIL,
      serviceAccountKey: process.env.GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY,
      bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET,
    },
  },

  ipApi: {
    baseUrl: 'https://free.freeipapi.com',
  },

  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    from: {
      email: 'noreply@popli.one',
      name: 'Popli',
    },
  },
};
