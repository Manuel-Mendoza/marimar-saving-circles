import { pgEnum } from "drizzle-orm/pg-core";

// Enums
export const userTypeEnum = pgEnum("user_type", ["USUARIO", "ADMINISTRADOR"]);
export const groupStatusEnum = pgEnum("group_status", [
  "SIN_COMPLETAR",
  "LLENO",
  "EN_MARCHA",
  "COMPLETADO",
]);
export const paymentTypeEnum = pgEnum("payment_type", ["MOVIL", "BINANCE"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "INFO",
  "WARNING",
  "SUCCESS",
  "ERROR",
]);
