import { eq } from 'drizzle-orm';
import { FastifyReply, FastifyRequest } from 'fastify';
import { decodeJwt } from 'jose';

import config from '@config';
import { db, userModel } from '@database';
import { verifyJwt } from '@utilities';

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const { authorization } = request.headers;

  if (!authorization) {
    return reply.code(401).send({ message: config.errorMessage.unauthorized });
  }

  const [, token] = authorization.split(' ');

  if (!token) {
    return reply.code(401).send({ message: config.errorMessage.unauthorized });
  }

  const payload = decodeJwt(token);

  if (!payload || !payload.id) {
    return reply.code(401).send({ message: config.errorMessage.unauthorized });
  }

  const account = await db.query.userModel.findFirst({
    where: eq(userModel.id, payload.id as string),
  });

  if (!account || account.deletedAt) {
    return reply.code(401).send({ message: config.errorMessage.unauthorized });
  }

  try {
    await verifyJwt(token, account.jwtSecret);
  } catch {
    return reply.code(401).send({ message: config.errorMessage.unauthorized });
  }

  // @ts-expect-error: Attach user to request for downstream handlers
  request.user = { id: account.id };
};
