import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import account from './account';
import auth from './auth';
import url from './url';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.register(account, { prefix: '/account' });
  fastify.register(auth, { prefix: '/auth' });
  fastify.register(url, { prefix: '/url' });

  return done();
}
