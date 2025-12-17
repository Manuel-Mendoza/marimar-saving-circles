import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';
import { paymentTypeEnum } from '../enums';

// Payment options table
export const paymentOptions = pgTable('payment_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: paymentTypeEnum('tipo').notNull(),
  detalles: text('detalles').notNull(),
  activo: boolean('activo').notNull().default(true),
  fechaCreacion: timestamp('fecha_creacion').notNull().defaultNow(),
});

// Types
export type PaymentOption = typeof paymentOptions.$inferSelect;
export type NewPaymentOption = typeof paymentOptions.$inferInsert;
