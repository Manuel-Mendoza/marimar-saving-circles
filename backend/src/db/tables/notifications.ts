import { pgTable, text, boolean, timestamp, serial } from "drizzle-orm/pg-core";

// Notifications table with numeric IDs
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").notNull(),
  tipo: text("tipo").notNull(),
  titulo: text("titulo").notNull(),
  mensaje: text("mensaje").notNull(),
  leido: boolean("leido").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Types
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
