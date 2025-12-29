import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { paymentRequests } from "../db/tables/payment-requests.js";
import { users } from "../db/tables/users.js";
import { groups } from "../db/tables/groups.js";
import { contributions } from "../db/tables/contributions.js";
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

const paymentRequestsRoute = new Hono();

// Get all payment requests - Admin only
paymentRequestsRoute.get("/", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    // Check if user is admin
    if (userPayload.tipo !== "ADMINISTRADOR") {
      return c.json(
        {
          success: false,
          message: "Acceso no autorizado",
        },
        403,
      );
    }

    // Fetch all payment requests with user and group information
    const requests = await db
      .select({
        id: paymentRequests.id,
        userId: paymentRequests.userId,
        groupId: paymentRequests.groupId,
        periodo: paymentRequests.periodo,
        monto: paymentRequests.monto,
        moneda: paymentRequests.moneda,
        metodoPago: paymentRequests.metodoPago,
        referenciaPago: paymentRequests.referenciaPago,
        comprobantePago: paymentRequests.comprobantePago,
        requiereComprobante: paymentRequests.requiereComprobante,
        estado: paymentRequests.estado,
        fechaSolicitud: paymentRequests.fechaSolicitud,
        fechaAprobacion: paymentRequests.fechaAprobacion,
        aprobadoPor: paymentRequests.aprobadoPor,
        notasAdmin: paymentRequests.notasAdmin,
        user: {
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          correoElectronico: users.correoElectronico,
        },
        group: {
          id: groups.id,
          nombre: groups.nombre,
        },
      })
      .from(paymentRequests)
      .leftJoin(users, eq(paymentRequests.userId, users.id))
      .leftJoin(groups, eq(paymentRequests.groupId, groups.id))
      .orderBy(desc(paymentRequests.fechaSolicitud));

    return c.json({
      success: true,
      message: "Solicitudes de pago obtenidas exitosamente",
      data: {
        requests,
      },
    });
  } catch (error) {
    console.error("Error obteniendo solicitudes de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Upload image to ImgBB
async function uploadToImgBB(
  imageBuffer: ArrayBuffer,
  filename: string,
): Promise<string> {
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

  if (!IMGBB_API_KEY) {
    throw new Error("ImgBB API key not configured");
  }

  const formData = new FormData();
  formData.append("image", new Blob([imageBuffer]), filename);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`ImgBB upload failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      `ImgBB upload error: ${data.error?.message || "Unknown error"}`,
    );
  }

  return data.data.url;
}

// Upload receipt image - Authenticated users
paymentRequestsRoute.post("/upload-receipt", authenticate, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return c.json(
        {
          success: false,
          message: "No se encontró el archivo",
        },
        400,
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return c.json(
        {
          success: false,
          message: "Solo se permiten archivos de imagen",
        },
        400,
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json(
        {
          success: false,
          message: "El archivo no debe superar 5MB",
        },
        400,
      );
    }

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Upload to ImgBB
    const imageUrl = await uploadToImgBB(arrayBuffer, file.name);

    return c.json({
      success: true,
      message: "Imagen subida exitosamente",
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error subiendo imagen:", error);
    return c.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      500,
    );
  }
});

// Create payment request - Authenticated users
paymentRequestsRoute.post("/", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;
    const body = await c.req.json();
    const {
      groupId,
      periodo,
      monto,
      moneda,
      metodoPago,
      referenciaPago,
      comprobantePago,
    } = body;

    // Validate required fields
    if (!groupId || !periodo || !monto || !moneda || !metodoPago) {
      return c.json(
        {
          success: false,
          message: "Datos incompletos",
        },
        400,
      );
    }

    // Validate moneda
    if (!["VES", "USD"].includes(moneda)) {
      return c.json(
        {
          success: false,
          message: "Moneda inválida",
        },
        400,
      );
    }

    // Check if user is in the group
    const userGroup = await db
      .select()
      .from(users)
      .where(eq(users.id, userPayload.id))
      .limit(1);

    if (!userGroup.length) {
      return c.json(
        {
          success: false,
          message: "Usuario no encontrado",
        },
        404,
      );
    }

    // Check if user already has a pending/confirmed request for this period
    const existingRequest = await db
      .select()
      .from(paymentRequests)
      .where(
        and(
          eq(paymentRequests.userId, userPayload.id),
          eq(paymentRequests.groupId, groupId),
          eq(paymentRequests.periodo, periodo),
          and(
            eq(paymentRequests.estado, "PENDIENTE"),
            eq(paymentRequests.estado, "CONFIRMADO"),
          ),
        ),
      )
      .limit(1);

    if (existingRequest.length > 0) {
      return c.json(
        {
          success: false,
          message:
            "Ya tienes una solicitud pendiente o confirmada para este período",
        },
        400,
      );
    }

    // Determine if comprobante is required
    const requiereComprobante = moneda === "VES"; // VES requires comprobante, USD doesn't

    if (requiereComprobante && !comprobantePago) {
      return c.json(
        {
          success: false,
          message: "Se requiere comprobante de pago para transferencias en VES",
        },
        400,
      );
    }

    // Create payment request
    const newRequest = await db
      .insert(paymentRequests)
      .values({
        userId: userPayload.id,
        groupId,
        periodo,
        monto,
        moneda,
        metodoPago,
        referenciaPago,
        comprobantePago,
        requiereComprobante,
      })
      .returning();

    return c.json({
      success: true,
      message: "Solicitud de pago enviada exitosamente",
      data: {
        request: newRequest[0],
      },
    });
  } catch (error) {
    console.error("Error creando solicitud de pago:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default paymentRequestsRoute;
