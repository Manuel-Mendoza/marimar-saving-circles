import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { notificationTypeEnum } from '../enums';

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  tipo: notificationTypeEnum('tipo').notNull(),
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje').notNull(),
  leido: boolean('leido').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
