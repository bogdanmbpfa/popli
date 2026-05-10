import { eq } from 'drizzle-orm';

import {
  AccountUpdateProfileYupSchema,
  type IAccountUpdateProfileYup,
} from '~~/dtos';
import { EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, profileModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);

  let body: IAccountUpdateProfileYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountUpdateProfileYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  await db
    .update(profileModel)
    .set({
      ...(body.name && { name: body.name }),
      ...(body.handle && { handle: body.handle }),
      ...(body.handleColor && { handleColor: body.handleColor }),
      ...(body.bio && { bio: body.bio }),
      ...(body.bioColor && { bioColor: body.bioColor }),
      ...(body.profileImageId && { profileImageId: body.profileImageId }),
      ...(body.coverImageId && { coverImageId: body.coverImageId }),
    })
    .where(eq(profileModel.userId, id));
});
