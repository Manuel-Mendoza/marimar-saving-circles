import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { paymentOptions } from "../db/tables/payment-options.js";
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

const paymentOptionsRoute = new Hono();

// Get active payment options - Public (for users to see payment methods)
paymentOptionsRoute.get("/", async (c) => {
  try {
    const options = await db
      .select({
        id: paymentOptions.id,
        tipo: paymentOptions.tipo,
        detalles: paymentOptions.detalles,
        fechaCreacion: paymentOptions.fechaCreacion,
      })
      .from(paymentOptions)
      .where(eq(paymentOptions.activo, true))
      .orderBy(paymentOptions.fechaCreacion);

    return c.json({
      success: true,
      data: {
        options,
      },
    });
  } catch (error) {
    console.error("Error obteniendo opciones de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get all payment options - Admin only
paymentOptionsRoute.get("/admin", authenticate, async (c) => {
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

    const options = await db
      .select()
      .from(paymentOptions)
      .orderBy(paymentOptions.fechaCreacion);

    return c.json({
      success: true,
      data: {
        options,
      },
    });
  } catch (error) {
    console.error("Error obteniendo opciones de pago para admin:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get single payment option by type - Admin only
paymentOptionsRoute.get("/:tipo", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const tipo = c.req.param("tipo");

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    if (!["movil", "banco"].includes(tipo)) {
      return c.json(
        {
          success: false,
          message: "Tipo de pago inválido",
        },
        400,
      );
    }

    const [option] = await db
      .select()
      .from(paymentOptions)
      .where(eq(paymentOptions.tipo, tipo))
      .limit(1);

    return c.json({
      success: true,
      data: {
        option: option || null,
      },
    });
  } catch (error) {
    console.error("Error obteniendo opción de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Create or update payment option by type - Admin only
paymentOptionsRoute.put("/:tipo", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const tipo = c.req.param("tipo");

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    if (!["movil", "banco"].includes(tipo)) {
      return c.json(
        {
          success: false,
          message: "Tipo de pago inválido",
        },
        400,
      );
    }

    const body = await c.req.json();
    const { detalles } = body;

    if (!detalles) {
      return c.json(
        {
          success: false,
          message: "Los detalles son requeridos",
        },
        400,
      );
    }

    // Check if option already exists for this type
    const existingOption = await db
      .select()
      .from(paymentOptions)
      .where(eq(paymentOptions.tipo, tipo))
      .limit(1);

    let option;

    if (existingOption.length > 0 && existingOption[0]) {
      // Update existing option
      [option] = await db
        .update(paymentOptions)
        .set({
          detalles: JSON.stringify(detalles),
          activo: true, // Always set to active when updating
        })
        .where(eq(paymentOptions.id, existingOption[0].id))
        .returning();
    } else {
      // Create new option
      [option] = await db
        .insert(paymentOptions)
        .values({
          tipo,
          detalles: JSON.stringify(detalles),
          activo: true,
        })
        .returning();
    }

    return c.json({
      success: true,
      message: existingOption.length > 0
        ? "Opción de pago actualizada exitosamente"
        : "Opción de pago creada exitosamente",
      data: {
        option,
      },
    });
  } catch (error) {
    console.error("Error guardando opción de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Toggle payment option active status - Admin only
paymentOptionsRoute.put("/:id/toggle", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const optionId = parseInt(c.req.param("id"));

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    if (isNaN(optionId)) {
      return c.json(
        {
          success: false,
          message: "ID de opción inválido",
        },
        400,
      );
    }

    // Get current option
    const [currentOption] = await db
      .select()
      .from(paymentOptions)
      .where(eq(paymentOptions.id, optionId))
      .limit(1);

    if (!currentOption) {
      return c.json(
        {
          success: false,
          message: "Opción de pago no encontrada",
        },
        404,
      );
    }

    // Toggle active status
    const updatedOptions = await db
      .update(paymentOptions)
      .set({
        activo: !currentOption.activo,
      })
      .where(eq(paymentOptions.id, optionId))
      .returning();

    if (updatedOptions.length === 0 || !updatedOptions[0]) {
      return c.json(
        {
          success: false,
          message: "No se pudo actualizar la opción de pago",
        },
        500,
      );
    }

    const updatedOption = updatedOptions[0];

    return c.json({
      success: true,
      message: `Opción de pago ${updatedOption.activo ? 'activada' : 'desactivada'} exitosamente`,
      data: {
        option: updatedOption,
      },
    });
  } catch (error) {
    console.error("Error cambiando estado de opción de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Delete payment option - Admin only
paymentOptionsRoute.delete("/:id", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const optionId = parseInt(c.req.param("id"));

    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso denegado",
        },
        403,
      );
    }

    if (isNaN(optionId)) {
      return c.json(
        {
          success: false,
          message: "ID de opción inválido",
        },
        400,
      );
    }

    // Check if option exists
    const [existingOption] = await db
      .select()
      .from(paymentOptions)
      .where(eq(paymentOptions.id, optionId))
      .limit(1);

    if (!existingOption) {
      return c.json(
        {
          success: false,
          message: "Opción de pago no encontrada",
        },
        404,
      );
    }

    // Delete the option
    await db
      .delete(paymentOptions)
      .where(eq(paymentOptions.id, optionId));

    return c.json({
      success: true,
      message: "Opción de pago eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando opción de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default paymentOptionsRoute;
