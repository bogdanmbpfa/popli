import { drizzle } from 'drizzle-orm/node-postgres';
import { withReplicas } from 'drizzle-orm/pg-core';

import config from '@config';

import * as userSchema from './user.schema';
import * as urlSchema from './url.schema';

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
      ...userSchema,
      ...urlSchema,
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
        ...userSchema,
        ...urlSchema,
      },
    }),
  ],
);

export * from './url.schema';
export * from './user.schema';
