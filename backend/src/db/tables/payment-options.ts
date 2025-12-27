import { pgTable, text, boolean, timestamp, serial } from "drizzle-orm/pg-core";

// Payment options table with numeric IDs
export const paymentOptions = pgTable("payment_options", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  detalles: text("detalles").notNull(),
  activo: boolean("activo").notNull().default(true),
  fechaCreacion: timestamp("fecha_creacion").notNull().defaultNow(),
});

// Types
export type PaymentOption = typeof paymentOptions.$inferSelect;
export type NewPaymentOption = typeof paymentOptions.$inferInsert;
