import { eq } from 'drizzle-orm';
import { generate } from 'randomstring';

import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    brevo,
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id, email, emailConfirmedAt } = await isAuthenticated(event);

  if (emailConfirmedAt) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: errorMessages.emailAlreadyConfirmed,
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

  await sendEmail(email, brevo.templates.emailVerification, { code });
});
