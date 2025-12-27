import {
  pgTable,
  serial,
  integer,
  text,
  real,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { groups } from "./groups";

// Payment requests table - for user payment submissions that admin must approve
export const paymentRequests = pgTable("payment_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  groupId: integer("group_id")
    .notNull()
    .references(() => groups.id),
  periodo: text("periodo").notNull(), // "2025-01", "2025-02", etc.
  monto: real("monto").notNull(),
  moneda: text("moneda").notNull(), // 'VES' | 'USD'
  metodoPago: text("metodo_pago").notNull(), // "Transferencia", "Pago móvil", "Efectivo", etc.
  referenciaPago: text("referencia_pago"), // Número de referencia o comprobante
  comprobantePago: text("comprobante_pago"), // URL de imagen del comprobante (opcional para USD)
  estado: text("estado").notNull().default("PENDIENTE"), // 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO'
  fechaSolicitud: timestamp("fecha_solicitud").notNull().defaultNow(),
  fechaAprobacion: timestamp("fecha_aprobacion"),
  aprobadoPor: integer("aprobado_por").references(() => users.id), // Admin who approved
  notasAdmin: text("notas_admin"), // Admin comments/rejection reasons
  requiereComprobante: boolean("requiere_comprobante").notNull().default(true), // USD payments might not require digital receipt
});

// Types
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type NewPaymentRequest = typeof paymentRequests.$inferInsert;
