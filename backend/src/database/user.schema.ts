import {
  pgSchema,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
  inet,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const userManagementSchema = pgSchema('user_management');

export const userModel = userManagementSchema.table(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    handle: varchar('handle', { length: 40 }).notNull().unique(),
    profileImage: varchar('profile_image', { length: 255 }),
    coverImage: varchar('cover_image', { length: 255 }),
    bio: text('bio'),
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
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    uniqueIndex('idx_users_email').on(table.email),
    uniqueIndex('idx_users_handle').on(table.handle),
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
