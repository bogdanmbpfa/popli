import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailUtilityService {
  private readonly logger = new Logger(EmailUtilityService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendEmail(
    email: string,
    templateId: number,
    params?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.httpService.axiosRef.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: {
            name: 'Popli',
            email: 'no-reply@popli.one',
          },
          to: [{ email }],
          templateId,
          params,
        },
        {
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            'api-key': this.configService.get('brevo.apiKey'),
          },
        },
      );

      this.logger.log(`Email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Error sending email to ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
