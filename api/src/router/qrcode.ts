import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  QrCodeCreateType,
  ErrorResponseType,
  ErrorResponse,
  QrCodeCreate,
} from '@resources';
import { authenticate } from '@middlewares';
import config from '@config';
import { db, qrCodeModel, userModel } from '@database';
import { eq } from 'drizzle-orm';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.post<{
    Body: QrCodeCreateType;
    Reply: ErrorResponseType;
  }>(
    '/qrcode',
    {
      preHandler: [authenticate],
      schema: {
        body: QrCodeCreate,
        response: {
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id as string),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.unauthorized });
      }

      const { title, dataType, options } = request.body;

      await db.insert(qrCodeModel).values({
        userId: account.id,
        title,
        dataType,
        options,
      });

      return reply.send();
    },
  );

  return done();
}
