import { Hono } from "hono";
import { eq, and, or, ne, not, SQL } from "drizzle-orm";
import { users } from "../db/tables/users.js";
import { groups } from "../db/tables/groups.js";
import { products } from "../db/tables/products.js";
import { userGroups } from "../db/tables/user-groups.js";
import { contributions } from "../db/tables/contributions.js";
import { deliveries } from "../db/tables/deliveries.js";
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

const usersRoute = new Hono();

// Get all users - Admin only
usersRoute.get("/", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    // Verificar que sea administrador
    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const allUsers = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        cedula: users.cedula,
        telefono: users.telefono,
        correoElectronico: users.correoElectronico,
        tipo: users.tipo,
        estado: users.estado,
        imagenCedula: users.imagenCedula,
        imagenPerfil: users.imagenPerfil,
        fechaRegistro: users.fechaRegistro,
        aprobadoPor: users.aprobadoPor,
        fechaAprobacion: users.fechaAprobacion,
      })
      .from(users)
      .orderBy(users.fechaRegistro);

    return c.json({
      success: true,
      data: {
        users: allUsers,
      },
    });
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get pending users - Admin only
usersRoute.get("/pending", authenticate, async (c) => {
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

    const pendingUsers = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        cedula: users.cedula,
        telefono: users.telefono,
        correoElectronico: users.correoElectronico,
        tipo: users.tipo,
        estado: users.estado,
        imagenCedula: users.imagenCedula,
        imagenPerfil: users.imagenPerfil,
        fechaRegistro: users.fechaRegistro,
      })
      .from(users)
      .where(eq(users.estado, "PENDIENTE"))
      .orderBy(users.fechaRegistro);

    return c.json({
      success: true,
      data: {
        users: pendingUsers,
      },
    });
  } catch (error) {
    console.error("Error obteniendo usuarios pendientes:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Approve, reject, suspend or reactivate user - Admin only
usersRoute.put("/:id/status", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const userId = parseInt(c.req.param("id"));

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const body = await c.req.json();
    const { action, reason } = body; // 'approve', 'reject', 'suspend', or 'reactivate', and optional reason

    if (!["approve", "reject", "suspend", "reactivate"].includes(action)) {
      return c.json(
        {
          success: false,
          message: "Acción inválida",
        },
        400,
      );
    }

    let status: string;
    let whereCondition: SQL;

    switch (action) {
      case "approve":
        status = "APROBADO";
        whereCondition = and(
          eq(users.id, userId),
          eq(users.estado, "PENDIENTE"),
        )!;
        break;
      case "reject":
        status = "RECHAZADO";
        whereCondition = and(
          eq(users.id, userId),
          eq(users.estado, "PENDIENTE"),
        )!;
        break;
      case "suspend":
        status = "SUSPENDIDO";
        whereCondition = and(
          eq(users.id, userId),
          or(eq(users.estado, "APROBADO"), eq(users.estado, "REACTIVADO"))!,
        )!;
        break;
      case "reactivate":
        status = "REACTIVADO";
        whereCondition = and(
          eq(users.id, userId),
          eq(users.estado, "SUSPENDIDO"),
        )!;
        break;
      default:
        throw new Error("Invalid action");
    }

    const updateData: Record<string, unknown> = {
      estado: status,
      aprobadoPor: userPayload.id,
      fechaAprobacion: new Date(),
    };

    // Add reason for reject action
    if (action === "reject" && reason) {
      updateData.motivo = reason;
    }

    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(whereCondition!)
      .returning();

    if (updatedUsers.length === 0) {
      return c.json(
        {
          success: false,
          message: "Usuario no encontrado o ya procesado",
        },
        404,
      );
    }

    const actionText =
      action === "approve"
        ? "aprobado"
        : action === "reject"
          ? "rechazado"
          : action === "suspend"
            ? "suspendido"
            : "reactivado";

    return c.json({
      success: true,
      message: `Usuario ${actionText} exitosamente`,
      data: {
        user: updatedUsers[0],
      },
    });
  } catch (error) {
    console.error("Error actualizando estado de usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Update user profile
usersRoute.put("/:id/profile", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const userId = parseInt(c.req.param("id"));

    // Users can only update their own profile
    if (userPayload.id !== userId) {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const body = await c.req.json();
    const { nombre, apellido, telefono, direccion, correoElectronico, imagenPerfil } = body;

    // Validate required fields if provided
    if (nombre && nombre.trim().length === 0) {
      return c.json(
        {
          success: false,
          message: "El nombre no puede estar vacío",
        },
        400,
      );
    }

    if (apellido && apellido.trim().length === 0) {
      return c.json(
        {
          success: false,
          message: "El apellido no puede estar vacío",
        },
        400,
      );
    }

    if (telefono && telefono.trim().length === 0) {
      return c.json(
        {
          success: false,
          message: "El teléfono no puede estar vacío",
        },
        400,
      );
    }

    if (direccion && direccion.trim().length === 0) {
      return c.json(
        {
          success: false,
          message: "La dirección no puede estar vacía",
        },
        400,
      );
    }

    // Validate email format if provided
    if (correoElectronico) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correoElectronico)) {
        return c.json(
          {
            success: false,
            message: "Formato de correo electrónico inválido",
          },
          400,
        );
      }

      // Check if email is already taken by another user
      const [existingUser] = await db
        .select()
        .from(users)
        .where(and(eq(users.correoElectronico, correoElectronico), not(eq(users.id, userId))))
        .limit(1);

      if (existingUser) {
        return c.json(
          {
            success: false,
            message: "Este correo electrónico ya está en uso",
          },
          400,
        );
      }
    }

    const updateData: Record<string, unknown> = {};

    // Only add fields that are provided and not empty
    if (nombre !== undefined && nombre !== null) {
      updateData.nombre = nombre.trim();
    }
    if (apellido !== undefined && apellido !== null) {
      updateData.apellido = apellido.trim();
    }
    if (telefono !== undefined && telefono !== null) {
      updateData.telefono = telefono.trim();
    }
    if (direccion !== undefined && direccion !== null) {
      updateData.direccion = direccion.trim();
    }
    if (correoElectronico !== undefined && correoElectronico !== null) {
      updateData.correoElectronico = correoElectronico.trim().toLowerCase();
    }
    if (imagenPerfil !== undefined) {
      updateData.imagenPerfil = imagenPerfil;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return c.json(
        {
          success: false,
          message: "No hay datos para actualizar",
        },
        400,
      );
    }

    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (updatedUsers.length === 0) {
      return c.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        404,
      );
    }

    const updatedUser = updatedUsers[0]!;

    return c.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        user: {
          id: updatedUser.id,
          nombre: updatedUser.nombre,
          apellido: updatedUser.apellido,
          cedula: updatedUser.cedula,
          telefono: updatedUser.telefono,
          direccion: updatedUser.direccion,
          correoElectronico: updatedUser.correoElectronico,
          tipo: updatedUser.tipo,
          estado: updatedUser.estado,
          imagenCedula: updatedUser.imagenCedula,
          imagenPerfil: updatedUser.imagenPerfil,
          fechaRegistro: updatedUser.fechaRegistro,
          ultimoAcceso: updatedUser.ultimoAcceso,
        },
      },
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get user by ID
usersRoute.get("/:id", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const userId = parseInt(c.req.param("id"));

    // Solo admin puede ver otros usuarios, usuarios normales solo su propio perfil
    if (userPayload.tipo !== "ADMINISTRADOR" && userPayload.id !== userId) {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const [user] = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        cedula: users.cedula,
        telefono: users.telefono,
        correoElectronico: users.correoElectronico,
        tipo: users.tipo,
        estado: users.estado,
        imagenCedula: users.imagenCedula,
        imagenPerfil: users.imagenPerfil,
        fechaRegistro: users.fechaRegistro,
        ultimoAcceso: users.ultimoAcceso,
        aprobadoPor: users.aprobadoPor,
        fechaAprobacion: users.fechaAprobacion,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Delete user - Admin only
usersRoute.delete("/:id", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const userId = parseInt(c.req.param("id"));

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    const body = await c.req.json();
    const { reason } = body; // Optional reason for deletion

    // Don't allow deleting admin users
    const [userToDelete] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userToDelete) {
      return c.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        404,
      );
    }

    if (userToDelete.tipo === "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "No se pueden eliminar usuarios administradores",
        },
        403,
      );
    }

    // Update the user with deletion reason before deleting (for audit purposes)
    await db
      .update(users)
      .set({
        motivo: reason,
        aprobadoPor: userPayload.id,
        fechaAprobacion: new Date(),
      })
      .where(eq(users.id, userId));

    // Delete the user
    await db.delete(users).where(eq(users.id, userId));

    return c.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Join a group with selected product and currency
