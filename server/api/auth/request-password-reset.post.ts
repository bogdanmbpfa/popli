import { eq } from 'drizzle-orm';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';

import {
  AuthRequestPasswordResetYupSchema,
  type IAuthRequestPasswordResetYup,
} from '~~/dtos';
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

    const code = randomBytes(3).toString('hex');
    const jwtSecret = randomBytes(20).toString('hex').toUpperCase();

    await db
      .update(userModel)
      .set({
        passwordResetCode: code,
        passwordResetCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 30),
        jwtSecret,
      })
      .where(eq(userModel.id, account.id));

    await sendEmail(body.email.toLowerCase(), brevo.templates.passwordReset, {
      code,
    });
  } catch (error) {
    log.error({
      message: `Error requesting password reset: ${
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
