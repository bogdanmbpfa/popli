import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.NUXT_DATABASE_WRITE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.NUXT_DATABASE_USERNAME,
  password: process.env.NUXT_DATABASE_PASSWORD,
  database: process.env.NUXT_DATABASE_NAME,
  migrationsTableName: 'migrations',
  migrations: ['server/database/migrations/*.ts'],
  synchronize: false,
  ssl:
    process.env.NUXT_PUBLIC_NODE_ENV !== 'local'
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

AppDataSource.initialize().catch((error) => {
  console.error('Error initializing TypeORM DataSource', error);
  process.exit(1);
});

export default AppDataSource;
