import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import account from './account';
import auth from './auth';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.register(account, { prefix: '/account' });
  fastify.register(auth, { prefix: '/auth' });

  return done();
}
