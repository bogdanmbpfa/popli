#!/usr/bin/env sh

cd /app

echo "Running Migrations"
if [ $MIGRATION_FLAG = 'RUN' ]
then
  bun typeorm migration:run -d src/database/typeorm.datasource.ts
else
  bun typeorm migration:revert -d src/database/typeorm.datasource.ts
fi

echo "Running Popli Backend Service"

bun run start:dev
