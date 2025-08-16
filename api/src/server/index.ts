import Fastify, { FastifyBaseLogger, FastifyInstance } from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

import config from '@config';

declare module 'fastify' {
  interface FastifyInstance {
    user: {
      id: string;
    };
  }
}

class FastifyServer {
  public fastify: FastifyInstance;
  public logger: FastifyBaseLogger;
  private static _instance: FastifyServer;

  private constructor() {
    this.fastify = Fastify({
      logger: {
        enabled: true,
        name: config.appName,
        level: 'info',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: false,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
          },
        },
      },
      disableRequestLogging: true,
    });

    // Register the TypeBox type provider
    this.fastify.withTypeProvider<TypeBoxTypeProvider>();

    this.fastify.decorateRequest('user', null);

    this.logger = this.fastify.log;

    // Add back only the response logging with custom format
    this.fastify.addHook('onResponse', (request, reply, done) => {
      const responseTime = Math.round(reply.elapsedTime || 0);

      this.logger.info(
        `Response Time: ${responseTime}ms - Status Code: ${reply.statusCode} - URL: ${request.method} ${request.url}`,
      );
      done();
    });

    // Custom error logging with stack trace on separate line
    this.fastify.setErrorHandler((error, _request, reply) => {
      if (!error.statusCode) {
        this.logger.error(error, error.message);
      }

      return reply
        .code(error.statusCode || 500)
        .send({ error: error.message || 'Internal Server Error' });
    });
  }

  public static get instance(): FastifyServer {
    if (!FastifyServer._instance) {
      FastifyServer._instance = new FastifyServer();
    }

    return FastifyServer._instance;
  }
}

export const { fastify, logger } = FastifyServer.instance;
