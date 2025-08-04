import { Type } from '@sinclair/typebox';
import { eq } from 'drizzle-orm';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

import config from '@config';
import { db, user } from '@database';
import { authenticate } from '@middlewares';
import {
  Account,
  AccountType,
  AccountUpdate,
  AccountUpdateType,
  ErrorResponse,
  ErrorResponseType,
  AccountVerifyEmailType,
  AccountVerifyEmail,
  AccountChangePassword,
  AccountChangePasswordType,
  AccountCheckHandle,
  AccountCheckHandleType,
  AccountCheckEmailType,
  AccountCheckEmail,
  AccountUpdateProfile,
  AccountUpdateProfileType,
  AccountUpdateEmailType,
  AccountUpdateEmail,
} from '@resources';
import { hashPassword, StorageService, verifyPassword } from '@utilities';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.get<{ Reply: AccountType | ErrorResponseType }>(
    '/me',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: Account,
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      return reply.send({
        id: account.id,
        email: account.email,
        name: account.name,
        handle: account.handle,
        profileImage: account.profileImage,
        emailConfirmedAt: account.emailConfirmedAt
          ? account.emailConfirmedAt.toISOString()
          : null,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      });
    },
  );

  fastify.patch<{
    Body: AccountUpdateType;
    Reply: null | ErrorResponseType;
  }>(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountUpdate,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const { name, handle } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      await db
        .update(user)
        .set({
          ...(name && { name }),
          ...(handle && { handle }),
        })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountVerifyEmailType;
    Reply: null | ErrorResponseType;
  }>(
    '/verify-email',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountVerifyEmail,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const { code } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      if (account.emailConfirmedAt) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.emailAlreadyConfirmed });
      }

      if (code !== account.emailConfirmationCode) {
        return reply.code(400).send({ error: config.errorMessage.invalidCode });
      }

      await db
        .update(user)
        .set({
          emailConfirmationCode: null,
          emailConfirmationCodeExpiresAt: null,
          emailConfirmedAt: new Date(),
        })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Reply: null | ErrorResponseType;
  }>(
    '/upload-profile-image',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const file = await request.file();

      if (!file) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.fileRequired });
      }

      const image = await sharp(await file.toBuffer())
        .rotate()
        .resize(512, 512, { fit: 'inside' })
        .webp({ quality: 100 })
        .toBuffer();

      const imageUrl = await StorageService.upload(
        image,
        randomBytes(20).toString('hex'),
        'image/webp',
      );

      await db
        .update(user)
        .set({ profileImage: imageUrl })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Reply: null | ErrorResponseType;
  }>(
    '/upload-cover-image',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const file = await request.file();

      if (!file) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.fileRequired });
      }

      const image = await sharp(await file.toBuffer())
        .rotate()
        .resize(1280, 720, { fit: 'inside' })
        .webp({ quality: 100 })
        .toBuffer();

      const imageUrl = await StorageService.upload(
        image,
        randomBytes(20).toString('hex'),
        'image/webp',
      );

      await db
        .update(user)
        .set({ coverImage: imageUrl })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountChangePasswordType;
    Reply: null | ErrorResponseType;
  }>(
    '/change-password',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountChangePassword,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const { currentPassword, newPassword } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const isPasswordValid = await verifyPassword(
        currentPassword,
        account.password,
      );

      if (!isPasswordValid) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.invalidCredentials });
      }

      const isSamePassword = await verifyPassword(
        newPassword,
        account.password,
      );

      if (isSamePassword) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.passwordSameAsCurrent });
      }

      await db
        .update(user)
        .set({ password: await hashPassword(newPassword) })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountCheckHandleType;
    Reply: null | ErrorResponseType;
  }>(
    '/check-handle',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountCheckHandle,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { handle } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.handle, handle),
      });

      if (account) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.handleAlreadyExists });
      }

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountCheckEmailType;
    Reply: null | ErrorResponseType;
  }>(
    '/check-email',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountCheckEmail,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.email, email),
      });

      if (account) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.userAlreadyExists });
      }

      return reply.send();
    },
  );

  fastify.patch<{
    Body: AccountUpdateProfileType;
    Reply: null | ErrorResponseType;
  }>(
    '/update-profile',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountUpdateProfile,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const { name, bio } = request.body;

      await db
        .update(user)
        .set({
          ...(name && { name }),
          ...(bio && { bio }),
        })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Reply: AccountVerifyEmailType | ErrorResponseType;
  }>(
    '/request-email-update',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: AccountVerifyEmail,
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const code = randomBytes(3).toString('hex');

      await db
        .update(user)
        .set({
          emailConfirmationCode: code,
          emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 5),
        })
        .where(eq(user.id, requestUser.id));

      return reply.send({ code });
    },
  );

  fastify.post<{
    Body: AccountUpdateEmailType;
    Reply: null | ErrorResponseType;
  }>(
    '/update-email',
    {
      preHandler: [authenticate],
      schema: {
        body: AccountUpdateEmail,
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      const { email, code } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      if (account.email === email) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.emailSameAsCurrent });
      }

      if (code !== account.emailConfirmationCode) {
        return reply.code(400).send({ error: config.errorMessage.invalidCode });
      }

      if (
        account.emailConfirmationCodeExpiresAt &&
        new Date(account.emailConfirmationCodeExpiresAt).getTime() < Date.now()
      ) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.emailConfirmationCodeExpired });
      }

      await db
        .update(user)
        .set({
          email,
          emailConfirmedAt: new Date(),
          emailConfirmationCode: null,
          emailConfirmationCodeExpiresAt: null,
        })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.delete<{
    Reply: null | ErrorResponseType;
  }>(
    '/delete-account',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: Type.Null(),
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ error: config.errorMessage.accountNotFound });
      }

      await db
        .update(user)
        .set({ deletedAt: new Date() })
        .where(eq(user.id, requestUser.id));

      return reply.send();
    },
  );

  return done();
}
