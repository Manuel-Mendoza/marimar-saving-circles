import { Hono } from "hono";
import { eq, and, count, sql } from "drizzle-orm";
import { groups } from "../db/tables/groups.js";
import { userGroups } from "../db/tables/user-groups.js";
import { users } from "../db/tables/users.js";
import { contributions as contributionsTable } from "../db/tables/contributions.js";
import { deliveries as deliveriesTable } from "../db/tables/deliveries.js";
import { db } from "../config/database.js";
import { drawSessions } from "../db/tables/draw-sessions.js";
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

const groupsRoute = new Hono();

// Get all groups
groupsRoute.get("/", async (c) => {
  try {
    // First, update any groups that should be marked as LLENO but aren't
    await db.execute(sql`
      UPDATE ${groups}
      SET estado = 'LLENO'
      WHERE id IN (
        SELECT g.id
        FROM ${groups} g
        LEFT JOIN ${userGroups} ug ON g.id = ug.group_id
        GROUP BY g.id
        HAVING COUNT(ug.id) >= g.duracion_meses AND g.estado = 'SIN_COMPLETAR'
      )
    `);

    const allGroups = await db
      .select({
        id: groups.id,
        nombre: groups.nombre,
        duracionMeses: groups.duracionMeses,
        estado: groups.estado,
        fechaInicio: groups.fechaInicio,
        fechaFinal: groups.fechaFinal,
        turnoActual: groups.turnoActual,
        participantes: sql<number>`count(${userGroups.id})`,
      })
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .groupBy(groups.id)
      .orderBy(groups.id);

    return c.json({
      success: true,
      data: {
        groups: allGroups,
      },
    });
  } catch (error) {
    console.error("Error obteniendo grupos:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get group by ID
groupsRoute.get("/:id", async (c) => {
  try {
    const groupId = parseInt(c.req.param("id"));

    const [group] = await db
      .select({
        id: groups.id,
        nombre: groups.nombre,
        duracionMeses: groups.duracionMeses,
        estado: groups.estado,
        fechaInicio: groups.fechaInicio,
        fechaFinal: groups.fechaFinal,
        turnoActual: groups.turnoActual,
      })
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

    return c.json({
      success: true,
      data: {
        group,
      },
    });
  } catch (error) {
    console.error("Error obteniendo grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get detailed group info for admin
groupsRoute.get("/:id/admin", authenticate, async (c) => {
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

    // Get basic group info
    const [group] = await db
      .select({
        id: groups.id,
        nombre: groups.nombre,
        duracionMeses: groups.duracionMeses,
        estado: groups.estado,
        fechaInicio: groups.fechaInicio,
        fechaFinal: groups.fechaFinal,
        turnoActual: groups.turnoActual,
      })
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

    // Get group members with user details
    const members = await db
      .select({
        id: userGroups.id,
        posicion: userGroups.posicion,
        fechaUnion: userGroups.fechaUnion,
        productoSeleccionado: userGroups.productoSeleccionado,
        monedaPago: userGroups.monedaPago,
        user: {
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          cedula: users.cedula,
          telefono: users.telefono,
          correoElectronico: users.correoElectronico,
          estado: users.estado,
        },
      })
      .from(userGroups)
      .innerJoin(users, eq(userGroups.userId, users.id))
      .where(eq(userGroups.groupId, groupId))
      .orderBy(userGroups.posicion);

    // Get all contributions for this group
    const contributions = await db
      .select({
        id: contributionsTable.id,
        userId: contributionsTable.userId,
        monto: contributionsTable.monto,
        moneda: contributionsTable.moneda,
        fechaPago: contributionsTable.fechaPago,
        periodo: contributionsTable.periodo,
        metodoPago: contributionsTable.metodoPago,
        estado: contributionsTable.estado,
        referenciaPago: contributionsTable.referenciaPago,
        user: {
          nombre: users.nombre,
          apellido: users.apellido,
        },
      })
      .from(contributionsTable)
      .innerJoin(users, eq(contributionsTable.userId, users.id))
      .where(eq(contributionsTable.groupId, groupId))
      .orderBy(contributionsTable.fechaPago);

    // Get all deliveries for this group
    const deliveries = await db
      .select({
        id: deliveriesTable.id,
        userId: deliveriesTable.userId,
        productName: deliveriesTable.productName,
        productValue: deliveriesTable.productValue,
        fechaEntrega: deliveriesTable.fechaEntrega,
        mesEntrega: deliveriesTable.mesEntrega,
        estado: deliveriesTable.estado,
        direccion: deliveriesTable.direccion,
        notas: deliveriesTable.notas,
        user: {
          nombre: users.nombre,
          apellido: users.apellido,
        },
      })
      .from(deliveriesTable)
      .innerJoin(users, eq(deliveriesTable.userId, users.id))
      .where(eq(deliveriesTable.groupId, groupId))
      .orderBy(deliveriesTable.fechaEntrega);

    return c.json({
      success: true,
      data: {
        group,
        members,
        contributions,
        deliveries,
        stats: {
          totalMembers: members.length,
          totalContributions: contributions.length,
          pendingContributions: contributions.filter(
            (c) => c.estado === "PENDIENTE",
          ).length,
          confirmedContributions: contributions.filter(
            (c) => c.estado === "CONFIRMADO",
          ).length,
          totalDeliveries: deliveries.length,
          completedDeliveries: deliveries.filter(
            (d) => d.estado === "ENTREGADO",
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo detalles del grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Create group - Admin only
groupsRoute.post("/", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado: Solo administradores pueden crear grupos",
        },
        403,
      );
    }

    const body = await c.req.json();
    const { nombre, duracionMeses } = body;

    // Validate required fields
    if (!nombre || !duracionMeses) {
      return c.json(
        {
          success: false,
          message: "Datos incompletos: Se requieren nombre y duracionMeses",
        },
        400,
      );
    }

    // Validate nombre
    if (typeof nombre !== "string" || nombre.trim().length < 2) {
      return c.json(
        {
          success: false,
          message: "El nombre debe ser una cadena de al menos 2 caracteres",
        },
        400,
      );
    }

    // Validate duracionMeses
    if (
      typeof duracionMeses !== "number" ||
      duracionMeses < 1 ||
      duracionMeses > 60
    ) {
      return c.json(
        {
          success: false,
          message: "duracionMeses debe ser un número entre 1 y 60",
        },
        400,
      );
    }

    // Check if group name already exists
    const existingGroup = await db
      .select()
      .from(groups)
      .where(eq(groups.nombre, nombre.trim()))
      .limit(1);

    if (existingGroup.length > 0) {
      return c.json(
        {
          success: false,
          message: "Ya existe un grupo con este nombre",
        },
        409,
      );
    }

    const newGroup = await db
      .insert(groups)
      .values({
        nombre: nombre.trim(),
        duracionMeses,
        estado: "SIN_COMPLETAR",
        turnoActual: 0,
        fechaInicio: null,
      })
      .returning();

    return c.json({
      success: true,
      message: "Grupo creado exitosamente",
      data: {
        group: newGroup[0],
      },
    });
  } catch (error) {
    console.error("Error creando grupo:", error);

    if (error instanceof Error) {
      if (error.message.includes("JSON")) {
        return c.json(
          {
            success: false,
            message: "Formato de solicitud inválido",
          },
          400,
        );
      }
    }

    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Update group - Admin only
groupsRoute.put("/:id", authenticate, async (c) => {
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
    const body = await c.req.json();
    const { nombre, duracionMeses, estado } = body;

    const updatedGroup = await db
      .update(groups)
      .set({
        nombre,
        duracionMeses,
        estado,
      })
      .where(eq(groups.id, groupId))
      .returning();

    if (updatedGroup.length === 0) {
      return c.json(
        {
          success: false,
          message: "Grupo no encontrado",
        },
        404,
      );
    }

    return c.json({
      success: true,
      message: "Grupo actualizado exitosamente",
      data: {
        group: updatedGroup[0],
      },
    });
  } catch (error) {
    console.error("Error actualizando grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Join existing group
groupsRoute.post("/:id/join", async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const groupId = parseInt(c.req.param("id"));

    if (!userPayload?.id) {
      return c.json(
        {
          success: false,
          message: "Usuario no autenticado",
        },
        401,
      );
    }

    // Check if user is already in a group
    const existingUserGroup = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.userId, userPayload.id))
      .limit(1);

    if (existingUserGroup.length > 0) {
      return c.json(
        {
          success: false,
          message: "Ya estás en un grupo",
        },
        400,
      );
    }

    // Check if group exists
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

    // Get current members count
    const currentMembers = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.groupId, groupId));

    const position = currentMembers.length + 1;

    // Add user to group
    const result = await db
      .insert(userGroups)
      .values({
        userId: userPayload.id,
        groupId: groupId,
        posicion: position,
        productoSeleccionado: `Miembro del grupo ${group.nombre}`,
        monedaPago: "USD",
      })
      .returning();

    return c.json({
      success: true,
      message: "Te has unido exitosamente al grupo",
      data: {
        groupId: groupId,
        position: position,
      },
    });
  } catch (error) {
    console.error("Error uniendo al grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Start group draw - Admin only
groupsRoute.post("/:id/start-draw", authenticate, async (c) => {
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

    // Check if group exists and is in correct state
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

    // TEMPORAL: Permitir sorteo para testing - comentar validación
    /*
    if (group.estado !== "LLENO") {
      return c.json(
        {
          success: false,
          message: "El grupo debe estar completo para iniciar el sorteo",
        },
        400,
      );
    }
    */

    // Get all group members
    const groupMembers = await db
      .select({
        userId: userGroups.userId,
        posicion: userGroups.posicion,
        nombre: users.nombre,
        apellido: users.apellido,
      })
      .from(userGroups)
      .innerJoin(users, eq(userGroups.userId, users.id))
      .where(eq(userGroups.groupId, groupId))
      .orderBy(userGroups.posicion);

    if (groupMembers.length === 0) {
      return c.json(
        {
          success: false,
          message: "No hay miembros en el grupo",
        },
        400,
      );
    }

    // Shuffle positions for the draw
    const shuffledMembers = [...groupMembers].sort(() => Math.random() - 0.5);

    // Update positions in database
    for (let i = 0; i < shuffledMembers.length; i++) {
      const member = shuffledMembers[i];
      if (member) {
        await db
          .update(userGroups)
          .set({ posicion: i + 1 })
          .where(
            and(
              eq(userGroups.userId, member.userId),
              eq(userGroups.groupId, groupId),
            ),
          );
      }
    }

    // Update group status and start date
    await db
      .update(groups)
      .set({
        estado: "EN_MARCHA",
        fechaInicio: new Date(),
        turnoActual: 1,
      })
      .where(eq(groups.id, groupId));

    // Create animation sequence for real-time updates
    const animationSequence = shuffledMembers.map((member, index) => ({
      position: index + 1,
      userId: member.userId,
      name: `${member.nombre} ${member.apellido}`,
      delay: index * 1000, // 1 second delay between each position reveal
    }));

    // Create draw session for SSE
    const drawSession = await db
      .insert(drawSessions)
      .values({
        groupId: groupId,
        adminId: userPayload.id,
        status: "IN_PROGRESS",
        finalPositions: shuffledMembers.map((member, index) => ({
          position: index + 1,
          userId: member.userId,
          name: `${member.nombre} ${member.apellido}`,
        })),
        totalSteps: shuffledMembers.length,
        currentStep: 0,
      })
      .returning();

    if (drawSession.length === 0) {
      return c.json({
        success: false,
        message: "Error al crear la sesión de sorteo",
      }, 500);
    }

    const session = drawSession[0]!;

    return c.json({
      success: true,
      message: "Sorteo iniciado exitosamente",
      data: {
        groupId,
        sessionId: session.id,
        finalPositions: shuffledMembers.map((member, index) => ({
          position: index + 1,
          userId: member.userId,
          name: `${member.nombre} ${member.apellido}`,
        })),
        animationSequence,
      },
    });
  } catch (error) {
    console.error("Error iniciando sorteo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Delete group - Admin only
groupsRoute.delete("/:id", authenticate, async (c) => {
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

    await db.delete(groups).where(eq(groups.id, groupId));

    return c.json({
      success: true,
      message: "Grupo eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando grupo:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default groupsRoute;
