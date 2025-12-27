import { MiddlewareHandler, HonoRequest } from "hono";
import { verifyToken } from "../utils/auth.js";

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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        {
          success: false,
          message: "Token de autenticación requerido",
        },
        401,
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return c.json(
        {
          success: false,
          message: "Token inválido",
        },
        401,
      );
    }

    // Verify token
    const payload = (await verifyToken(
      token,
      process.env.PASETO_SECRET!,
    )) as JWTPayload | null;

    if (!payload || !payload.id) {
      return c.json(
        {
          success: false,
          message: "Token inválido o expirado",
        },
        401,
      );
    }

    // Add user info to context
    c.set("user", payload);
    await next();
  } catch (error) {
    console.error("Error en middleware de autenticación:", error);
    return c.json(
      {
        success: false,
        message: "Error de autenticación",
      },
      401,
    );
  }
};
