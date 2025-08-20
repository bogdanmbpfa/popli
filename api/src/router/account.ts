import { Type } from '@sinclair/typebox';
import { eq } from 'drizzle-orm';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { randomBytes } from 'node:crypto';
import randomstring from 'randomstring';
import sharp from 'sharp';

import config from '@config';
import { db, userModel } from '@database';
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
  AccountProfileType,
  AccountProfile,
  AccountRequestEmailUpdateType,
} from '@resources';
import { logger } from '@server';
import {
  EmailService,
  hashPassword,
  StorageService,
  verifyPassword,
} from '@utilities';

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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      return reply.send({
        id: account.id,
        email: account.email,
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const { name, handle, bio } = request.body;

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      if (handle && handle !== account.handle) {
        const accountWithSameHandle = await db.query.userModel.findFirst({
          where: eq(userModel.handle, handle),
        });

        if (accountWithSameHandle) {
          return reply
            .code(400)
            .send({ message: config.errorMessage.handleAlreadyExists });
        }
      }

      await db
        .update(userModel)
        .set({
          ...(name && { name }),
          ...(handle && { handle }),
          ...(bio && { bio }),
        })
        .where(eq(userModel.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Reply: null | ErrorResponseType;
  }>(
    '/request-email-verify',
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      if (account.emailConfirmedAt) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.emailAlreadyConfirmed });
      }

      const code = randomstring.generate({ length: 6, charset: 'numeric' });

      await db
        .update(userModel)
        .set({
          emailConfirmationCode: code,
          emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
        })
        .where(eq(userModel.id, requestUser.id));

      await EmailService.send(
        account.email,
        `Email Verification Code - ${code}`,
        `Your email verification code is ${code}`,
      );

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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const { code } = request.body;

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      if (account.emailConfirmedAt) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.emailAlreadyConfirmed });
      }

      if (code !== account.emailConfirmationCode) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.invalidCode });
      }

      if (
        account.emailConfirmationCodeExpiresAt &&
        new Date(account.emailConfirmationCodeExpiresAt).getTime() <
          new Date().getTime()
      ) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.emailConfirmationCodeExpired });
      }

      await db
        .update(userModel)
        .set({
          emailConfirmationCode: null,
          emailConfirmationCodeExpiresAt: null,
          emailConfirmedAt: new Date(),
        })
        .where(eq(userModel.id, requestUser.id));

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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const file = await request.file();

      if (!file) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.fileRequired });
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
        .update(userModel)
        .set({ profileImage: imageUrl })
        .where(eq(userModel.id, requestUser.id));

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
        logger.error(
          { requestUser },
          'Account not found while uploading cover image',
        );

        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      const file = await request.file();

      if (!file) {
        logger.error(
          { requestUser },
          'File not found while uploading cover image',
        );

        return reply
          .code(400)
          .send({ message: config.errorMessage.fileRequired });
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
        .update(userModel)
        .set({ coverImage: imageUrl })
        .where(eq(userModel.id, requestUser.id));

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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const { currentPassword, newPassword } = request.body;

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      const isPasswordValid = await verifyPassword(
        currentPassword,
        account.password,
      );

      if (!isPasswordValid) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.invalidCredentials });
      }

      const isSamePassword = await verifyPassword(
        newPassword,
        account.password,
      );

      if (isSamePassword) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.passwordSameAsCurrent });
      }

      await db
        .update(userModel)
        .set({ password: await hashPassword(newPassword) })
        .where(eq(userModel.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountCheckHandleType;
    Reply: null | ErrorResponseType;
  }>(
    '/check-handle',
    {
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

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.handle, handle),
      });

      if (account) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.handleAlreadyExists });
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

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.email, email),
      });

      if (account) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.userAlreadyExists });
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const { name, bio } = request.body;

      await db
        .update(userModel)
        .set({
          ...(name && { name }),
          ...(bio && { bio }),
        })
        .where(eq(userModel.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.post<{
    Body: AccountRequestEmailUpdateType;
    Reply: null | ErrorResponseType;
  }>(
    '/request-email-update',
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      const accountWithSameEmail = await db.query.userModel.findFirst({
        where: eq(userModel.email, request.body.email),
      });

      if (accountWithSameEmail) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.userAlreadyExists });
      }

      const code = randomstring.generate({
        length: 6,
        charset: 'numeric',
      });

      await db
        .update(userModel)
        .set({
          emailConfirmationCode: code,
          emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
        })
        .where(eq(userModel.id, requestUser.id));

      await EmailService.send(
        request.body.email,
        `Email Update Code - ${code}`,
        `Your email update code is ${code}`,
      );

      return reply.send();
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      const { email, code } = request.body;

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      if (account.email === email) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.emailSameAsCurrent });
      }

      if (code !== account.emailConfirmationCode) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.invalidCode });
      }

      if (
        account.emailConfirmationCodeExpiresAt &&
        new Date(account.emailConfirmationCodeExpiresAt).getTime() < Date.now()
      ) {
        return reply
          .code(400)
          .send({ message: config.errorMessage.emailConfirmationCodeExpired });
      }

      await db
        .update(userModel)
        .set({
          email,
          emailConfirmedAt: new Date(),
          emailConfirmationCode: null,
          emailConfirmationCodeExpiresAt: null,
        })
        .where(eq(userModel.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.delete<{
    Reply: null | ErrorResponseType;
  }>(
    '/',
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
          .send({ message: config.errorMessage.accountNotFound });
      }

      await db
        .update(userModel)
        .set({ deletedAt: new Date() })
        .where(eq(userModel.id, requestUser.id));

      return reply.send();
    },
  );

  fastify.get<{
    Reply: AccountProfileType | ErrorResponseType;
  }>(
    '/profile',
    {
      preHandler: [authenticate],
      schema: {
        response: {
          200: AccountProfile,
          401: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { user: requestUser } = request as any;

      if (!requestUser || !requestUser.id) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      const account = await db.query.userModel.findFirst({
        where: eq(userModel.id, requestUser.id),
      });

      if (!account) {
        return reply
          .code(401)
          .send({ message: config.errorMessage.accountNotFound });
      }

      let profileImageUrl = null;

      if (account.profileImage) {
        profileImageUrl = await StorageService.getUrl(account.profileImage);
      }

      let coverImageUrl = null;

      if (account.coverImage) {
        coverImageUrl = await StorageService.getUrl(account.coverImage);
      }

      return reply.send({
        name: account.name,
        handle: account.handle,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        bio: account.bio,
      });
    },
  );

  return done();
}
