FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8000

RUN chmod +x ./docker/start-local.sh
ENTRYPOINT ["sh", "./docker/start-local.sh"]
