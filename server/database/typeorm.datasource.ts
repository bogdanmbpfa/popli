import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.NUXT_DATABASE_URL,
  migrationsTableName: 'migrations',
  migrations: ['server/database/migrations/*.ts'],
  synchronize: false,
  ssl: process.env.NUXT_PUBLIC_NODE_ENV !== 'local',
});

AppDataSource.initialize().catch((error) => {
  console.error('Error initializing TypeORM DataSource', error);
  process.exit(1);
});

export default AppDataSource;
