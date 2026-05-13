import { hash, verify } from 'argon2';
import { and, eq, isNull } from 'drizzle-orm';

import {
  AccountChangePasswordYupSchema,
  type IAccountChangePasswordYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  let body: IAccountChangePasswordYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountChangePasswordYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const account = await db.query.userModel.findFirst({
    where: and(eq(userModel.id, id), isNull(userModel.deletedAt)),
  });

  if (!account) {
    throw createError({
      statusCode: EHttpStatusCode.NOT_FOUND,
      statusMessage: EHttpStatusMessage.NOT_FOUND,
      message: errorMessages.accountNotFound,
    });
  }

  const isPasswordValid = await verify(account.password, body.currentPassword);

  if (!isPasswordValid) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.invalidCredentials,
    });
  }

  const isSamePassword = await verify(account.password, body.newPassword);

  if (isSamePassword) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.passwordSameAsCurrent,
    });
  }

  await db
    .update(userModel)
    .set({ password: await hash(body.newPassword) })
    .where(eq(userModel.id, id));
});
