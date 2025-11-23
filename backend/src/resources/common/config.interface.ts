import { EEnvironment } from '@resources';

export interface IConfig {
  nodeEnv: EEnvironment;
  port: number;
  app: {
    websiteUrl: string;
  };
  brevo: {
    apiKey: string;
    templates: {
      welcome: number;
      passwordReset: number;
      emailVerification: number;
      emailUpdate: number;
    };
  };
  database: {
    readHost: string;
    writeHost: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  otp: {
    length: number;
    name: string;
    issuer: string;
  };
  errorMessages: {
    [key: string]: string;
  };
  googleCloud: {
    projectId: string;
    storage: {
      serviceAccountEmail: string;
      serviceAccountKey: string;
      bucket: string;
    };
  };
  ipApi: {
    baseUrl: string;
  };
  sendgrid: {
    apiKey: string;
    from: {
      email: string;
      name: string;
    };
  };
}
