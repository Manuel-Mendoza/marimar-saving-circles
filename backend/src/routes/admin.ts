import { Hono } from "hono";
import { eq, count, sql, sum, and, gte, lte } from "drizzle-orm";
import { users } from "../db/tables/users.js";
import { groups } from "../db/tables/groups.js";
import { products } from "../db/tables/products.js";
import { paymentRequests } from "../db/tables/payment-requests.js";
import { db } from "../config/database.js";
import { authenticate } from "../middleware/auth.js";

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

export default adminRoute;
