import { eq } from 'drizzle-orm';

import {
  AccountCheckHandleYupSchema,
  type IAccountCheckHandleYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
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
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  const profile = await db.query.profileModel.findFirst({
    where: eq(profileModel.handle, body.handle.toLowerCase()),
  });

  if (profile) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.handleAlreadyExists,
    });
  }
});
