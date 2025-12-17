import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

// Users table with numeric auto-increment ID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  cedula: text('cedula').notNull().unique(),
  telefono: text('telefono').notNull(),
  direccion: text('direccion').notNull(),
  correoElectronico: text('correo_electronico').notNull().unique(),
  password: text('password').notNull(),
  tipo: text('tipo').notNull().default('USUARIO'),
  fechaRegistro: timestamp('fecha_registro').notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
