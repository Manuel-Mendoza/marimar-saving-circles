import { pgTable, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { groups } from './groups';

// User-Group junction table
export const userGroups = pgTable('user_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  posicion: integer('posicion').notNull(), // Posición del participante en el grupo (1, 2, 3, ...)
  fechaUnion: timestamp('fecha_union').notNull().defaultNow(),
});

// Types
export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;
