import { pgTable, text, real, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { groups } from './groups';

// Contributions table - Registra las contribuciones/pagos de cada participante
export const contributions = pgTable('contributions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  monto: real('monto').notNull(),
  moneda: text('moneda').notNull().default('USD'), // USD o VES ⭐
  fechaPago: timestamp('fecha_pago').notNull().defaultNow(),
  periodo: text('periodo').notNull(), // ej: "2025-01", "mes-1", etc.
  metodoPago: text('metodo_pago'), // referencia a paymentOptions
  estado: text('estado').notNull().default('PENDIENTE'), // PENDIENTE, CONFIRMADO, RECHAZADO
  referenciaPago: text('referencia_pago'), // Número de referencia del pago
});

// Types
export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;
