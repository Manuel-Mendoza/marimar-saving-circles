import { relations } from 'drizzle-orm';
import { users } from './tables/users';
import { groups } from './tables/groups';
import { userGroups } from './tables/user-groups';
import { contributions } from './tables/contributions';
import { deliveries } from './tables/deliveries';

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  grupos: many(userGroups),
  contribuciones: many(contributions),
  entregas: many(deliveries),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  participantes: many(userGroups),
  contribuciones: many(contributions),
  entregas: many(deliveries),
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

export const contributionsRelations = relations(contributions, ({ one }) => ({
  user: one(users, {
    fields: [contributions.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [contributions.groupId],
    references: [groups.id],
  }),
}));

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  user: one(users, {
    fields: [deliveries.userId],
    references: [users.id],
  }),
  group: one(groups, {
    fields: [deliveries.groupId],
    references: [groups.id],
  }),
}));
