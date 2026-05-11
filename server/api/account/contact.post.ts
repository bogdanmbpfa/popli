import { log } from 'evlog';

import { AccountContactYupSchema, type IAccountContactYup } from '~~/dtos';
import {
  EContactInquiryType,
  EEmailTemplate,
  EHttpStatusCode,
  EHttpStatusMessage,
} from '~~/enums';

const CONTACT_RECIPIENT_EMAIL = 'bogdan.mihaibucur.pfa@gmail.com';

const inquiryTypeLabels: Record<EContactInquiryType, string> = {
  [EContactInquiryType.GENERAL]: 'General support',
  [EContactInquiryType.BILLING]: 'Billing & subscriptions',
  [EContactInquiryType.TECHNICAL]: 'Technical issue',
  [EContactInquiryType.PARTNERSHIP]: 'Partnership / press',
  [EContactInquiryType.ABUSE]: 'Abuse, copyright, or illegal content',
  [EContactInquiryType.PRIVACY]: 'Privacy / data rights',
  [EContactInquiryType.OTHER]: 'Other',
};

export default defineEventHandler(async (event) => {
  const {
    public: { errorMessages },
  } = useRuntimeConfig();

  let body: IAccountContactYup;

  try {
    body = await readValidatedBody(event, (body) =>
      AccountContactYupSchema.validate(body),
    );
  } catch {
    throw createError({
      statusCode: EHttpStatusCode.BAD_REQUEST,
      statusMessage: EHttpStatusMessage.BAD_REQUEST,
      message: errorMessages.validationError,
    });
  }

  try {
    await sendEmail(
      CONTACT_RECIPIENT_EMAIL,
      `New contact inquiry from ${body.name}`,
      EEmailTemplate.CONTACT,
      {
        name: body.name,
        email: body.email.toLowerCase(),
        inquiryType: inquiryTypeLabels[body.inquiryType],
        message: body.message,
      },
    );
  } catch (error) {
    log.error({
      message: `Error sending contact email: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw createError({
      statusCode: EHttpStatusCode.INTERNAL_SERVER_ERROR,
      statusMessage: EHttpStatusMessage.INTERNAL_SERVER_ERROR,
      message: errorMessages.internalServerError,
    });
  }
});
