import { eq } from 'drizzle-orm';

import {
  AccountUpdateEmailYupSchema,
  type IAccountUpdateEmailYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id, email: currentEmail } = await isAuthenticated(event);

  let body: IAccountUpdateEmailYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountUpdateEmailYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const newEmail = body.email.toLowerCase();

  if (currentEmail === newEmail) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.emailSameAsCurrent,
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
      email: newEmail,
      emailConfirmedAt: new Date(),
      emailConfirmationCode: null,
      emailConfirmationCodeExpiresAt: null,
    })
    .where(eq(userModel.id, id));
});
