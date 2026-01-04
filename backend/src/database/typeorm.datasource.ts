import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_WRITE_HOST,
  port: process.env.DATABASE_PORT ? Number(process.env.DATABASE_PORT) : 5432,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  migrationsTableName: 'migrations',
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

AppDataSource.initialize().catch((error) => {
  console.error('Error initializing TypeORM DataSource', error);
  process.exit(1);
});

export default AppDataSource;
