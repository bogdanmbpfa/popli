import { eq } from 'drizzle-orm';

import {
  AccountCheckEmailYupSchema,
  type IAccountCheckEmailYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAccountCheckEmailYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountCheckEmailYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const account = await db.query.userModel.findFirst({
    where: eq(userModel.email, body.email.toLowerCase()),
  });

  if (account) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.emailAlreadyExists,
    });
  }
});
