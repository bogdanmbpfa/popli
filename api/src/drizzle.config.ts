import { defineConfig } from 'drizzle-kit';

import config from '@config';

export default defineConfig({
  out: './src/database/migrations',
  schema: './src/database/**/*.schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: config.database.writeHost!,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database!,
  },
  migrations: {
    table: 'migrations',
    schema: 'public',
  },
  casing: 'snake_case',
});
