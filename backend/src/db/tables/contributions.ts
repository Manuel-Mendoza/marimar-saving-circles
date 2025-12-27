import {
  pgTable,
  text,
  real,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "../tables/users";
import { groups } from "../tables/groups";

// Contributions table with numeric IDs
export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  monto: real("monto").notNull(),
  moneda: text("moneda").notNull().default("USD"), // USD o VES
  fechaPago: timestamp("fecha_pago"),
  periodo: text("periodo").notNull(), // ej: "2025-01", "mes-1", etc.
  metodoPago: text("metodo_pago"), // referencia a paymentOptions
  estado: text("estado").notNull().default("PENDIENTE"), // PENDIENTE, CONFIRMADO, RECHAZADO
  referenciaPago: text("referencia_pago"), // Número de referencia del pago
});

// Types
export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;
