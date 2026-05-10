import { eq } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { generate } from 'randomstring';

import { EEmailTemplate, EHttpStatusCode, EHttpStatusMessage } from '~~/enums';
import { db, userModel } from '~~/server/database';

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  const { id, email, emailConfirmedAt } = await isAuthenticated(event);

  if (emailConfirmedAt) {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.emailAlreadyConfirmed,
    });
  }

  const code = generate({ length: 6, charset: 'numeric' });
  const now = DateTime.now();
  const expiresAt = now.plus({ minutes: 30 });

  await db
    .update(userModel)
    .set({
      emailConfirmationCode: code,
      emailConfirmationCodeExpiresAt: expiresAt.toJSDate(),
    })
    .where(eq(userModel.id, id));

  await sendEmail(email, 'Verify your email', EEmailTemplate.EMAIL_VERIFY, {
    code,
    expiresIn: `${expiresAt.diff(now, 'minutes').minutes} minutes`,
  });
});
