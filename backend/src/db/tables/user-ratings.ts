import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";

// User ratings table for reputation system
export const userRatings = pgTable("user_ratings", {
  id: serial("id").primaryKey(),
  raterId: integer("rater_id").notNull(), // Quién califica
  ratedId: integer("rated_id").notNull(), // Quién recibe calificación
  groupId: integer("group_id"), // Contexto del grupo (opcional para ratings generales)
  ratingType: text("rating_type").notNull(), // 'PAYMENT', 'DELIVERY', 'COMMUNICATION'
  rating: integer("rating").notNull(), // 1-5 estrellas
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Índices para performance
export const userRatingsIndexes = {
  // Índice compuesto para búsquedas eficientes
  raterRatedGroupType: "idx_user_ratings_rater_rated_group_type",
  // Índice para calificaciones por usuario calificado
  ratedId: "idx_user_ratings_rated_id",
  // Índice para calificaciones por grupo
  groupId: "idx_user_ratings_group_id",
  // Índice por tipo de calificación
  ratingType: "idx_user_ratings_type",
};

// Restricciones únicas
export const userRatingsConstraints = {
  // Una calificación por tipo, por grupo, por par de usuarios
  uniqueRatingPerTypeGroup: "unique_rating_per_type_group",
};

// Types
export type UserRating = typeof userRatings.$inferSelect;
export type NewUserRating = typeof userRatings.$inferInsert;

// Enums para tipos de calificación
export const RatingType = {
  PAYMENT: "PAYMENT",
  DELIVERY: "DELIVERY",
  COMMUNICATION: "COMMUNICATION",
} as const;

export type RatingType = (typeof RatingType)[keyof typeof RatingType];

// Pesos para el cálculo de reputación
export const RATING_WEIGHTS = {
  [RatingType.PAYMENT]: 0.6, // 60% - más crítico
  [RatingType.DELIVERY]: 0.3, // 30% - importante
  [RatingType.COMMUNICATION]: 0.1, // 10% - menos crítico
} as const;
