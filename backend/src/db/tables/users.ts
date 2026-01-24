import {
  pgTable,
  text,
  timestamp,
  serial,
  integer,
  decimal,
} from "drizzle-orm/pg-core";

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
  reputationScore: decimal("reputation_score", {
    precision: 4,
    scale: 2,
  }).default("10.00"),
  totalRatings: integer("total_ratings").default(0),
  paymentReliability: decimal("payment_reliability", {
    precision: 4,
    scale: 2,
  }).default("10.00"),
  deliveryReliability: decimal("delivery_reliability", {
    precision: 4,
    scale: 2,
  }).default("10.00"),
  lastRatingUpdate: timestamp("last_rating_update").defaultNow(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Índices para búsquedas eficientes
export const usersIndexes = {
  // Índice compuesto para búsquedas por email y estado
  emailEstado: "idx_users_email_estado",
  // Índice para búsquedas por cédula
  cedula: "idx_users_cedula",
  // Índice para búsquedas por tipo de usuario
  tipo: "idx_users_tipo",
  // Índice para búsquedas por estado
  estado: "idx_users_estado",
  // Índice para búsquedas por reputación
  reputationScore: "idx_users_reputation_score",
  // Índice para búsquedas por fecha de registro
  fechaRegistro: "idx_users_fecha_registro",
  // Índice para búsquedas por último acceso
  ultimoAcceso: "idx_users_ultimo_acceso",
};

// Restricciones únicas
export const usersConstraints = {
  // Email único
  uniqueEmail: "unique_email",
  // Cédula única
  uniqueCedula: "unique_cedula",
  // Combinación única de cédula y email
  uniqueCedulaEmail: "unique_cedula_email",
};

// Índices para relaciones
export const usersRelationsIndexes = {
  // Índice para relaciones con userGroups
  idForUserGroups: "idx_users_id_for_user_groups",
  // Índice para relaciones con contributions
  idForContributions: "idx_users_id_for_contributions",
  // Índice para relaciones con deliveries
  idForDeliveries: "idx_users_id_for_deliveries",
  // Índice para relaciones con userRatings
  idForUserRatings: "idx_users_id_for_user_ratings",
  // Índice para relaciones con paymentRequests
  idForPaymentRequests: "idx_users_id_for_payment_requests",
  // Índice para relaciones con productSelections
  idForProductSelections: "idx_users_id_for_product_selections",
};
