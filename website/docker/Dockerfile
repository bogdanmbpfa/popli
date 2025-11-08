FROM node:22-alpine

WORKDIR /app

ENV PNPM_HOME=/usr/local/bin
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm add -g typescript

COPY package.json pnpm-lock.yaml./

RUN pnpm install

COPY . .

RUN pnpm run build

ENV PORT=8080

EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]