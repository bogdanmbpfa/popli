#!/usr/bin/env sh

cd /app

echo "Running Migrations"
bun typeorm migration:run -d src/database/typeorm.datasource.ts

echo "Running Popli Backend Service"
bun run start:prod
