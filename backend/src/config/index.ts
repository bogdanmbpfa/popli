import * as dotenv from 'dotenv';

import { EEnvironment, IConfig } from '@resources';

dotenv.config();

export const config: IConfig = {
  nodeEnv: process.env.NODE_ENV as EEnvironment,

  port: process.env.APP_PORT ? Number(process.env.APP_PORT) : 3000,

  app: {
    websiteUrl: process.env.WEBSITE_URL as string,
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY as string,
    templates: {
      welcome: 2,
      passwordReset: 3,
      emailVerification: 6,
      emailUpdate: 5,
    },
  },

  database: {
    readHost: process.env.DATABASE_READ_HOST as string,
    writeHost: process.env.DATABASE_WRITE_HOST as string,
    port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
    username: process.env.DATABASE_USERNAME as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
  },

  otp: {
    length: 40,
    name: 'SOS Dashboard',
    issuer: 'Jaeggi Industries',
  },

  errorMessages: {
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
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID as string,
    storage: {
      serviceAccountEmail: process.env
        .GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_EMAIL as string,
      serviceAccountKey: process.env
        .GOOGLE_CLOUD_STORAGE_SERVICE_ACCOUNT_KEY as string,
      bucket: process.env.GOOGLE_CLOUD_STORAGE_BUCKET as string,
    },
  },

  ipApi: {
    baseUrl: 'https://free.freeipapi.com',
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY as string,
    from: {
      email: 'noreply@popli.one',
      name: 'Popli',
    },
  },
};
