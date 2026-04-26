import { eq } from 'drizzle-orm';

import {
  AccountUpdateProfileYupSchema,
  type IAccountUpdateProfileYup,
} from '~~/dtos';
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
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
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
    })
    .where(eq(profileModel.userId, id));
});
