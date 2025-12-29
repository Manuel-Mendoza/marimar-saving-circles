import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { eq, and, desc, SQL, isNull } from "drizzle-orm";

import { db } from "../config/database.js";
import { userRatings, users } from "../db/index.js";
import { RatingType, RATING_WEIGHTS } from "../db/tables/user-ratings.js";
import { authenticate } from "../middleware/auth.js";

const router = new Hono();

// Validation schemas
const createRatingSchema = z.object({
  ratedId: z.number().int().positive(),
  groupId: z.number().int().positive().optional(),
  ratingType: z.enum(["PAYMENT", "DELIVERY", "COMMUNICATION"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

const ratingParamsSchema = z.object({
  id: z.string().transform((val) => parseInt(val, 10)),
});

// Helper function to calculate user reputation
async function calculateUserReputation(userId: number): Promise<number> {
  // Get all ratings for the user
  const ratings = await db
    .select()
    .from(userRatings)
    .where(eq(userRatings.ratedId, userId));

  if (ratings.length === 0) {
    return 10.0; // Default reputation
  }

  // Get user data for experience bonus
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const userData = user[0];
  if (!userData) return 10.0;

  const daysSinceRegistration = Math.floor(
    (Date.now() - new Date(userData.fechaRegistro).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Base reputation
  let reputation = 10.0;

  // Experience bonus (max +0.5 for 1 year)
  const experienceBonus = Math.min((daysSinceRegistration / 365) * 0.5, 0.5);
  reputation += experienceBonus;

  // Calculate penalties by type
  const penalties = {
    PAYMENT: 0,
    DELIVERY: 0,
    COMMUNICATION: 0,
  };

  ratings.forEach((rating) => {
    const deviation = 5 - rating.rating; // 5 is perfect
    const weight = RATING_WEIGHTS[rating.ratingType as RatingType];
    penalties[rating.ratingType as keyof typeof penalties] +=
      deviation * weight;
  });

  // Apply average penalty (max -3 points)
  const totalPenalty = Object.values(penalties).reduce(
    (sum, penalty) => sum + penalty,
    0,
  );
  const averagePenalty = Math.min(totalPenalty / ratings.length, 3);
  reputation -= averagePenalty;

  // Ensure minimum reputation
  return Math.max(Math.round(reputation * 100) / 100, 1.0);
}

// Helper function to update user reputation
async function updateUserReputation(userId: number): Promise<void> {
  const newReputation = await calculateUserReputation(userId);

  // Get current ratings count
  const ratingsCount = await db
    .select()
    .from(userRatings)
    .where(eq(userRatings.ratedId, userId));

  // Calculate reliability scores
  const paymentRatings = ratingsCount.filter((r) => r.ratingType === "PAYMENT");
  const deliveryRatings = ratingsCount.filter(
    (r) => r.ratingType === "DELIVERY",
  );

  const paymentAvg =
    paymentRatings.length > 0
      ? paymentRatings.reduce((sum, r) => sum + r.rating, 0) /
        paymentRatings.length
      : 10.0;

  const deliveryAvg =
    deliveryRatings.length > 0
      ? deliveryRatings.reduce((sum, r) => sum + r.rating, 0) /
        deliveryRatings.length
      : 10.0;

  await db
    .update(users)
    .set({
      reputationScore: newReputation.toString(),
      totalRatings: ratingsCount.length,
      paymentReliability: paymentAvg.toString(),
      deliveryReliability: deliveryAvg.toString(),
      lastRatingUpdate: new Date(),
    })
    .where(eq(users.id, userId));
}

// POST /api/users/:id/rate - Create a new rating
router.post(
  "/users/:id/rate",
  authenticate,
  zValidator("param", ratingParamsSchema),
  zValidator("json", createRatingSchema),
  async (c) => {
    try {
      const { id: ratedUserId } = c.req.valid("param");
      const { ratedId, groupId, ratingType, rating, comment } =
        c.req.valid("json");
      const raterUser = c.get("user");

      // Validate that ratedId matches the URL parameter
      if (ratedId !== ratedUserId) {
        return c.json({ error: "ID de usuario no coincide" }, 400);
      }

      // Cannot rate yourself
      if (raterUser.id === ratedId) {
        return c.json({ error: "No puedes calificarte a ti mismo" }, 400);
      }

      // Check if rating already exists for this type/group/user combination
      let whereCondition: SQL;
      if (groupId) {
        whereCondition = and(
          eq(userRatings.raterId, raterUser.id),
          eq(userRatings.ratedId, ratedId),
          eq(userRatings.ratingType, ratingType),
          eq(userRatings.groupId, groupId),
        )!;
      } else {
        whereCondition = and(
          eq(userRatings.raterId, raterUser.id),
          eq(userRatings.ratedId, ratedId),
          eq(userRatings.ratingType, ratingType),
          isNull(userRatings.groupId),
        )!;
      }

      const existingRating = await db
        .select()
        .from(userRatings)
        .where(whereCondition)
        .limit(1);

      if (existingRating.length > 0) {
        return c.json(
          { error: "Ya has calificado a este usuario por este concepto" },
          409,
        );
      }

      // Create the rating
      const newRating = await db
        .insert(userRatings)
        .values({
          raterId: raterUser.id,
          ratedId,
          groupId: groupId || null,
          ratingType,
          rating,
          comment: comment || null,
        })
        .returning();

      // Update user reputation
      await updateUserReputation(ratedId);

      return c.json({
        success: true,
        rating: newRating[0],
      });
    } catch (error) {
      console.error("Error creating rating:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  },
);

// GET /api/users/:id/ratings - Get ratings received by user
router.get(
  "/users/:id/ratings",
  authenticate,
  zValidator("param", ratingParamsSchema),
  async (c) => {
    try {
      const { id: userId } = c.req.valid("param");

      const ratings = await db
        .select({
          id: userRatings.id,
          raterId: userRatings.raterId,
          ratingType: userRatings.ratingType,
          rating: userRatings.rating,
          comment: userRatings.comment,
          createdAt: userRatings.createdAt,
          rater: {
            nombre: users.nombre,
            apellido: users.apellido,
          },
        })
        .from(userRatings)
        .leftJoin(users, eq(userRatings.raterId, users.id))
        .where(eq(userRatings.ratedId, userId))
        .orderBy(desc(userRatings.createdAt));

      return c.json({ ratings });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  },
);

// GET /api/users/:id/reputation - Get user reputation
router.get(
  "/users/:id/reputation",
  zValidator("param", ratingParamsSchema),
  async (c) => {
    try {
      const { id: userId } = c.req.valid("param");

      const user = await db
        .select({
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          reputationScore: users.reputationScore,
          totalRatings: users.totalRatings,
          paymentReliability: users.paymentReliability,
          deliveryReliability: users.deliveryReliability,
          lastRatingUpdate: users.lastRatingUpdate,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return c.json({ error: "Usuario no encontrado" }, 404);
      }

      const userData = user[0]!;

      // Calculate status based on reputation
      let status = "Desconocido";
      const score = parseFloat(userData.reputationScore || "0");

      if (score >= 9.0) status = "Excelente";
      else if (score >= 7.0) status = "Confiable";
      else if (score >= 5.0) status = "Aceptable";
      else status = "Bajo Observación";

      return c.json({
        user: {
          id: userData.id,
          nombre: userData.nombre,
          apellido: userData.apellido,
        },
        reputation: {
          score: parseFloat(userData.reputationScore || "0"),
          status,
          totalRatings: userData.totalRatings || 0,
          paymentReliability: parseFloat(userData.paymentReliability || "0"),
          deliveryReliability: parseFloat(userData.deliveryReliability || "0"),
          lastUpdate: userData.lastRatingUpdate,
        },
      });
    } catch (error) {
      console.error("Error fetching reputation:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  },
);

// DELETE /api/ratings/:id - Delete rating (admin only)
router.delete(
  "/ratings/:id",
  authenticate,
  zValidator(
    "param",
    z.object({ id: z.string().transform((val) => parseInt(val, 10)) }),
  ),
  async (c) => {
    try {
      const { id: ratingId } = c.req.valid("param");
      const user = c.get("user");

      // Only admins can delete ratings
      if (user.tipo !== "ADMINISTRADOR") {
        return c.json(
          { error: "Solo administradores pueden eliminar calificaciones" },
          403,
        );
      }

      // Get the rating to know which user to update
      const rating = await db
        .select()
        .from(userRatings)
        .where(eq(userRatings.id, ratingId))
        .limit(1);

      if (rating.length === 0) {
        return c.json({ error: "Calificación no encontrada" }, 404);
      }

      const ratedUserId = rating[0]!.ratedId;

      // Delete the rating
      await db.delete(userRatings).where(eq(userRatings.id, ratingId));

      // Update user reputation
      await updateUserReputation(ratedUserId);

      return c.json({ success: true });
    } catch (error) {
      console.error("Error deleting rating:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  },
);

export default router;
