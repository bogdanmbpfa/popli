import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { ELinkPlatform, ELinkType } from '@resources';

import { userModel } from './user.schema';

export const urlManagementSchema = pgSchema('url_management');

export const linkType = pgEnum('link_type', ELinkType);
export const linkPlatform = pgEnum('link_platform', ELinkPlatform);

export const shortUrlModel = urlManagementSchema.table(
  'short_urls',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    url: varchar('url', { length: 255 }).notNull(),
    shortCode: varchar('short_code', { length: 16 }).notNull().unique(),
    alias: varchar('alias', { length: 255 }).unique(),
    title: varchar('title', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_short_urls_id').on(table.id),
    index('idx_short_urls_user_id').on(table.userId),
    uniqueIndex('idx_short_urls_short_code').on(table.shortCode),
    uniqueIndex('idx_short_urls_alias').on(table.alias),
  ],
);

export const shortUrlClickModel = urlManagementSchema.table(
  'short_url_clicks',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    shortUrlId: uuid('short_url_id').notNull(),
    ipAddress: varchar('ip_address', { length: 40 }).notNull(),
    country: varchar('country', { length: 255 }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }).notNull(),
    deviceType: varchar('device_type', { length: 255 }),
    browser: varchar('browser', { length: 255 }),
    os: varchar('os', { length: 255 }),
    referrer: text('referrer'),
    clickedAt: timestamp('clicked_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_short_url_clicks_id').on(table.id),
    index('idx_short_url_clicks_short_url_id').on(table.shortUrlId),
    index('idx_short_url_clicks_country').on(table.country),
    index('idx_short_url_clicks_device_type').on(table.deviceType),
    index('idx_short_url_clicks_browser').on(table.browser),
    index('idx_short_url_clicks_os').on(table.os),
    index('idx_short_url_clicks_referrer').on(table.referrer),
    index('idx_short_url_clicks_clicked_at').on(table.clickedAt),
  ],
);

export const linkModel = urlManagementSchema.table(
  'links',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    type: linkType('type').notNull(),
    platform: linkPlatform('platform'),
    url: varchar('url', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    backgroundImage: varchar('background_image', { length: 255 }),
    titleColors: jsonb('title_colors').default('[]'),
    backgroundColors: jsonb('background_colors').default('[]'),
    position: integer('position').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_links_id').on(table.id),
    index('idx_links_user_id').on(table.userId),
    index('idx_links_type').on(table.type),
  ],
);

export const linkClickModel = urlManagementSchema.table(
  'link_clicks',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    linkId: uuid('link_id').notNull(),
    ipAddress: varchar('ip_address', { length: 40 }).notNull(),
    country: varchar('country', { length: 255 }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    userAgent: varchar('user_agent', { length: 255 }).notNull(),
    deviceType: varchar('device_type', { length: 255 }),
    browser: varchar('browser', { length: 255 }),
    os: varchar('os', { length: 255 }),
    referrer: text('referrer'),
    clickedAt: timestamp('clicked_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_link_clicks_id').on(table.id),
    index('idx_link_clicks_link_id').on(table.linkId),
    index('idx_link_clicks_ip_address').on(table.ipAddress),
    index('idx_link_clicks_country').on(table.country),
    index('idx_link_clicks_country_code').on(table.countryCode),
    index('idx_link_clicks_user_agent').on(table.userAgent),
    index('idx_link_clicks_device_type').on(table.deviceType),
    index('idx_link_clicks_browser').on(table.browser),
    index('idx_link_clicks_os').on(table.os),
    index('idx_link_clicks_referrer').on(table.referrer),
    index('idx_link_clicks_clicked_at').on(table.clickedAt),
  ],
);

export const urlRelations = relations(shortUrlModel, ({ one, many }) => ({
  user: one(userModel, {
    fields: [shortUrlModel.userId],
    references: [userModel.id],
  }),
  clicks: many(shortUrlClickModel),
}));

export const shortUrlClickRelations = relations(
  shortUrlClickModel,
  ({ one }) => ({
    shortUrl: one(shortUrlModel, {
      fields: [shortUrlClickModel.shortUrlId],
      references: [shortUrlModel.id],
    }),
  }),
);

export const linkRelations = relations(linkModel, ({ one, many }) => ({
  user: one(userModel, {
    fields: [linkModel.userId],
    references: [userModel.id],
  }),
  clicks: many(linkClickModel),
}));

export const linkClickRelations = relations(linkClickModel, ({ one }) => ({
  link: one(linkModel, {
    fields: [linkClickModel.linkId],
    references: [linkModel.id],
  }),
}));
