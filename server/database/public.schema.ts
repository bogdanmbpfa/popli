import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const fileModel = pgTable('files', {
  id: uuid('id').defaultRandom().primaryKey().unique().notNull(),
  path: varchar('path', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});
