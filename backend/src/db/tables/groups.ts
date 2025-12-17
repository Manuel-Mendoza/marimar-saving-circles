import { pgTable, text, integer, real, timestamp, uuid } from 'drizzle-orm/pg-core';
import { groupStatusEnum } from '../enums';

// Groups table
export const groups = pgTable('groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  duracionMeses: integer('duracion_meses').notNull(), // Duración del grupo en meses ⭐
  estado: groupStatusEnum('estado').notNull().default('SIN_COMPLETAR'),
  fechaInicio: timestamp('fecha_inicio'),
  fechaFinal: timestamp('fecha_final'),
  turnoActual: integer('turno_actual').default(1), // Mes actual del ciclo (1, 2, 3, ...)
});

// Types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
