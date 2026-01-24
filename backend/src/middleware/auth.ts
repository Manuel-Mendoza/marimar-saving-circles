import { MiddlewareHandler, HonoRequest } from "hono";
import { verifyToken } from "../utils/auth.js";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { users } from "../db/tables/users.js";

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

// Extend context to include user
declare module "hono" {
  interface ContextVariableMap {
    user: JWTPayload;
  }
}

// Authentication middleware
export const authenticate: MiddlewareHandler = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader) {
      return c.json(
        {
          success: false,
          message: "Token de autenticación requerido",
        },
        401,
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          success: false,
          message: "Formato de token inválido. Use: Bearer <token>",
        },
        401,
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token || token.trim().length === 0) {
      return c.json(
        {
          success: false,
          message: "Token vacío o inválido",
        },
        401,
      );
    }

    // Verify token
    const payload = (await verifyToken(
      token,
      process.env.PASETO_SECRET!,
    )) as JWTPayload | null;

    if (!payload) {
      return c.json(
        {
          success: false,
          message: "Token inválido o expirado",
        },
        401,
      );
    }

    // Validate payload structure
    if (!payload.id || typeof payload.id !== "number") {
      return c.json(
        {
          success: false,
          message: "Token con información de usuario inválida",
        },
        401,
      );
    }

    // Optional: Check if user still exists in database
    try {
      const [user] = await db
        .select({ id: users.id, estado: users.estado })
        .from(users)
        .where(eq(users.id, payload.id))
        .limit(1);

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Usuario no encontrado o eliminado",
          },
          401,
        );
      }

      // Check if user account is active
      if (user.estado === "RECHAZADO" || user.estado === "SUSPENDIDO") {
        return c.json(
          {
            success: false,
            message: "Cuenta de usuario no activa",
          },
          403,
        );
      }
    } catch (dbError) {
      console.error("Error verificando usuario en base de datos:", dbError);
      // No retornamos error aquí para no bloquear todas las solicitudes si hay problemas de DB
    }

    // Add user info to context
    c.set("user", payload);
    await next();
    return;
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    
    // Provide specific error messages for debugging
    if (error instanceof Error) {
      if (error.message.includes("PASETO")) {
        return c.json(
          {
            success: false,
            message: "Error de autenticación: Token PASETO inválido",
          },
          401,
        );
      }
    }
    
    return c.json(
      {
        success: false,
        message: "Error de autenticación",
      },
      401,
    );
  }
};
