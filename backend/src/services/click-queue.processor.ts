import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { UAParser } from '@ua-parser-js/pro-business';
import type { Job } from 'bullmq';
import { and, eq, isNull } from 'drizzle-orm';

import {
  db,
  linkClickModel,
  linkModel,
  profileAccessModel,
  profileModel,
} from '@database';
import {
  EJobName,
  EQueueName,
  IUrlIpApiResponse,
  LinkClickJobDTO,
  ProfileAccessJobDTO,
} from '@resources';

@Injectable()
@Processor(EQueueName.CLICK)
export class ClickQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ClickQueueProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async process(
    job: Job<LinkClickJobDTO | ProfileAccessJobDTO, unknown, EJobName>,
  ): Promise<void> {
    this.logger.log(`Job ${job.id}: Processing ${job.name} job`);

    if (job.name === EJobName.CLICK_LINK) {
      return await this.processLinkClick(job.data as LinkClickJobDTO);
    }

    if (job.name === EJobName.CLICK_PROFILE) {
      return await this.processProfileAccess(job.data as ProfileAccessJobDTO);
    }
  }

  private async processLinkClick(data: LinkClickJobDTO): Promise<void> {
    const link = await db.query.linkModel.findFirst({
      where: and(eq(linkModel.id, data.linkId), isNull(linkModel.deletedAt)),
    });

    if (!link) return;

    const ipData = await this.getIpData(data.ipAddress);
    const { userAgent, deviceType, browser, os } = this.parseUserAgent(
      data.requestUserAgent,
    );

    await db.insert(linkClickModel).values({
      linkId: link.id,
      ipAddress: ipData.ipAddress,
      country: ipData.countryName,
      countryCode: ipData.countryCode,
      userAgent,
      deviceType,
      browser,
      os,
      referrer: data.requestReferrer || null,
      clickedAt: new Date(),
    });
  }

  private async processProfileAccess(data: ProfileAccessJobDTO): Promise<void> {
    const profile = await db.query.profileModel.findFirst({
      where: and(
        eq(profileModel.handle, data.handle),
        isNull(profileModel.deletedAt),
      ),
    });

    if (!profile) return;

    const ipData = await this.getIpData(data.ipAddress);
    const { deviceType, browser, os } = this.parseUserAgent(
      data.requestUserAgent,
    );

    await db.insert(profileAccessModel).values({
      userId: profile.userId,
      ipAddress: ipData.ipAddress,
      country: ipData.countryName,
      countryCode: ipData.countryCode,
      userAgent: data.requestUserAgent,
      deviceType,
      browser,
      os,
      referrer: data.requestReferrer || null,
      accessedAt: new Date(),
    });
  }

  private parseUserAgent(requestUserAgent: string) {
    const result = new UAParser(requestUserAgent).getResult();

    return {
      userAgent: result.ua,
      deviceType: result.device.type,
      browser: result.browser.name,
      os: result.os.name,
    };
  }

  private async getIpData(ipAddress: string): Promise<IUrlIpApiResponse> {
    try {
      const { data } = await this.httpService.axiosRef.get<IUrlIpApiResponse>(
        // `${this.configService.get('ipApi.baseUrl')}/api/json/${ipAddress}`,
        `${this.configService.get('ipApi.baseUrl')}/api/json/82.78.167.144`,
        {
          transformResponse: (responseData) => JSON.parse(responseData),
        },
      );

      if (data.isProxy) {
        throw new BadRequestException(
          this.configService.get('errorMessage.ipProxy'),
        );
      }

      return data;
    } catch (error) {
      this.logger.error(
        `Error getting IP data for ${ipAddress}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
