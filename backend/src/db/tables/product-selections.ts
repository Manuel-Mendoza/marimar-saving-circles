import { pgTable, integer, timestamp, serial, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { products } from './products';

// Product selections table for automatic group formation
export const productSelections = pgTable('product_selections', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  estado: varchar('estado', { length: 20 }).notNull().default('PENDIENTE'), // PENDIENTE, EN_GRUPO, COMPLETADO
  fechaSeleccion: timestamp('fecha_seleccion').notNull().defaultNow(),
});

// Types
export type ProductSelection = typeof productSelections.$inferSelect;
export type NewProductSelection = typeof productSelections.$inferInsert;
