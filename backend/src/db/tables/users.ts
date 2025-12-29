import { pgTable, text, timestamp, serial, integer, decimal } from "drizzle-orm/pg-core";

// Users table with numeric auto-increment ID
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  apellido: text("apellido").notNull(),
  cedula: text("cedula").notNull().unique(),
  telefono: text("telefono").notNull(),
  direccion: text("direccion").notNull(),
  correoElectronico: text("correo_electronico").notNull().unique(),
  password: text("password").notNull(),
  tipo: text("tipo").notNull().default("USUARIO"),
  estado: text("estado").notNull().default("PENDIENTE"), // PENDIENTE, APROBADO, RECHAZADO, SUSPENDIDO, REACTIVADO
  imagenCedula: text("imagen_cedula"),
  imagenPerfil: text("imagen_perfil"),
  fechaRegistro: timestamp("fecha_registro").notNull().defaultNow(),
  ultimoAcceso: timestamp("ultimo_acceso"),
  aprobadoPor: integer("aprobado_por"), // ID del admin que aprobó
  fechaAprobacion: timestamp("fecha_aprobacion"),
  motivo: text("motivo"), // Razón del rechazo o eliminación
  // Campos del sistema de reputación
  reputationScore: decimal("reputation_score", { precision: 4, scale: 2 }).default("10.00"),
  totalRatings: integer("total_ratings").default(0),
  paymentReliability: decimal("payment_reliability", { precision: 4, scale: 2 }).default("10.00"),
  deliveryReliability: decimal("delivery_reliability", { precision: 4, scale: 2 }).default("10.00"),
  lastRatingUpdate: timestamp("last_rating_update").defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
