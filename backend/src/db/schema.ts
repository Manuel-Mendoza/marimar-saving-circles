import { pgTable, text, integer, real, boolean, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userTypeEnum = pgEnum('user_type', ['USUARIO', 'ADMINISTRADOR']);
export const groupStatusEnum = pgEnum('group_status', ['SIN_COMPLETAR', 'LLENO', 'EN_MARCHA', 'COMPLETADO']);
export const paymentTypeEnum = pgEnum('payment_type', ['MOVIL', 'BINANCE']);
export const notificationTypeEnum = pgEnum('notification_type', ['INFO', 'WARNING', 'SUCCESS', 'ERROR']);

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
  ultimoAcceso: timestamp('ultimo_acceso'),
});

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

// User-Group junction table
export const userGroups = pgTable('user_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  fechaUnion: timestamp('fecha_union').notNull().defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  valorMensual: real('valor_mensual').notNull(),
  valorQuincenal: real('valor_quincenal').notNull(),
  tiempoDuracion: integer('tiempo_duracion').notNull(),
  imagen: text('imagen'),
  descripcion: text('descripcion').notNull(),
});

// Lottery results table
export const lotteryResults = pgTable('lottery_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  ganadorId: text('ganador_id').notNull(),
  posicion: integer('posicion').notNull(),
  fecha: timestamp('fecha').notNull().defaultNow(),
});

// Payment options table
export const paymentOptions = pgTable('payment_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: paymentTypeEnum('tipo').notNull(),
  detalles: text('detalles').notNull(),
  activo: boolean('activo').notNull().default(true),
  fechaCreacion: timestamp('fecha_creacion').notNull().defaultNow(),
});

// Chat sessions table
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  sessionId: text('session_id').notNull().unique(),
  messages: text('messages').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  tipo: notificationTypeEnum('tipo').notNull(),
  titulo: text('titulo').notNull(),
  mensaje: text('mensaje').notNull(),
  leido: boolean('leido').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

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

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;

export type UserGroup = typeof userGroups.$inferSelect;
export type NewUserGroup = typeof userGroups.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type LotteryResult = typeof lotteryResults.$inferSelect;
export type NewLotteryResult = typeof lotteryResults.$inferInsert;

export type PaymentOption = typeof paymentOptions.$inferSelect;
export type NewPaymentOption = typeof paymentOptions.$inferInsert;

export type ChatSession = typeof chatSessions.$inferSelect;
export type NewChatSession = typeof chatSessions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
