import { eq } from 'drizzle-orm';

import {
  AccountVerifyEmailYupSchema,
  type IAccountVerifyEmailYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
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
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const user = await db.query.userModel.findFirst({
    where: eq(userModel.id, id),
  });

  if (!user) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.accountNotFound,
    });
  }

  if (user.emailConfirmedAt) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.emailAlreadyConfirmed,
    });
  }

  if (body.code !== user.emailConfirmationCode) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.invalidCode,
    });
  }

  if (
    user.emailConfirmationCodeExpiresAt &&
    new Date(user.emailConfirmationCodeExpiresAt).getTime() < Date.now()
  ) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
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
