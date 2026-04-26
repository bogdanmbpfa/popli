import { eq } from 'drizzle-orm';

import {
  AccountVerifyEmailYupSchema,
  type IAccountVerifyEmailYup,
} from '~~/dtos';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  let body: IAccountVerifyEmailYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountVerifyEmailYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const user = await db.query.userModel.findFirst({
    where: eq(userModel.id, id),
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.accountNotFound,
    });
  }

  if (user.emailConfirmedAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.emailAlreadyConfirmed,
    });
  }

  if (body.code !== user.emailConfirmationCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.invalidCode,
    });
  }

  if (
    user.emailConfirmationCodeExpiresAt &&
    new Date(user.emailConfirmationCodeExpiresAt).getTime() < Date.now()
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.emailConfirmationCodeExpired,
    });
  }

  await db
    .update(userModel)
    .set({
      emailConfirmationCode: null,
      emailConfirmationCodeExpiresAt: null,
      emailConfirmedAt: new Date(),
    })
    .where(eq(userModel.id, id));
});
