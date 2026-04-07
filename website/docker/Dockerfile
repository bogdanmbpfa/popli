FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
ENV PNPM_HOME=/usr/local/bin

RUN pnpm add -g typescript

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm run build

ENV PORT=8080

EXPOSE 8080

CMD ["pnpm", "run", ".output/server/index.mjs"]