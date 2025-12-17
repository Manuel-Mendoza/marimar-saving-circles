import { pgTable, text, integer, real, timestamp, uuid } from 'drizzle-orm/pg-core';
import { groupStatusEnum } from '../enums';

// Groups table
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  estado: groupStatusEnum('estado').notNull().default('SIN_COMPLETAR'),
  fechaInicio: timestamp('fecha_inicio'),
  fechaFinal: timestamp('fecha_final'),
  valor: real('valor').notNull(),
  semana: integer('semana').notNull(),
  mes: integer('mes').notNull(),
  turnoActual: text('turno_actual'),
});

// Types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
