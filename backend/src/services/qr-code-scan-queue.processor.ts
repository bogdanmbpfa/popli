import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { UAParser } from '@ua-parser-js/pro-business';
import type { Job } from 'bullmq';
import { and, eq, isNull } from 'drizzle-orm';

import { db, qrCodeModel, qrCodeScanModel } from '@database';
import {
  EJobName,
  EQueueName,
  IUrlIpApiResponse,
  QrCodeScanJobDTO,
} from '@resources';

@Injectable()
@Processor(EQueueName.QR_CODE_SCAN)
export class QrCodeScanQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QrCodeScanQueueProcessor.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    super();
  }

  async process(job: Job<QrCodeScanJobDTO, unknown, EJobName>): Promise<void> {
    this.logger.log(`Job ${job.id}: Processing ${job.name} job`);

    if (job.name === EJobName.SCAN_QR_CODE) {
      return await this.processQrCodeScan(job.data);
    }
  }

  private async processQrCodeScan(data: QrCodeScanJobDTO): Promise<void> {
    const qrCode = await db.query.qrCodeModel.findFirst({
      where: and(
        eq(qrCodeModel.id, data.qrCodeId),
        isNull(qrCodeModel.deletedAt),
      ),
    });

    if (!qrCode) return;

    const ipData = await this.getIpData(data.ipAddress);
    const { userAgent, deviceType, browser, os } = this.parseUserAgent(
      data.requestUserAgent,
    );

    await db.insert(qrCodeScanModel).values({
      qrCodeId: qrCode.id,
      userId: qrCode.userId,
      ipAddress: ipData.ipAddress,
      country: ipData.countryName,
      countryCode: ipData.countryCode,
      userAgent,
      deviceType,
      browser,
      os,
      referrer: data.requestReferrer || null,
      scannedAt: new Date(),
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
        `${this.configService.get('ipApi.baseUrl')}/api/json/${ipAddress}`,
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
