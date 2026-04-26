import { hash } from 'argon2';
import { eq } from 'drizzle-orm';
import { log } from 'evlog';
import { randomBytes } from 'node:crypto';

import { AuthRegisterYupSchema, type IAuthRegisterYup } from '~~/dtos';
import {
  authSessionModel,
  db,
  profileModel,
  userModel,
} from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    brevo,
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAuthRegisterYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AuthRegisterYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  let token: string;
  let refreshToken: string;

  try {
    await db.transaction(async (tx) => {
      const existingUser = await tx.query.userModel.findFirst({
        where: eq(userModel.email, body.email.toLowerCase()),
      });

      if (existingUser) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Bad Request',
          message: errorMessages.userAlreadyExists,
        });
      }

      const hashedPassword = await hash(body.password);

      const jwtSecret = randomBytes(20).toString('hex').toUpperCase();
      const refreshTokenSecret = randomBytes(20).toString('hex').toUpperCase();

      const [user] = await tx
        .insert(userModel)
        .values({
          email: body.email.toLowerCase(),
          password: hashedPassword,
          jwtSecret,
          refreshTokenSecret,
        })
        .returning({ id: userModel.id });

      const tokens = await generateAuthTokens(
        user!.id,
        jwtSecret,
        refreshTokenSecret,
      );

      token = tokens.token;
      refreshToken = tokens.refreshToken;

      const ipAddress = getClientIp(event);

      const existingSession = await tx.query.authSessionModel.findFirst({
        where: eq(authSessionModel.ipAddress, ipAddress),
      });

      if (existingSession) {
        await tx
          .delete(authSessionModel)
          .where(eq(authSessionModel.id, existingSession.id));
      }

      await tx.insert(authSessionModel).values({
        userId: user!.id,
        refreshToken: await hash(refreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day
        ipAddress,
        userAgent: getRequestHeader(event, 'user-agent')!,
      });

      await tx.insert(profileModel).values({ userId: user!.id });

      await sendEmail(body.email.toLowerCase(), brevo.templates.welcome);
    });
  } catch (error) {
    log.error({
      message: `Error registering user: ${
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

  return { token: token!, refreshToken: refreshToken! };
});
