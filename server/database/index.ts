import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as publicSchema from './public.schema';
import * as qrCodeSchema from './qrcode.schema';
import * as urlSchema from './url.schema';
import * as userSchema from './user.schema';

const { database } = useRuntimeConfig();

const pool = new pg.Pool({ connectionString: database.url });

export const db = drizzle(pool, {
  casing: 'snake_case',
  schema: {
    ...publicSchema,
    ...qrCodeSchema,
    ...urlSchema,
    ...userSchema,
  },
});

export * from './public.schema';
export * from './qrcode.schema';
export * from './url.schema';
export * from './user.schema';
