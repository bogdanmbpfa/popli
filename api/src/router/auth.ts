import { Type } from '@sinclair/typebox';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { eq, or } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

import config from '@config';
import { db, user } from '@database';
import {
  AuthLogin,
  AuthLoginType,
  AuthRegister,
  AuthRegisterType,
  AuthRequestPasswordReset,
  AuthRequestPasswordResetType,
  AuthResetPassword,
  AuthResetPasswordType,
  AuthResponse,
  AuthResponseType,
  ErrorResponse,
  ErrorResponseType,
} from '@resources';
import { logger } from '@server';
import {
  EmailService,
  hashPassword,
  signJwt,
  verifyPassword,
} from '@utilities';

export default function (
  fastify: FastifyInstance,
  _: FastifyPluginOptions,
  done: any,
) {
  fastify.post<{
    Body: AuthRegisterType;
    Reply: AuthResponseType | ErrorResponseType;
  }>(
    '/register',
    {
      schema: {
        body: AuthRegister,
        response: {
          200: AuthResponse,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { body } = request;

      const email = body.email.toLowerCase();
      const handle = body.handle.toLowerCase();

      const existingUser = await db.query.user.findFirst({
        where: or(eq(user.email, email), eq(user.handle, handle)),
      });

      if (existingUser) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.userAlreadyExists });
      }

      const password = await hashPassword(body.password);

      const jwtSecret = randomBytes(20).toString('hex').toUpperCase();

      const [{ id }] = await db
        .insert(user)
        .values({
          email,
          password,
          name: body.name,
          handle,
          jwtSecret,
        })
        .returning({ id: user.id });

      const jwt = await signJwt({ id }, jwtSecret);

      EmailService.send(
        body.email,
        'Welcome to Popli',
        `Welcome to Popli, ${body.name}!\n\nWe're excited to have you on board.`,
      )
        .then(() => logger.info(`Email sent to ${body.email}`))
        .catch(() => {});

      return reply.send({ token: jwt });
    },
  );

  fastify.post<{
    Body: AuthLoginType;
    Reply: AuthResponseType | ErrorResponseType;
  }>(
    '/login',
    {
      schema: {
        body: AuthLogin,
        response: {
          200: AuthResponse,
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.email, email.toLowerCase()),
      });

      if (!account) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.invalidCredentials });
      }

      const isPasswordValid = await verifyPassword(password, account.password);

      if (!isPasswordValid) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.invalidCredentials });
      }

      const jwt = await signJwt({ id: account.id }, account.jwtSecret);

      return reply.send({ token: jwt });
    },
  );

  fastify.post<{
    Body: AuthRequestPasswordResetType;
    Reply: null | ErrorResponseType;
  }>(
    '/request-password-reset',
    {
      schema: {
        body: AuthRequestPasswordReset,
        response: {
          200: Type.Null(),
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.email, email.toLowerCase()),
      });

      if (!account) {
        return reply.send();
      }

      const code = randomBytes(3).toString('hex');
      const jwtSecret = randomBytes(20).toString('hex').toUpperCase();

      await db
        .update(user)
        .set({
          passwordResetCode: code,
          passwordResetCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
          jwtSecret,
        })
        .where(eq(user.id, account.id));

      EmailService.send(
        email,
        'Password Reset Request',
        `Use the code below to reset your password:\n\n${code}`,
      )
        .then(() => logger.info(`Email sent to ${email}`))
        .catch(() => {});

      return reply.send();
    },
  );

  fastify.post<{
    Body: AuthResetPasswordType;
    Reply: null | ErrorResponseType;
  }>(
    '/reset-password',
    {
      schema: {
        body: AuthResetPassword,
        response: {
          200: Type.Null(),
          400: ErrorResponse,
        },
      },
    },
    async (request, reply) => {
      const { email, code, password } = request.body;

      const account = await db.query.user.findFirst({
        where: eq(user.email, email.toLowerCase()),
      });

      if (!account) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.accountNotFound });
      }

      if (account.passwordResetCode !== code) {
        return reply.code(400).send({ error: config.errorMessage.invalidCode });
      }

      if (
        !account.passwordResetCodeExpiresAt ||
        new Date(account.passwordResetCodeExpiresAt).getTime() <
          new Date().getTime()
      ) {
        return reply
          .code(400)
          .send({ error: config.errorMessage.passwordResetCodeExpired });
      }

      const hashedPassword = await hashPassword(password);

      await db
        .update(user)
        .set({
          password: hashedPassword,
          passwordResetCode: null,
          passwordResetCodeExpiresAt: null,
        })
        .where(eq(user.id, account.id));

      return reply.send();
    },
  );

  return done();
}
