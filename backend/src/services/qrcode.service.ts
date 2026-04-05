import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, count, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

import { db, qrCodeModel, qrCodeScanModel } from '@database';
import {
  CreateQrCodeDTO,
  EQRCodeDataType,
  QrCodeAnalyticsDTO,
  QrCodeDTO,
} from '@resources';
import { processImage, StorageUtility } from '@utilities';
import { DateTime } from 'luxon';

@Injectable()
export class QrCodeService {
  private readonly logger = new Logger(QrCodeService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly storageUtility: StorageUtility,
  ) {}

  async createQrCode(userId: string, dto: CreateQrCodeDTO): Promise<void> {
    let imageUrl: string | null = null;

    if (dto.image) {
      try {
        const image = await processImage(dto.image.buffer, {
          width: 32,
          height: 32,
        });

        imageUrl = await this.storageUtility.upload(
          image,
          randomBytes(20).toString('hex'),
          'image/webp',
          'qr-code-images',
        );
      } catch (error) {
        this.logger.error('Error processing image', error);

        throw new BadRequestException(
          this.configService.get('errorMessage.fileRequired'),
        );
      }
    }

    await db.insert(qrCodeModel).values({
      userId,
      title: dto.title,
      imageUrl: imageUrl ?? null,
      dataType: dto.type,
      options: dto.options,
    });
  }

  async getQrCodes(userId: string): Promise<QrCodeDTO[]> {
    const qrCodes = await db.query.qrCodeModel.findMany({
      where: and(eq(qrCodeModel.userId, userId), isNull(qrCodeModel.deletedAt)),
      orderBy: [desc(qrCodeModel.createdAt)],
    });

    const totalScans = await db
      .select({
        qrCodeId: qrCodeScanModel.qrCodeId,
        totalScans: count(qrCodeScanModel.id),
      })
      .from(qrCodeScanModel)
      .where(
        inArray(
          qrCodeScanModel.qrCodeId,
          qrCodes.map((qrCode) => qrCode.id),
        ),
      )
      .groupBy(qrCodeScanModel.qrCodeId);

    const totalScansMap = new Map(
      totalScans.map((totalScan) => [totalScan.qrCodeId, totalScan.totalScans]),
    );

    const qrCodesDTO = await Promise.all(
      qrCodes.map(async (qrCode) => {
        let imageUrl: string | null = null;

        if (qrCode.imageUrl) {
          imageUrl = await this.storageUtility.getUrl(qrCode.imageUrl);
        }

        return {
          id: qrCode.id,
          userId: qrCode.userId,
          title: qrCode.title,
          imageUrl,
          dataType: qrCode.dataType as EQRCodeDataType,
          options: qrCode.options as Record<string, unknown>,
          totalScans: totalScansMap.get(qrCode.id) ?? 0,
          createdAt: qrCode.createdAt,
          updatedAt: qrCode.updatedAt,
          deletedAt: qrCode.deletedAt,
        };
      }),
    );

    return qrCodesDTO;
  }

  async getQrCodeAnalytics(
    userId: string,
    qrCodeId: string,
  ): Promise<QrCodeAnalyticsDTO> {
    const qrCode = await db.query.qrCodeModel.findFirst({
      where: and(
        eq(qrCodeModel.id, qrCodeId),
        eq(qrCodeModel.userId, userId),
        isNull(qrCodeModel.deletedAt),
      ),
    });

    if (!qrCode) {
      throw new BadRequestException('QR code not found');
    }

    const [
      totalScansResult,
      uniqueCountriesResult,
      countryDistribution,
      dailyScans,
    ] = await Promise.all([
      db
        .select({
          totalScans: count(qrCodeScanModel.id),
        })
        .from(qrCodeScanModel)
        .where(eq(qrCodeScanModel.qrCodeId, qrCodeId)),
      db
        .select({
          totalCountries: sql<number>`COUNT(DISTINCT ${qrCodeScanModel.countryCode})`,
        })
        .from(qrCodeScanModel)
        .where(eq(qrCodeScanModel.qrCodeId, qrCodeId)),
      db
        .select({
          country: qrCodeScanModel.country,
          countryCode: qrCodeScanModel.countryCode,
          totalScans: count(qrCodeScanModel.id),
        })
        .from(qrCodeScanModel)
        .where(eq(qrCodeScanModel.qrCodeId, qrCodeId))
        .groupBy(qrCodeScanModel.country, qrCodeScanModel.countryCode),
      db
        .select({
          date: sql<string>`to_char(scanned_at, 'YYYY-MM-DD')`,
          scans: count(qrCodeScanModel.id),
        })
        .from(qrCodeScanModel)
        .where(
          and(
            eq(qrCodeScanModel.qrCodeId, qrCodeId),
            gte(
              qrCodeScanModel.scannedAt,
              DateTime.now().minus({ days: 30 }).toJSDate(),
            ),
          ),
        )
        .groupBy(sql<string>`to_char(scanned_at, 'YYYY-MM-DD')`),
    ]);

    const totalScans = totalScansResult[0]?.totalScans ?? 0;
    const totalCountries = Number(
      uniqueCountriesResult[0]?.totalCountries ?? 0,
    );
    const averageScansPerCountry =
      totalCountries > 0 ? totalScans / totalCountries : 0;

    return {
      totalScans,
      totalCountries,
      averageScansPerCountry: Math.round(averageScansPerCountry * 100) / 100,
      countryDistribution: countryDistribution.map((item) => ({
        country: item.country,
        countryCode: item.countryCode,
        totalScans: item.totalScans,
      })),
      dailyScans,
    };
  }

  async deleteQrCode(userId: string, qrCodeId: string): Promise<void> {
    const qrCode = await db.query.qrCodeModel.findFirst({
      where: and(
        eq(qrCodeModel.id, qrCodeId),
        eq(qrCodeModel.userId, userId),
        isNull(qrCodeModel.deletedAt),
      ),
    });

    if (!qrCode) {
      throw new BadRequestException('QR code not found');
    }

    await db
      .update(qrCodeModel)
      .set({ deletedAt: new Date() })
      .where(eq(qrCodeModel.id, qrCodeId));
  }
}
