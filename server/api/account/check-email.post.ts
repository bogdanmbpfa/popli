import { eq } from 'drizzle-orm';

import {
  AccountCheckEmailYupSchema,
  type IAccountCheckEmailYup,
} from '~~/dtos';
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
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const account = await db.query.userModel.findFirst({
    where: eq(userModel.email, body.email.toLowerCase()),
  });

  if (account) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.emailAlreadyExists,
    });
  }
});
