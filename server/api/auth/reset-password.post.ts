import { hash } from 'argon2';
import { and, eq, isNull } from 'drizzle-orm';
import { log } from 'evlog';

import {
  AuthResetPasswordYupSchema,
  type IAuthResetPasswordYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
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
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  try {
    const account = await db.query.userModel.findFirst({
      where: and(
        eq(userModel.email, body.email.toLowerCase()),
        isNull(userModel.deletedAt),
      ),
    });

    if (!account) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.invalidCredentials,
      });
    }

    if (account.passwordResetCode !== body.code) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.invalidCode,
      });
    }

    if (
      !account.passwordResetCodeExpiresAt ||
      new Date(account.passwordResetCodeExpiresAt).getTime() < Date.now()
    ) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
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
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
