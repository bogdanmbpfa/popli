#!/usr/bin/env sh

cd /app

echo "Compiling TS Migrations"
npx tsc src/database/migrations/*.ts --outDir src/database/migrations/generated

echo "Running Migrations"
npx typeorm migration:run -d src/database/typeorm.datasource.ts

echo "Removing JS Migrations"
rm -rf src/database/migrations/generated/

echo "Running Popli Backend Service"
pnpm run start:prod
