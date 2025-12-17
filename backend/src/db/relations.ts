import { relations } from 'drizzle-orm';
import { users } from './tables/users';
import { groups } from './tables/groups';
import { userGroups } from './tables/user-groups';
import { lotteryResults } from './tables/lottery-results';

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  grupos: many(userGroups),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  participantes: many(userGroups),
  sorteos: many(lotteryResults),
}));

export const userGroupsRelations = relations(userGroups, ({ one }) => ({
  user: one(users, {
    fields: [userGroups.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [userGroups.groupId],
    references: [groups.id],
  }),
}));

export const lotteryResultsRelations = relations(lotteryResults, ({ one }) => ({
  group: one(groups, {
    fields: [lotteryResults.groupId],
    references: [groups.id],
  }),
}));
