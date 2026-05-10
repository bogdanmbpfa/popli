import { eq } from 'drizzle-orm';
import { log } from 'evlog';
import { DateTime } from 'luxon';
import { randomBytes } from 'node:crypto';
import { generate } from 'randomstring';

import {
  AuthRequestPasswordResetYupSchema,
  type IAuthRequestPasswordResetYup,
} from '~~/dtos';
import { EEmailTemplate, EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    brevo,
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAuthRequestPasswordResetYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AuthRequestPasswordResetYupSchema.validate(body),
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
      where: eq(userModel.email, body.email.toLowerCase()),
    });

    if (!account) {
      throw createError({
        statusCode: EHttpStatusCode.BAD_REQUEST,
        statusMessage: EHttpStatusMessage.BAD_REQUEST,
        message: errorMessages.invalidCredentials,
      });
    }

    const code = generate({ length: 6, charset: 'numeric' });
    const jwtSecret = randomBytes(20).toString('hex').toUpperCase();
    const now = DateTime.now();
    const expiresAt = now.plus({ minutes: 30 });

    await db
      .update(userModel)
      .set({
        passwordResetCode: code,
        passwordResetCodeExpiresAt: expiresAt.toJSDate(),
        jwtSecret,
      })
      .where(eq(userModel.id, account.id));

    await sendEmail(
      body.email.toLowerCase(),
      'Reset your password',
      EEmailTemplate.PASSWORD_RESET,
      {
        code,
        expiresIn: `${expiresAt.diff(now, 'minutes').minutes} minutes`,
      },
    );
  } catch (error) {
    log.error({
      message: `Error requesting password reset: ${
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
