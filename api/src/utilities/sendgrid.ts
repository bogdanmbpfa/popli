import { MailService } from '@sendgrid/mail';

import config from '@config';

class SendGridClient {
  private client: MailService;
  private static _instance: SendGridClient;

  private constructor() {
    this.client = new MailService();
    this.client.setApiKey(config.sendgrid.apiKey as string);
  }

  public static get instance(): SendGridClient {
    if (!SendGridClient._instance) {
      SendGridClient._instance = new SendGridClient();
    }

    return SendGridClient._instance;
  }

  public async send(email: string, subject: string, text: string) {
    await this.client.send({
      to: email,
      from: `${config.sendgrid.from.name} <${config.sendgrid.from.email}>`,
      subject,
      text,
      // html,
    });
  }
}

export const EmailService = SendGridClient.instance;
