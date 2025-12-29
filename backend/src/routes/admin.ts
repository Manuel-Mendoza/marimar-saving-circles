import { Hono } from "hono";
import { eq, count, sql, sum, and, gte, lte, desc } from "drizzle-orm";
import { users } from "../db/tables/users.js";
import { groups } from "../db/tables/groups.js";
import { products } from "../db/tables/products.js";
import { paymentRequests } from "../db/tables/payment-requests.js";
import { userRatings } from "../db/tables/user-ratings.js";
import { contributions } from "../db/tables/contributions.js";
import { userGroups } from "../db/tables/user-groups.js";
import { deliveries } from "../db/tables/deliveries.js";
import { db } from "../config/database.js";
import { authenticate } from "../middleware/auth.js";
import { broadcastToGroup } from "../server.js";

// JWT payload type
interface JWTPayload {
  id: number;
  nombre?: string;
  apellido?: string;
  correoElectronico?: string;
  tipo?: string;
  iat?: number;
  exp?: number;
}

const adminRoute = new Hono();

// Get admin dashboard statistics - Admin only
adminRoute.get("/dashboard-stats", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    // Get current month dates for revenue calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Execute all statistics queries in parallel for better performance
    const [
      totalUsersResult,
      activeUsersResult,
      pendingApprovalsResult,
      totalProductsResult,
      activeProductsResult,
      totalGroupsResult,
      activeGroupsResult,
      completedGroupsResult,
      totalPaymentsResult,
      pendingPaymentsResult,
      monthlyRevenueResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: count() }).from(users),

      // Active users (APROBADO or REACTIVADO)
      db.select({ count: count() }).from(users).where(
        sql`${users.estado} IN ('APROBADO', 'REACTIVADO')`
      ),

      // Pending approvals
      db.select({ count: count() }).from(users).where(eq(users.estado, "PENDIENTE")),

      // Total products (all products, not just active)
      db.select({ count: count() }).from(products),

      // Active products
      db.select({ count: count() }).from(products).where(eq(products.activo, true)),

      // Total groups
      db.select({ count: count() }).from(groups),

      // Active groups (EN_MARCHA)
      db.select({ count: count() }).from(groups).where(eq(groups.estado, "EN_MARCHA")),

      // Completed groups (COMPLETADO)
      db.select({ count: count() }).from(groups).where(eq(groups.estado, "COMPLETADO")),

      // Total payment requests
      db.select({ count: count() }).from(paymentRequests),

      // Pending payments
      db.select({ count: count() }).from(paymentRequests).where(eq(paymentRequests.estado, "PENDIENTE")),

      // Monthly revenue (sum of CONFIRMADO payments this month)
      db.select({
        total: sum(paymentRequests.monto)
      })
        .from(paymentRequests)
        .where(
          and(
            eq(paymentRequests.estado, "CONFIRMADO"),
            gte(paymentRequests.fechaAprobacion, startOfMonth),
            lte(paymentRequests.fechaAprobacion, endOfMonth)
          )
        ),
    ]);

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      activeUsers: activeUsersResult[0]?.count || 0,
      pendingApprovals: pendingApprovalsResult[0]?.count || 0,
      totalProducts: totalProductsResult[0]?.count || 0,
      activeProducts: activeProductsResult[0]?.count || 0,
      totalGroups: totalGroupsResult[0]?.count || 0,
      activeGroups: activeGroupsResult[0]?.count || 0,
      totalPayments: totalPaymentsResult[0]?.count || 0,
      pendingPayments: pendingPaymentsResult[0]?.count || 0,
      monthlyRevenue: Number(monthlyRevenueResult[0]?.total || 0),
    };

    return c.json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get admin dashboard charts data - Admin only
