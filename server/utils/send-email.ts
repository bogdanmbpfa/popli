import { log } from 'evlog';
import { readFile } from 'node:fs/promises';

import { EEmailTemplate } from '~~/enums';

export default async function sendEmail(
  email: string,
  subject: string,
  emailTemplate: EEmailTemplate,
  params?: Record<string, unknown>,
) {
  const { brevo } = useRuntimeConfig();

  const html = await readFile(`${process.cwd()}/emails/${emailTemplate}`, 'utf-8');

  try {
    await $fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      body: {
        sender: {
          name: 'Popli',
          email: 'no-reply@popli.one',
        },
        to: [{ email }],
        subject,
        htmlContent: html,
        params,
      },
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': brevo.apiKey,
      },
    });

    log.info({ message: `Email sent to ${email}` });
  } catch (error) {
    log.error({
      message: `Error sending email to ${email}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
