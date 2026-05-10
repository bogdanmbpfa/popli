import {
  pgSchema,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
  inet,
  index,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

import { EPlanType } from '~~/enums';

import { fileModel } from './public.schema';

export const planTypeEnum = pgEnum('plan_type', EPlanType);

export const userManagementSchema = pgSchema('user_management');

export const userModel = userManagementSchema.table(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull().unique(),
    emailConfirmationCode: varchar('email_confirmation_code', {
      length: 6,
    }).unique(),
    emailConfirmationCodeExpiresAt: timestamp(
      'email_confirmation_code_expires_at',
    ),
    emailConfirmedAt: timestamp('email_confirmed_at'),
    passwordResetCode: varchar('password_reset_code', {
      length: 6,
    }).unique(),
    passwordResetCodeExpiresAt: timestamp('password_reset_code_expires_at'),
    jwtSecret: varchar('jwt_secret', { length: 40 }).notNull().unique(),
    refreshTokenSecret: varchar('refresh_token_secret', { length: 40 })
      .notNull()
      .unique(),
    plan: planTypeEnum('plan')
      .notNull()
      .default(EPlanType.FREE)
      .$type<EPlanType>(),
    planStartedAt: timestamp('plan_started_at'),
    planEndsAt: timestamp('plan_ends_at'),
    stripeCustomerId: varchar('stripe_customer_id', { length: 255 }).unique(),
    stripeSubscriptionId: varchar('stripe_subscription_id', {
      length: 255,
    }).unique(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [uniqueIndex('idx_users_email').on(table.email)],
);

export const billingTransactionModel = userManagementSchema.table(
  'billing_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    stripeEventId: varchar('stripe_event_id', { length: 255 }),
    stripeInvoiceId: varchar('stripe_invoice_id', { length: 255 }).unique(),
    stripeCheckoutSessionId: varchar('stripe_checkout_session_id', {
      length: 255,
    }).unique(),
    stripeSubscriptionId: varchar('stripe_subscription_id', {
      length: 255,
    }),
    status: varchar('status', { length: 32 }).notNull(),
    currency: varchar('currency', { length: 8 }).notNull(),
    amount: integer('amount').notNull(),
    periodStart: timestamp('period_start'),
    periodEnd: timestamp('period_end'),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_billing_transactions_id').on(table.id),
    index('idx_billing_transactions_user_id').on(table.userId),
    index('idx_billing_transactions_stripe_event_id').on(table.stripeEventId),
  ],
);

export const billingWebhookEventModel = userManagementSchema.table(
  'billing_webhook_events',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    stripeEventId: varchar('stripe_event_id', { length: 255 })
      .notNull()
      .unique(),
    eventType: varchar('event_type', { length: 128 }).notNull(),
    payload: text('payload').notNull(),
    processedAt: timestamp('processed_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_billing_webhook_events_id').on(table.id),
    uniqueIndex('idx_billing_webhook_events_stripe_event_id').on(
      table.stripeEventId,
    ),
  ],
);

export const profileModel = userManagementSchema.table(
  'profiles',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    handle: varchar('handle', { length: 40 }).unique(),
    name: varchar('name', { length: 255 }),
    profileImageId: uuid('profile_image_id').references(() => fileModel.id),
    coverImageId: uuid('cover_image_id').references(() => fileModel.id),
    handleColor: varchar('handle_color', { length: 7 }),
    bio: text('bio'),
    bioColor: varchar('bio_color', { length: 7 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_profiles_id').on(table.id),
    uniqueIndex('idx_profiles_user_id').on(table.userId),
    uniqueIndex('idx_profiles_handle').on(table.handle),
  ],
);

export const authSessionModel = userManagementSchema.table(
  'auth_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    refreshToken: varchar('refresh_token', { length: 255 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: inet('ip_address').notNull(),
    userAgent: varchar('user_agent', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_auth_sessions_refresh_token').on(table.refreshToken),
    uniqueIndex('idx_auth_sessions_ip_address').on(table.ipAddress),
    index('idx_auth_sessions_user_id').on(table.userId),
  ],
);

export const profileAccessModel = userManagementSchema.table(
  'profile_access',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    userId: uuid('user_id').notNull(),
    ipAddress: inet('ip_address').notNull(),
    country: varchar('country', { length: 255 }).notNull(),
    countryCode: varchar('country_code', { length: 2 }).notNull(),
    deviceType: varchar('device_type', { length: 255 }),
    browser: varchar('browser', { length: 255 }),
    userAgent: varchar('user_agent', { length: 255 }).notNull(),
    os: varchar('os', { length: 255 }),
    referrer: text('referrer'),
    accessedAt: timestamp('accessed_at').notNull().defaultNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_profile_access_id').on(table.id),
    index('idx_profile_access_user_id').on(table.userId),
  ],
);

export const authSessionModelRelations = relations(
  authSessionModel,
  ({ one }) => ({
    user: one(userModel, {
      fields: [authSessionModel.userId],
      references: [userModel.id],
      relationName: 'user',
    }),
  }),
);

export const profileModelRelations = relations(profileModel, ({ one }) => ({
  user: one(userModel, {
    fields: [profileModel.userId],
    references: [userModel.id],
    relationName: 'user',
  }),
}));

export const profileAccessModelRelations = relations(
  profileAccessModel,
  ({ one }) => ({
    user: one(userModel, {
      fields: [profileAccessModel.userId],
      references: [userModel.id],
      relationName: 'user',
    }),
  }),
);

export const billingTransactionModelRelations = relations(
  billingTransactionModel,
  ({ one }) => ({
    user: one(userModel, {
      fields: [billingTransactionModel.userId],
      references: [userModel.id],
      relationName: 'user',
    }),
  }),
);

export type UserModel = typeof userModel.$inferSelect;
export type ProfileModel = typeof profileModel.$inferSelect;
export type AuthSessionModel = typeof authSessionModel.$inferSelect;
export type ProfileAccessModel = typeof profileAccessModel.$inferSelect;
export type BillingTransactionModel =
  typeof billingTransactionModel.$inferSelect;
export type BillingWebhookEventModel =
  typeof billingWebhookEventModel.$inferSelect;
