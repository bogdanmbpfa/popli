FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

COPY . .

RUN pnpm run build

ENV PORT=8080

EXPOSE 8080

CMD ["bun", "run", ".output/server/index.mjs"]