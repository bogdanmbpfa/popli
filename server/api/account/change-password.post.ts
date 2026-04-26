import { hash, verify } from 'argon2';
import { eq } from 'drizzle-orm';

import {
  AccountChangePasswordYupSchema,
  type IAccountChangePasswordYup,
} from '~~/dtos';
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
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const account = await db.query.userModel.findFirst({
    where: eq(userModel.id, id),
  });

  if (!account) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: errorMessages.accountNotFound,
    });
  }

  const isPasswordValid = await verify(account.password, body.currentPassword);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.invalidCredentials,
    });
  }

  const isSamePassword = await verify(account.password, body.newPassword);

  if (isSamePassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.passwordSameAsCurrent,
    });
  }

  await db
    .update(userModel)
    .set({ password: await hash(body.newPassword) })
    .where(eq(userModel.id, id));
});
