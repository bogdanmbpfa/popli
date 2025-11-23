import {
  jsonb,
  pgEnum,
  pgSchema,
  timestamp,
  text,
  uuid,
  varchar,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { EQRCodeDataType } from '@resources';

import { userModel } from './user.schema';

export const qrCodeDataType = pgEnum(
  'qr_code_data_type',
  Object.values(EQRCodeDataType) as [string, ...string[]],
);

export const qrCodeSchema = pgSchema('qr_code_management');

export const qrCodeModel = qrCodeSchema.table(
  'qr_codes',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    imageUrl: varchar('image_url', { length: 255 }),
    dataType: qrCodeDataType('data_type').notNull(),
    options: jsonb('options').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_qr_codes_id').on(table.id),
    index('idx_qr_codes_user_id').on(table.userId),
  ],
);

export const qrCodeScanModel = qrCodeSchema.table(
  'qr_code_scans',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    qrCodeId: uuid('qr_code_id').notNull(),
    userId: uuid('user_id').notNull(),
    ipAddress: varchar('ip_address', { length: 40 }).notNull(),
    country: varchar('country', { length: 255 }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }).notNull(),
    deviceType: varchar('device_type', { length: 255 }),
    browser: varchar('browser', { length: 255 }),
    os: varchar('os', { length: 255 }),
    referrer: text('referrer'),
    scannedAt: timestamp('scanned_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_qr_code_scans_id').on(table.id),
    index('idx_qr_code_scans_qr_code_id').on(table.qrCodeId),
    index('idx_qr_code_scans_user_id').on(table.userId),
    index('idx_qr_code_scans_country').on(table.country),
    index('idx_qr_code_scans_device_type').on(table.deviceType),
    index('idx_qr_code_scans_browser').on(table.browser),
    index('idx_qr_code_scans_os').on(table.os),
    index('idx_qr_code_scans_referrer').on(table.referrer),
    index('idx_qr_code_scans_scanned_at').on(table.scannedAt),
  ],
);

export const qrCodeRelations = relations(qrCodeModel, ({ one, many }) => ({
  user: one(userModel, {
    fields: [qrCodeModel.userId],
    references: [userModel.id],
  }),
  scans: many(qrCodeScanModel),
}));

export const qrCodeScanRelations = relations(qrCodeScanModel, ({ one }) => ({
  qrCode: one(qrCodeModel, {
    fields: [qrCodeScanModel.qrCodeId],
    references: [qrCodeModel.id],
  }),
}));
