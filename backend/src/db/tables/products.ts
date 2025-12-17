import { pgTable, text, integer, real, serial, boolean } from 'drizzle-orm/pg-core';

// Products table with numeric auto-increment ID
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  precioUsd: real('precio_usd').notNull(), // Precio en dólares
  precioVes: real('precio_ves').notNull(), // Precio en bolívares
  tiempoDuracion: integer('tiempo_duracion').notNull(), // Duración en meses
  imagen: text('imagen'),
  descripcion: text('descripcion').notNull(),
  activo: boolean('activo').notNull().default(true), // Producto disponible
});

// Types
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
