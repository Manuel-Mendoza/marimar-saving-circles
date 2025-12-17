import { pgTable, text, integer, timestamp, uuid } from 'drizzle-orm/pg-core';
import { groups } from './groups';

// Lottery results table
export const lotteryResults = pgTable('lottery_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  ganadorId: text('ganador_id').notNull(),
  posicion: integer('posicion').notNull(),
  fecha: timestamp('fecha').notNull().defaultNow(),
});

// Types
export type LotteryResult = typeof lotteryResults.$inferSelect;
export type NewLotteryResult = typeof lotteryResults.$inferInsert;
