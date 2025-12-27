import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";
import { users } from "../tables/users";
import { groups } from "../tables/groups";

// Deliveries table with numeric IDs
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  productName: text("product_name").notNull(), // Nombre del producto entregado
  productValue: text("product_value").notNull(), // Valor del producto
  fechaEntrega: timestamp("fecha_entrega").notNull().defaultNow(),
  mesEntrega: text("mes_entrega").notNull(), // Mes en que se entregó (ej: "2025-01")
  estado: text("estado").notNull().default("ENTREGADO"), // ENTREGADO, PENDIENTE
  notas: text("notas"), // Notas adicionales sobre la entrega
});

// Types
export type Delivery = typeof deliveries.$inferSelect;
export type NewDelivery = typeof deliveries.$inferInsert;
