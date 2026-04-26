import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { log } from 'evlog';

import {
  AuthResetPasswordYupSchema,
  type IAuthResetPasswordYup,
} from '~~/dtos';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAuthResetPasswordYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AuthResetPasswordYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  try {
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, body.email.toLowerCase()),
    });

    if (!account) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.invalidCredentials,
      });
    }

    if (account.passwordResetCode !== body.code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.invalidCode,
      });
    }

    if (
      !account.passwordResetCodeExpiresAt ||
      new Date(account.passwordResetCodeExpiresAt).getTime() < Date.now()
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.passwordResetCodeExpired,
      });
    }

    const hashedPassword = await hash(body.password);

    await db
      .update(userModel)
      .set({
        password: hashedPassword,
        passwordResetCode: null,
        passwordResetCodeExpiresAt: null,
      })
      .where(eq(userModel.id, account.id));
  } catch (error) {
    log.error({
      message: `Error resetting password: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: errorMessages.internalServerError,
    });
  }
});
