import { drizzle } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';

import { EEnvironment } from '~~/enums';

import * as qrCodeSchema from './qrcode.schema';
import * as urlSchema from './url.schema';
import * as userSchema from './user.schema';

const { database, public: { nodeEnv } } = useRuntimeConfig();

export const db = withReplicas(
  drizzle({
    casing: 'snake_case',
    connection: {
      host: database.writeHost,
      port: database.port,
      user: database.username,
      password: database.password,
      database: database.database,
      ssl:
        nodeEnv !== EEnvironment.LOCAL
          ? {
              rejectUnauthorized: false,
            }
          : false,
    },
    schema: {
      ...qrCodeSchema,
      ...urlSchema,
      ...userSchema,
    },
  }),
  [
    drizzle({
      casing: 'snake_case',
      connection: {
        host: database.readHost,
        port: database.port,
        user: database.username,
        password: database.password,
        database: database.database,
        ssl:
          nodeEnv !== EEnvironment.LOCAL
            ? {
                rejectUnauthorized: false,
              }
            : false,
      },
      schema: {
        ...qrCodeSchema,
        ...urlSchema,
        ...userSchema,
      },
    }),
  ],
);

export * from './qrcode.schema';
export * from './url.schema';
export * from './user.schema';
