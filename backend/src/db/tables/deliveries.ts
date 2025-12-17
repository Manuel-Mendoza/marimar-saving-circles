import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { groups } from './groups';

// Deliveries table - Registro de entregas de productos a participantes
export const deliveries = pgTable('deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(), // Nombre del producto entregado
  productValue: text('product_value').notNull(), // Valor del producto
  fechaEntrega: timestamp('fecha_entrega').notNull().defaultNow(),
  mesEntrega: text('mes_entrega').notNull(), // Mes en que se entregó (ej: "2025-01")
  estado: text('estado').notNull().default('ENTREGADO'), // ENTREGADO, PENDIENTE
  notas: text('notas'), // Notas adicionales sobre la entrega
});

// Types
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