usersRoute.post("/join", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const body = await c.req.json();
    const { productId, currency } = body;

    // Ensure productId is a number
    const parsedProductId = parseInt(productId);

    if (
      !parsedProductId ||
      isNaN(parsedProductId) ||
      !currency ||
      !["VES", "USD"].includes(currency)
    ) {
      return c.json(
        {
          success: false,
          message: "Datos inválidos",
        },
        400,
      );
    }

    // Users can join multiple groups, so no check for existing groups

    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, parsedProductId))
      .limit(1);

    if (!product) {
      return c.json(
        {
          success: false,
          message: "Producto no encontrado",
        },
        404,
      );
    }

    // Find available group for this duration (not full)
    const availableGroups = await db
      .select()
      .from(groups)
      .where(
        and(
          eq(groups.duracionMeses, product.tiempoDuracion),
          eq(groups.estado, "SIN_COMPLETAR"),
        ),
      );

    let group = null;
    for (const candidateGroup of availableGroups) {
      const members = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.groupId, candidateGroup.id));

      if (members.length < product.tiempoDuracion) {
        group = candidateGroup;
        break;
      }
    }

    // If no available group found, create a new one
    if (!group) {
      const newGroup = await db
        .insert(groups)
        .values({
          nombre: `Grupo ${product.tiempoDuracion} meses`,
          duracionMeses: product.tiempoDuracion,
          estado: "SIN_COMPLETAR",
          turnoActual: 0,
          fechaInicio: null,
        })
        .returning();

      if (newGroup.length === 0) {
        return c.json(
          {
            success: false,
            message: "Error al crear el grupo",
          },
          500,
        );
      }

      group = newGroup[0];
    }

    if (!group) {
      return c.json(
        {
          success: false,
          message: "No hay grupos disponibles para esta duración",
        },
        400,
      );
    }

    // Get current members count to verify group is not full
    const currentMembers = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.groupId, group.id));

    // Check if group is already full
    if (currentMembers.length >= product.tiempoDuracion) {
      return c.json(
        {
          success: false,
          message: "Este grupo ya está completo",
        },
        400,
      );
    }

    // Position will be assigned by admin lottery later, so we use null for now
    const position = null;

    // Use price directly as monthly payment (stored as monthly amount in database)
    const monthlyPayment =
      currency === "USD" ? product.precioUsd : product.precioVes;

    // Add user to group
    await db.insert(userGroups).values({
      userId: userPayload.id,
      groupId: group.id,
      posicion: position,
      productoSeleccionado: product.nombre,
      monedaPago: currency,
    });

    // Create pending contributions for each month
    const contributionsData = [];
    for (let month = 1; month <= product.tiempoDuracion; month++) {
      contributionsData.push({
        userId: userPayload.id,
        groupId: group.id,
        monto: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places
        moneda: currency,
        fechaPago: null, // Will be set when payment is made
        periodo: `Mes ${month}`,
        metodoPago: null,
        estado: "PENDIENTE",
        referenciaPago: null,
      });
    }

    await db.insert(contributions).values(contributionsData);

    // Check if group is now full (assuming max 10 members for example)
    // For now, let's assume groups can have unlimited members or update logic later

    return c.json({
      success: true,
      message: "Te has unido exitosamente al grupo",
      data: {
        groupId: group.id,
        position: position,
        currency: currency,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get current user's groups
usersRoute.get("/me/groups", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    const userGroupsData = await db
      .select({
        id: userGroups.id,
        userId: userGroups.userId,
        groupId: userGroups.groupId,
        posicion: userGroups.posicion,
        fechaUnion: userGroups.fechaUnion,
        productoSeleccionado: userGroups.productoSeleccionado,
        monedaPago: userGroups.monedaPago,
        group: {
          id: groups.id,
          nombre: groups.nombre,
          duracionMeses: groups.duracionMeses,
          estado: groups.estado,
          fechaInicio: groups.fechaInicio,
          fechaFinal: groups.fechaFinal,
          turnoActual: groups.turnoActual,
        },
      })
      .from(userGroups)
      .innerJoin(groups, eq(userGroups.groupId, groups.id))
      .where(eq(userGroups.userId, userPayload.id))
      .orderBy(userGroups.fechaUnion);

    return c.json({
      success: true,
      data: {
        userGroups: userGroupsData,
      },
    });
  } catch (error) {
    console.error("Error obteniendo grupos del usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get current user's contributions
usersRoute.get("/me/contributions", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    const contributionsData = await db
      .select({
        id: contributions.id,
        userId: contributions.userId,
        groupId: contributions.groupId,
        monto: contributions.monto,
        moneda: contributions.moneda,
        fechaPago: contributions.fechaPago,
        periodo: contributions.periodo,
        metodoPago: contributions.metodoPago,
        estado: contributions.estado,
        referenciaPago: contributions.referenciaPago,
      })
      .from(contributions)
      .where(eq(contributions.userId, userPayload.id))
      .orderBy(contributions.id);

    return c.json({
      success: true,
      data: {
        contributions: contributionsData,
      },
    });
  } catch (error) {
    console.error("Error obteniendo contribuciones del usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get current user's deliveries
usersRoute.get("/me/deliveries", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    const deliveriesData = await db
      .select({
        id: deliveries.id,
        userId: deliveries.userId,
        groupId: deliveries.groupId,
        productName: deliveries.productName,
        productValue: deliveries.productValue,
        fechaEntrega: deliveries.fechaEntrega,
        mesEntrega: deliveries.mesEntrega,
        estado: deliveries.estado,
        notas: deliveries.notas,
      })
      .from(deliveries)
      .where(eq(deliveries.userId, userPayload.id))
      .orderBy(deliveries.fechaEntrega);

    return c.json({
      success: true,
      data: {
        deliveries: deliveriesData,
      },
    });
  } catch (error) {
    console.error("Error obteniendo entregas del usuario:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default usersRoute;
