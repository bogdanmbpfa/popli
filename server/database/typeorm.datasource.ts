import { DataSource } from 'typeorm';

import { EEnvironment } from '~~/enums';

const { database, public: { nodeEnv } } = useRuntimeConfig();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: database.writeHost,
  port: database.port,
  username: database.username,
  password: database.password,
  database: database.database,
  migrationsTableName: 'migrations',
  migrations: ['~~/server/database/migrations/*.ts'],
  synchronize: false,
  ssl:
    nodeEnv !== EEnvironment.LOCAL
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
