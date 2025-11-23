import { drizzle } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';

import { config } from '@config';

import * as qrCodeSchema from './qrcode.schema';
import * as urlSchema from './url.schema';
import * as userSchema from './user.schema';

export const db = withReplicas(
  drizzle({
    casing: 'snake_case',
    connection: {
      host: config.database.writeHost,
      port: config.database.port,
      user: config.database.username,
      password: config.database.password,
      database: config.database.database,
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
        host: config.database.readHost,
        port: config.database.port,
        user: config.database.username,
        password: config.database.password,
        database: config.database.database,
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