adminRoute.get("/dashboard-charts", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    // Get data for the last 12 months
    const now = new Date();
    const revenueData: Array<{ mes: string; ingresos: number }> = [];
    const userGroupData: Array<{ mes: string; usuarios: number; grupos: number }> = [];

    // Prepare all queries for parallel execution
    const queries = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleDateString('es-ES', { month: 'short' });

      queries.push({
        monthName,
        revenueQuery: db.select({
          total: sum(paymentRequests.monto)
        })
          .from(paymentRequests)
          .where(
            and(
              eq(paymentRequests.estado, "CONFIRMADO"),
              gte(paymentRequests.fechaAprobacion, monthStart),
              lte(paymentRequests.fechaAprobacion, monthEnd)
            )
          ),
        usersQuery: db.select({ count: count() })
          .from(users)
          .where(
            and(
              gte(users.fechaRegistro, monthStart),
              lte(users.fechaRegistro, monthEnd)
            )
          ),
        groupsQuery: db.select({ count: count() })
          .from(groups)
          .where(
            and(
              gte(groups.fechaInicio, monthStart),
              lte(groups.fechaInicio, monthEnd)
            )
          ),
      });
    }

    // Execute all queries in parallel
    const results = await Promise.all(
      queries.map(async (query) => {
        const [revenueResult, usersResult, groupsResult] = await Promise.all([
          query.revenueQuery,
          query.usersQuery,
          query.groupsQuery,
        ]);

        return {
          monthName: query.monthName,
          revenue: Number(revenueResult[0]?.total || 0),
          users: usersResult[0]?.count || 0,
          groups: groupsResult[0]?.count || 0,
        };
      })
    );

    // Build response data
    results.forEach((result) => {
      revenueData.push({
        mes: result.monthName,
        ingresos: result.revenue,
      });

      userGroupData.push({
        mes: result.monthName,
        usuarios: result.users,
        grupos: result.groups,
      });
    });

    return c.json({
      success: true,
      data: {
        revenueData,
        userGroupData,
      },
    });
  } catch (error) {
    console.error("Error obteniendo datos de gráficas del dashboard:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get all ratings for admin management - Admin only
adminRoute.get("/ratings", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    // Get all ratings first
    const ratings = await db
      .select()
      .from(userRatings)
      .orderBy(desc(userRatings.createdAt));

    // For now, return simplified data
    const simplifiedRatings = ratings.map(rating => ({
      id: rating.id,
      raterId: rating.raterId,
      ratedId: rating.ratedId,
      groupId: rating.groupId,
      ratingType: rating.ratingType,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      rater: {
        nombre: 'Usuario', // Will be enhanced later
        apellido: 'Desconocido'
      },
      rated: {
        nombre: 'Usuario',
        apellido: 'Desconocido'
      },
      group: null, // Will be enhanced later
    }));

    // Calculate reputation statistics
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    let excellentUsers = 0;
    let reliableUsers = 0;
    let acceptableUsers = 0;
    let underObservationUsers = 0;
    let totalReputation = 0;

    for (const user of allUsers) {
      const userReputation = parseFloat(user.reputationScore || '0');
      totalReputation += userReputation;

      if (userReputation >= 9.0) excellentUsers++;
      else if (userReputation >= 7.0) reliableUsers++;
      else if (userReputation >= 5.0) acceptableUsers++;
      else underObservationUsers++;
    }

    const averageReputation = totalUsers > 0 ? totalReputation / totalUsers : 0;

    const stats = {
      totalUsers,
      averageReputation: Math.round(averageReputation * 100) / 100,
      excellentUsers,
      reliableUsers,
      acceptableUsers,
      underObservationUsers,
      totalRatings: ratings.length,
    };

    return c.json({
      success: true,
      data: {
        ratings: simplifiedRatings,
        stats,
      },
    });
  } catch (error) {
    console.error("Error obteniendo datos de calificaciones:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Advance group to next month - Admin only
adminRoute.post("/groups/:id/advance-month", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const groupId = parseInt(c.req.param("id"));
    const { deliveryNotes } = await c.req.json();

    // Get group details
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return c.json(
        {
          success: false,
          message: "Grupo no encontrado",
        },
        404,
      );
    }

    if (group.estado !== "EN_MARCHA") {
      return c.json(
        {
          success: false,
          message: "El grupo debe estar en marcha para avanzar mes",
        },
        400,
      );
    }

    // Check if all contributions for current month are confirmed
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const pendingContributions = await db
      .select()
      .from(contributions)
      .where(
        and(
          eq(contributions.groupId, groupId),
          eq(contributions.periodo, currentPeriod),
          eq(contributions.estado, "PENDIENTE")
        )
      );

    if (pendingContributions.length > 0) {
      return c.json(
        {
          success: false,
          message: `Hay ${pendingContributions.length} contribuciones pendientes para este mes`,
        },
        400,
      );
    }

    // Check if current turn user exists
    const currentTurn = group.turnoActual || 1;
    const [currentTurnUser] = await db
      .select({
        userId: userGroups.userId,
        posicion: userGroups.posicion,
        productoSeleccionado: userGroups.productoSeleccionado,
        user: {
          nombre: users.nombre,
          apellido: users.apellido,
        },
      })
      .from(userGroups)
      .innerJoin(users, eq(userGroups.userId, users.id))
      .where(
        and(
          eq(userGroups.groupId, groupId),
          eq(userGroups.posicion, currentTurn)
        )
      )
      .limit(1);

    if (!currentTurnUser) {
      return c.json(
        {
          success: false,
          message: "No se encontró el usuario del turno actual",
        },
        400,
      );
    }

    // Create delivery record
    await db.insert(deliveries).values({
      userId: currentTurnUser.userId,
      groupId: groupId,
      productName: currentTurnUser.productoSeleccionado || "Producto del grupo",
      productValue: "Pendiente", // Will be updated when actual product is selected
      mesEntrega: currentPeriod,
      estado: "ENTREGADO",
      notas: deliveryNotes || `Entrega automática - Mes ${currentTurn}`,
    });

    // Advance to next turn
    const nextTurn = currentTurn + 1;
    const isCompleted = nextTurn > group.duracionMeses;

    await db
      .update(groups)
      .set({
        turnoActual: nextTurn,
        estado: isCompleted ? "COMPLETADO" : "EN_MARCHA",
        fechaFinal: isCompleted ? new Date() : null,
      })
      .where(eq(groups.id, groupId));

    // Broadcast update to group members
    broadcastToGroup(groupId, {
      type: "MONTH_ADVANCED",
      groupId,
      newTurn: nextTurn,
      completed: isCompleted,
      deliveryUser: {
        id: currentTurnUser.userId,
        name: `${currentTurnUser.user.nombre} ${currentTurnUser.user.apellido}`,
        position: currentTurnUser.posicion,
        product: currentTurnUser.productoSeleccionado,
      },
    });

    return c.json({
      success: true,
      message: isCompleted
        ? "Grupo completado exitosamente"
        : `Mes avanzado exitosamente. Turno ${nextTurn} activado.`,
      data: {
        groupId,
        previousTurn: group.turnoActual,
        newTurn: nextTurn,
        completed: isCompleted,
        deliveryCreated: true,
      },
    });
  } catch (error) {
    console.error("Error avanzando mes del grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Mark delivery as completed manually - Admin only
adminRoute.put("/deliveries/:id/complete", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const deliveryId = parseInt(c.req.param("id"));
    const { notas } = await c.req.json();

    const updatedDelivery = await db
      .update(deliveries)
      .set({
        estado: "ENTREGADO",
        notas: notas || "Entrega confirmada por administrador",
      })
      .where(eq(deliveries.id, deliveryId))
      .returning();

    if (updatedDelivery.length === 0) {
      return c.json(
        {
          success: false,
          message: "Entrega no encontrada",
        },
        404,
      );
    }

    const delivery = updatedDelivery[0];
    if (!delivery) {
      return c.json(
        {
          success: false,
          message: "Error obteniendo datos de la entrega",
        },
        500,
      );
    }

    // Check if group should be completed
    const allDeliveries = await db
      .select()
      .from(deliveries)
      .where(eq(deliveries.groupId, delivery.groupId));

    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, delivery.groupId))
      .limit(1);

    if (group && allDeliveries.length >= group.duracionMeses) {
      await db
        .update(groups)
        .set({
          estado: "COMPLETADO",
          fechaFinal: new Date(),
        })
        .where(eq(groups.id, delivery.groupId));

      // Broadcast completion
      broadcastToGroup(delivery.groupId, {
        type: "GROUP_COMPLETED",
        groupId: delivery.groupId,
        completedAt: new Date(),
      });
    }

    return c.json({
      success: true,
      message: "Entrega marcada como completada",
      data: {
        delivery,
      },
    });
  } catch (error) {
    console.error("Error completando entrega:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Auto-advance month for all eligible groups - Admin only (for cron jobs)
adminRoute.post("/groups/auto-advance-month", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    // Get all groups in EN_MARCHA state
    const activeGroups = await db
      .select()
      .from(groups)
      .where(eq(groups.estado, "EN_MARCHA"));

    if (activeGroups.length === 0) {
      return c.json({
        success: true,
        message: "No hay grupos activos para procesar",
        data: {
          processedGroups: 0,
          advancedGroups: 0,
        },
      });
    }

    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM format
    let advancedCount = 0;
    let processedCount = 0;

    // Process each active group
    for (const group of activeGroups) {
      processedCount++;

      try {
        // Check if all contributions for current month are confirmed
        const pendingContributions = await db
          .select()
          .from(contributions)
          .where(
            and(
              eq(contributions.groupId, group.id),
              eq(contributions.periodo, currentPeriod),
              eq(contributions.estado, "PENDIENTE")
            )
          );

        // If there are pending contributions, skip this group
        if (pendingContributions.length > 0) {
          continue;
        }

        // Check if current turn user exists
        const currentTurn = group.turnoActual || 1;
        const [currentTurnUser] = await db
          .select({
            userId: userGroups.userId,
            posicion: userGroups.posicion,
            productoSeleccionado: userGroups.productoSeleccionado,
            user: {
              nombre: users.nombre,
              apellido: users.apellido,
            },
          })
          .from(userGroups)
          .innerJoin(users, eq(userGroups.userId, users.id))
          .where(
            and(
              eq(userGroups.groupId, group.id),
              eq(userGroups.posicion, currentTurn)
            )
          )
          .limit(1);

        if (!currentTurnUser) {
          console.warn(`No se encontró usuario para turno ${currentTurn} en grupo ${group.id}`);
          continue;
        }

        // Create delivery record
        await db.insert(deliveries).values({
          userId: currentTurnUser.userId,
          groupId: group.id,
          productName: currentTurnUser.productoSeleccionado || "Producto del grupo",
          productValue: "Pendiente",
          mesEntrega: currentPeriod,
          estado: "ENTREGADO",
          notas: `Entrega automática - Mes ${currentTurn}`,
        });

        // Advance to next turn
        const nextTurn = currentTurn + 1;
        const isCompleted = nextTurn > group.duracionMeses;

        await db
          .update(groups)
          .set({
            turnoActual: nextTurn,
            estado: isCompleted ? "COMPLETADO" : "EN_MARCHA",
            fechaFinal: isCompleted ? new Date() : null,
          })
          .where(eq(groups.id, group.id));

        // Broadcast update to group members
        broadcastToGroup(group.id, {
          type: "MONTH_ADVANCED",
          groupId: group.id,
          newTurn: nextTurn,
          completed: isCompleted,
          deliveryUser: {
            id: currentTurnUser.userId,
            name: `${currentTurnUser.user.nombre} ${currentTurnUser.user.apellido}`,
            position: currentTurnUser.posicion,
            product: currentTurnUser.productoSeleccionado,
          },
        });

        advancedCount++;

        console.log(`Grupo ${group.id} (${group.nombre}) avanzado automáticamente al turno ${nextTurn}${isCompleted ? ' - COMPLETADO' : ''}`);

      } catch (error) {
        console.error(`Error procesando grupo ${group.id}:`, error);
        // Continue with next group
      }
    }

    return c.json({
      success: true,
      message: `Procesados ${processedCount} grupos. Avanzados ${advancedCount} grupos.`,
      data: {
        processedGroups: processedCount,
        advancedGroups: advancedCount,
        currentPeriod,
      },
    });
  } catch (error) {
    console.error("Error en avance automático de mes:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default adminRoute;
