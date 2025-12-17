import { pgTable, text, integer, real, uuid } from 'drizzle-orm/pg-core';

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  valorMensual: real('valor_mensual').notNull(),
  valorQuincenal: real('valor_quincenal').notNull(),
  tiempoDuracion: integer('tiempo_duracion').notNull(),
  imagen: text('imagen'),
  descripcion: text('descripcion').notNull(),
});

// Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
