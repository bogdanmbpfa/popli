import { hash, verify } from 'argon2';
import { eq } from 'drizzle-orm';
import { log } from 'evlog';

import { AuthLoginYupSchema, type IAuthLoginYup } from '~~/dtos';
import { authSessionModel, db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAuthLoginYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AuthLoginYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const email = body.email.toLowerCase();

  try {
    const account = await db.query.userModel.findFirst({
      where: eq(userModel.email, email),
    });

    if (!account) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.invalidCredentials,
      });
    }

    const isPasswordValid = await verify(account.password, body.password);

    if (!isPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: errorMessages.invalidCredentials,
      });
    }

    const { token, refreshToken } = await generateAuthTokens(
      account.id,
      account.jwtSecret,
      account.refreshTokenSecret,
    );

    const ipAddress = getClientIp(event);
    const userAgent = getRequestHeader(event, 'user-agent')!;

    await db
      .insert(authSessionModel)
      .values({
        userId: account.id,
        refreshToken: await hash(refreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        ipAddress,
        userAgent,
      })
      .onConflictDoUpdate({
        target: [authSessionModel.ipAddress],
        set: {
          refreshToken: await hash(refreshToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

    setAuthCookies(event, token, refreshToken);
  } catch (error) {
    log.error({
      message: `Error logging in: ${
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
