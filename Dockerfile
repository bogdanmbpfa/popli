FROM node:24-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate
# RUN pnpm setup

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH

RUN pnpm add -g typescript

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN pnpm run build

ENV PORT=8080

EXPOSE 8080

CMD ["sh", "-c", "pnpm typeorm migration:run -d server/database/typeorm.datasource.ts && exec node .output/server/index.mjs"]