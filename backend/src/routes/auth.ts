import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { users } from "../db/tables/users.js";
import { db } from "../config/database.js";
import { hashPassword, verifyPassword, generateToken } from "../utils/auth.js";
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

const auth = new Hono();

// Validation schemas
const loginSchema = z.object({
  correoElectronico: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  cedula: z.string().min(7, "La cédula debe tener al menos 7 caracteres"),
  telefono: z.string().min(11, "El teléfono debe tener al menos 11 caracteres"),
  direccion: z
    .string()
    .min(10, "La dirección debe tener al menos 10 caracteres"),
  correoElectronico: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

// Login endpoint
auth.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const { correoElectronico, password } = loginSchema.parse(body);

    // Convertir email a minúsculas para búsqueda case-insensitive
    const emailLower = correoElectronico.toLowerCase();

    // Buscar usuario por email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.correoElectronico, emailLower))
      .limit(1);

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Credenciales inválidas",
        },
        401,
      );
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return c.json(
        {
          success: false,
          message: "Credenciales inválidas",
        },
        401,
      );
    }

    // Verificar estado de aprobación
    if (user.estado !== "APROBADO" && user.estado !== "REACTIVADO") {
      const messages = {
        PENDIENTE:
          "Tu cuenta está pendiente de aprobación por un administrador",
        RECHAZADO: "Tu cuenta ha sido rechazada",
        SUSPENDIDO: "Tu cuenta ha sido suspendida temporalmente",
      };
      return c.json(
        {
          success: false,
          message:
            messages[user.estado as keyof typeof messages] ||
            "Tu cuenta no tiene acceso autorizado",
        },
        403,
      );
    }

    // Generar token
    const token = await generateToken(
      {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correoElectronico: user.correoElectronico,
        tipo: user.tipo,
        estado: user.estado,
      },
      process.env.PASETO_SECRET!,
    );

    // Actualizar último acceso
    await db
      .update(users)
      .set({ ultimoAcceso: new Date() })
      .where(eq(users.id, user.id));

    return c.json({
      success: true,
      message: "Inicio de sesión exitoso",
      data: {
        user: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          correoElectronico: user.correoElectronico,
          tipo: user.tipo,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          message: "Datos de entrada inválidos",
          errors: error.errors,
        },
        400,
      );
    }

    console.error("Error en login:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Register endpoint
auth.post("/register", async (c) => {
  try {
    // Set CORS headers for this specific endpoint
    c.header("Access-Control-Allow-Origin", "*");
    c.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    c.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    c.header("Access-Control-Allow-Credentials", "true");
    c.header("Access-Control-Expose-Headers", "Content-Length, Content-Type");

    const body = await c.req.parseBody();
    const file = body["imagenCedula"] as File;

    // Extraer datos del formulario
    const userData = {
      nombre: body.nombre as string,
      apellido: body.apellido as string,
      cedula: body.cedula as string,
      telefono: body.telefono as string,
      direccion: body.direccion as string,
      correoElectronico: body.correoElectronico as string,
      password: body.password as string,
    };

    // Validar datos
    const validatedData = registerSchema.parse(userData);

    // Convertir email a minúsculas para consistencia
    const emailLower = validatedData.correoElectronico.toLowerCase();

    // Verificar si el email ya existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.correoElectronico, emailLower))
      .limit(1);

    if (existingUser) {
      return c.json(
        {
          success: false,
          message: "El correo electrónico ya está registrado",
        },
        409,
      );
    }

    // Verificar si la cédula ya existe
    const [existingCedula] = await db
      .select()
      .from(users)
      .where(eq(users.cedula, validatedData.cedula))
      .limit(1);

    if (existingCedula) {
      return c.json(
        {
          success: false,
          message: "La cédula ya está registrada",
        },
        409,
      );
    }

    // Procesar imagen de cédula si existe
    let imageUrl = null;
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        return c.json(
          {
            success: false,
            message: "El archivo debe ser una imagen válida (JPEG, PNG, GIF, etc.)",
          },
          400,
        );
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return c.json(
          {
            success: false,
            message: "La imagen no puede ser mayor a 5MB",
          },
          400,
        );
      }

      // Validar dimensiones mínimas
      try {
        const arrayBuffer = await file.arrayBuffer();
        const imageBlob = new Blob([arrayBuffer], { type: file.type });
        
        // Crear imagen temporal para validar dimensiones
        const img = new Image();
        const imageUrlTemp = URL.createObjectURL(imageBlob);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            if (img.width < 100 || img.height < 100) {
              URL.revokeObjectURL(imageUrlTemp);
              reject(new Error("La imagen debe tener al menos 100x100 píxeles"));
            } else {
              URL.revokeObjectURL(imageUrlTemp);
              resolve();
            }
          };
          img.onerror = () => {
            URL.revokeObjectURL(imageUrlTemp);
            reject(new Error("El archivo no es una imagen válida"));
          };
          img.src = imageUrlTemp;
        });
      } catch (imageError) {
        return c.json(
          {
            success: false,
            message: imageError instanceof Error ? imageError.message : "Error validando la imagen",
          },
          400,
        );
      }

      try {
        // Subir a imgbb
        const imgbbApiKey = process.env.IMGBB_API_KEY;
        if (!imgbbApiKey) {
          return c.json(
            {
              success: false,
              message: "Error de configuración del servidor: IMGBB_API_KEY no configurada",
            },
            500,
          );
        }

        const imgbbFormData = new FormData();
        imgbbFormData.append("key", imgbbApiKey);
        imgbbFormData.append("image", file);
        imgbbFormData.append(
          "name",
          `cedula-${validatedData.cedula}-${Date.now()}`,
        );

        const imgbbResponse = await fetch("https://api.imgbb.com/1/upload", {
          method: "POST",
          body: imgbbFormData,
        });

        if (!imgbbResponse.ok) {
          throw new Error(`ImgBB API error: ${imgbbResponse.statusText}`);
        }

        const imgbbResult = await imgbbResponse.json();

        if (imgbbResult.success && imgbbResult.data && imgbbResult.data.url) {
          imageUrl = imgbbResult.data.url;
        } else {
          console.error("ImgBB response:", imgbbResult);
          return c.json(
            {
              success: false,
              message: "Error al subir la imagen a ImgBB",
            },
            500,
          );
        }
      } catch (error) {
        console.error("Error subiendo imagen a imgbb:", error);
        return c.json(
          {
            success: false,
            message: "Error al procesar la imagen: " + (error instanceof Error ? error.message : String(error)),
          },
          500,
        );
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(validatedData.password);

    // Crear usuario
    const newUsers = await db
      .insert(users)
      .values({
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        cedula: validatedData.cedula,
        telefono: validatedData.telefono,
        direccion: validatedData.direccion,
        correoElectronico: emailLower,
        password: hashedPassword,
        tipo: "USUARIO", // Por defecto todos los registros son usuarios
        imagenCedula: imageUrl,
      })
      .returning();

    if (newUsers.length === 0) {
      return c.json(
        {
          success: false,
          message: "Error al crear el usuario",
        },
        500,
      );
    }

    const newUser = newUsers[0];

    // Generar token para el nuevo usuario
    const token = await generateToken(
      {
        id: newUser!.id,
        nombre: newUser!.nombre,
        apellido: newUser!.apellido,
        correoElectronico: newUser!.correoElectronico,
        tipo: newUser!.tipo,
      },
      process.env.PASETO_SECRET!,
    );

    return c.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        data: {
          user: {
            id: newUser!.id,
            nombre: newUser!.nombre,
            apellido: newUser!.apellido,
            correoElectronico: newUser!.correoElectronico,
            tipo: newUser!.tipo,
          },
          token,
        },
      },
      201,
    );
  } catch (error) {
    console.error("Error en registro:", error);
    
    // Manejo específico de errores de validación
    if (error instanceof z.ZodError) {
      return c.json(
        {
          success: false,
          message: "Datos de entrada inválidos",
          errors: error.errors,
        },
        400,
      );
    }

    // Manejo de errores de parseo de body (FormData)
    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      return c.json(
        {
          success: false,
          message: "Error al procesar la solicitud. Verifica que los datos sean correctos.",
        },
        400,
      );
    }

    // Error interno del servidor
    return c.json(
      {
        success: false,
        message: "Error interno del servidor. Por favor intenta de nuevo más tarde.",
      },
      500,
    );
  }
});

// Logout endpoint
auth.post("/logout", authenticate, async (c) => {
  try {
    // En un sistema stateless como PASETO, el logout se maneja del lado del cliente
    // Simplemente devolvemos una respuesta exitosa
    return c.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

// Get current user endpoint
auth.get("/me", authenticate, async (c) => {
  try {
    const userPayload = c.get("user") as JWTPayload;

    // Obtener información actualizada del usuario desde la base de datos
    const [user] = await db
      .select({
        id: users.id,
        nombre: users.nombre,
        apellido: users.apellido,
        cedula: users.cedula,
        telefono: users.telefono,
        direccion: users.direccion,
        correoElectronico: users.correoElectronico,
        tipo: users.tipo,
        estado: users.estado,
        imagenCedula: users.imagenCedula,
        fechaRegistro: users.fechaRegistro,
        ultimoAcceso: users.ultimoAcceso,
        aprobadoPor: users.aprobadoPor,
        fechaAprobacion: users.fechaAprobacion,
      })
      .from(users)
      .where(eq(users.id, userPayload.id))
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
    console.error("Error obteniendo usuario actual:", error);
    return c.json(
      {
        success: false,
        message: "Error interno del servidor",
      },
      500,
    );
  }
});

export default auth;
