import { pgTable, integer, timestamp, serial, varchar } from 'drizzle-orm/pg-core';
import { users } from '../tables/users';
import { groups } from '../tables/groups';

// User-Group junction table with numeric IDs
export const userGroups = pgTable('user_groups', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  posicion: integer('posicion'), // Posición del participante en el grupo (1, 2, 3, ...) - null hasta sorteo admin
  productoSeleccionado: varchar('producto_seleccionado', { length: 255 }), // Producto elegido por el usuario
  monedaPago: varchar('moneda_pago', { length: 3 }), // Moneda de pago: 'VES' o 'USD'
  fechaUnion: timestamp('fecha_union').notNull().defaultNow(),
});

// Types
export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;
