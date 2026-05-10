import {
  index,
  integer,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const fileModel = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
  path: varchar('path', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const usageCounterModel = pgTable(
  'usage_counters',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull().unique(),
    shortUrlCount: integer('short_url_count').notNull().default(0),
    qrCodeCount: integer('qr_code_count').notNull().default(0),
    primaryLinkCount: integer('primary_link_count').notNull().default(0),
    secondaryLinkCount: integer('secondary_link_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('idx_usage_counters_user_id').on(table.userId),
    index('idx_usage_counters_short_url_count').on(table.shortUrlCount),
    index('idx_usage_counters_qr_code_count').on(table.qrCodeCount),
    index('idx_usage_counters_primary_link_count').on(table.primaryLinkCount),
    index('idx_usage_counters_secondary_link_count').on(table.secondaryLinkCount),
  ],
);
