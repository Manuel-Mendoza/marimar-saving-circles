import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userTypeEnum } from '../enums';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  apellido: text('apellido').notNull(),
  cedula: text('cedula').notNull().unique(),
  telefono: text('telefono').notNull(),
  direccion: text('direccion').notNull(),
  correoElectronico: text('correo_electronico').notNull().unique(),
  password: text('password').notNull(),
  tipo: userTypeEnum('tipo').notNull().default('USUARIO'),
  fechaRegistro: timestamp('fecha_registro').notNull().defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
