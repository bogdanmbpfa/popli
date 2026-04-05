FROM oven/bun:alpine

WORKDIR /app

RUN apk add --no-cache redis

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

EXPOSE 8000
EXPOSE 6379

RUN chmod +x ./docker/start-local.sh
ENTRYPOINT ["sh", "./docker/start-local.sh"]
