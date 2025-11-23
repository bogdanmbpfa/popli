#!/usr/bin/env sh

cd /app

echo "Compiling TS Migrations"
npx tsc src/database/migrations/*.ts --outDir src/database/migrations/generated

echo "Running Migrations"
if [ $MIGRATION_FLAG = 'RUN' ]
then
  npx typeorm migration:run -d src/database/typeorm.datasource.ts
else
  npx typeorm migration:revert -d src/database/typeorm.datasource.ts
fi

echo "Removing JS Migrations"
rm -rf src/database/migrations/generated/

echo "Running Popli Backend Service"

pnpm run start:dev
