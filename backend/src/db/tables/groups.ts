import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core';

// Groups table with numeric auto-increment ID
export const groups = pgTable('groups', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  duracionMeses: integer('duracion_meses').notNull(), // Duración del grupo en meses
  estado: text('estado').notNull().default('SIN_COMPLETAR'),
  fechaInicio: timestamp('fecha_inicio'),
  fechaFinal: timestamp('fecha_final'),
  turnoActual: integer('turno_actual').default(1), // Mes actual del ciclo (1, 2, 3, ...)
});

// Types
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
