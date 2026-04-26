import { eq } from 'drizzle-orm';

import {
  AccountCheckHandleYupSchema,
  type IAccountCheckHandleYup,
} from '~~/dtos';
import { db, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAccountCheckHandleYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountCheckHandleYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const profile = await db.query.profileModel.findFirst({
    where: eq(profileModel.handle, body.handle.toLowerCase()),
  });

  if (profile) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.handleAlreadyExists,
    });
  }
});
