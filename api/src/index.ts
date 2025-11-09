import 'reflect-metadata';
import 'tsconfig-paths/register';

import multipart from '@fastify/multipart';
// import rateLimit from '@fastify/rate-limit';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
// import { Redis } from 'ioredis';

import config from './config';
import { db } from './database';
import router from './router';
import {
  applyCorsSecurityHeaders,
  applyRelaxedSecurityHeaders,
  applySecurityHeaders,
  applySwaggerSecurityHeaders,
} from './security';
import { fastify, logger } from './server';

(async () => {
  logger.info('Running Drizzle Migrations');
  await migrate(db, { migrationsFolder: 'src/database/migrations' });

  const app = fastify;

  app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 10, // 10MB
    },
  });

  // app.register(rateLimit, {
  //   global: false,
  //   ban: 10,
  //   allowList: ['127.0.0.1', '192.168.1.200'],
  //   redis: new Redis({
  //     host: config.redis.host,
  //     port: config.redis.port,
  //   }),
  //   skipOnError: true,
  //   errorResponseBuilder: () => {
  //     return {
  //       message: config.errorMessage.rateLimitExceeded,
  //       statusCode: 429,
  //     };
  //   },
  // });

  app.addHook('onRequest', async (request, reply) => {
    const { method, url } = request;

    applyCorsSecurityHeaders(reply);

    if (method === 'OPTIONS') {
      return reply.code(200).send();
    }

    if (url.startsWith('/docs')) return applySwaggerSecurityHeaders(reply);

    if (url.startsWith('/ping')) return applyRelaxedSecurityHeaders(reply);

    return applySecurityHeaders(reply);
  });

  app.get('/ping', (_, res) =>
    res.code(200).send(`${config.appName} is running`),
  );

  app.register(router);

  await app.listen({ port: config.port, host: config.host });
})().catch((err) => {
  logger.error(err);

  return process.exit(1);
});
