import { eq } from 'drizzle-orm';
import { generate } from 'randomstring';

import {
  AccountRequestEmailUpdateYupSchema,
  type IAccountRequestEmailUpdateYup,
} from '~~/dtos';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    brevo,
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id } = await isAuthenticated(event);
  
  let body: IAccountRequestEmailUpdateYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountRequestEmailUpdateYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.validationError,
    });
  }

  const accountWithSameEmail = await db.query.userModel.findFirst({
    where: eq(userModel.email, body.email.toLowerCase()),
  });

  if (accountWithSameEmail) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.emailAlreadyExists,
    });
  }

  const code = generate({ length: 6, charset: 'numeric' });

  await db
    .update(userModel)
    .set({
      emailConfirmationCode: code,
      emailConfirmationCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
    })
    .where(eq(userModel.id, id));

  await sendEmail(body.email.toLowerCase(), brevo.templates.emailUpdate, {
    code,
  });
});
