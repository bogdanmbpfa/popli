FROM node:22-alpine

WORKDIR /app

ENV PNPM_HOME=/usr/local/bin
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN pnpm add -g typescript

COPY package.json ./

RUN pnpm install

RUN pnpm install sharp --force

COPY . .

EXPOSE 8000

RUN chmod +x ./docker/start-local.sh
ENTRYPOINT ["sh", "./docker/start-local.sh"]
