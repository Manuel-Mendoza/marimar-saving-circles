import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import { paymentRequests } from '../db/tables/payment-requests.js';
import { users } from '../db/tables/users.js';
import { groups } from '../db/tables/groups.js';
import { contributions } from '../db/tables/contributions.js';
import { db } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

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

// Create payment request - Authenticated users
paymentRequestsRoute.post('/', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload;
    const body = await c.req.json();
    const {
      groupId,
      periodo,
      monto,
      moneda,
      metodoPago,
      referenciaPago,
      comprobantePago
    } = body;

    // Validate required fields
    if (!groupId || !periodo || !monto || !moneda || !metodoPago) {
      return c.json({
        success: false,
        message: 'Datos incompletos'
      }, 400);
    }

    // Validate moneda
    if (!['VES', 'USD'].includes(moneda)) {
      return c.json({
        success: false,
        message: 'Moneda inválida'
      }, 400);
    }

    // Check if user is in the group
    const userGroup = await db
      .select()
      .from(users)
      .where(eq(users.id, userPayload.id))
      .limit(1);

    if (!userGroup.length) {
      return c.json({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    // Check if user already has a pending/confirmed request for this period
    const existingRequest = await db
      .select()
      .from(paymentRequests)
      .where(and(
        eq(paymentRequests.userId, userPayload.id),
        eq(paymentRequests.groupId, groupId),
        eq(paymentRequests.periodo, periodo),
        and(
          eq(paymentRequests.estado, 'PENDIENTE'),
          eq(paymentRequests.estado, 'CONFIRMADO')
        )
      ))
      .limit(1);

    if (existingRequest.length > 0) {
      return c.json({
        success: false,
        message: 'Ya tienes una solicitud pendiente o confirmada para este período'
      }, 400);
    }

    // Determine if comprobante is required
    const requiereComprobante = moneda === 'VES'; // VES requires comprobante, USD doesn't

    if (requiereComprobante && !comprobantePago) {
      return c.json({
        success: false,
        message: 'Se requiere comprobante de pago para transferencias en VES'
      }, 400);
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
        requiereComprobante
      })
      .returning();

    return c.json({
      success: true,
      message: 'Solicitud de pago enviada exitosamente',
      data: {
        request: newRequest[0]
      }
    });

  } catch (error) {
    console.error('Error creando solicitud de pago:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get user's payment requests - Authenticated users
paymentRequestsRoute.get('/my-requests', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload;

    const requests = await db
      .select({
        id: paymentRequests.id,
        groupId: paymentRequests.groupId,
        periodo: paymentRequests.periodo,
        monto: paymentRequests.monto,
        moneda: paymentRequests.moneda,
        metodoPago: paymentRequests.metodoPago,
        referenciaPago: paymentRequests.referenciaPago,
        comprobantePago: paymentRequests.comprobantePago,
        estado: paymentRequests.estado,
        fechaSolicitud: paymentRequests.fechaSolicitud,
        fechaAprobacion: paymentRequests.fechaAprobacion,
        notasAdmin: paymentRequests.notasAdmin,
        group: {
          nombre: groups.nombre,
          duracionMeses: groups.duracionMeses
        }
      })
      .from(paymentRequests)
      .innerJoin(groups, eq(paymentRequests.groupId, groups.id))
      .where(eq(paymentRequests.userId, userPayload.id))
      .orderBy(desc(paymentRequests.fechaSolicitud));

    return c.json({
      success: true,
      data: {
        requests
      }
    });

  } catch (error) {
    console.error('Error obteniendo solicitudes de pago:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get all payment requests - Admin only
paymentRequestsRoute.get('/', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const requests = await db
      .select({
        id: paymentRequests.id,
        periodo: paymentRequests.periodo,
        monto: paymentRequests.monto,
        moneda: paymentRequests.moneda,
        metodoPago: paymentRequests.metodoPago,
        referenciaPago: paymentRequests.referenciaPago,
        comprobantePago: paymentRequests.comprobantePago,
        estado: paymentRequests.estado,
        fechaSolicitud: paymentRequests.fechaSolicitud,
        fechaAprobacion: paymentRequests.fechaAprobacion,
        notasAdmin: paymentRequests.notasAdmin,
        user: {
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          correoElectronico: users.correoElectronico
        },
        group: {
          id: groups.id,
          nombre: groups.nombre
        }
      })
      .from(paymentRequests)
      .innerJoin(users, eq(paymentRequests.userId, users.id))
      .innerJoin(groups, eq(paymentRequests.groupId, groups.id))
      .orderBy(desc(paymentRequests.fechaSolicitud));

    return c.json({
      success: true,
      data: {
        requests
      }
    });

  } catch (error) {
    console.error('Error obteniendo todas las solicitudes:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Approve payment request - Admin only
paymentRequestsRoute.put('/:id/approve', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload;
    const requestId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { notasAdmin } = body;

    // Get the payment request
    const [request] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, requestId))
      .limit(1);

    if (!request) {
      return c.json({
        success: false,
        message: 'Solicitud no encontrada'
      }, 404);
    }

    if (request.estado !== 'PENDIENTE') {
      return c.json({
        success: false,
        message: 'Esta solicitud ya fue procesada'
      }, 400);
    }

    // Update payment request
    const updatedRequest = await db
      .update(paymentRequests)
      .set({
        estado: 'CONFIRMADO',
        fechaAprobacion: new Date(),
        aprobadoPor: userPayload.id,
        notasAdmin: notasAdmin || null
      })
      .where(eq(paymentRequests.id, requestId))
      .returning();

    // Create corresponding contribution record
    await db
      .insert(contributions)
      .values({
        userId: request.userId,
        groupId: request.groupId,
        monto: request.monto,
        moneda: request.moneda,
        fechaPago: new Date(),
        periodo: request.periodo,
        metodoPago: request.metodoPago,
        estado: 'CONFIRMADO',
        referenciaPago: request.referenciaPago
      });

    return c.json({
      success: true,
      message: 'Solicitud de pago aprobada exitosamente',
      data: {
        request: updatedRequest[0]
      }
    });

  } catch (error) {
    console.error('Error aprobando solicitud:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Reject payment request - Admin only
paymentRequestsRoute.put('/:id/reject', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as JWTPayload;
    const requestId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { notasAdmin } = body;

    if (!notasAdmin || notasAdmin.trim().length === 0) {
      return c.json({
        success: false,
        message: 'Se requiere una razón para rechazar la solicitud'
      }, 400);
    }

    // Get the payment request
    const [request] = await db
      .select()
      .from(paymentRequests)
      .where(eq(paymentRequests.id, requestId))
      .limit(1);

    if (!request) {
      return c.json({
        success: false,
        message: 'Solicitud no encontrada'
      }, 404);
    }

    if (request.estado !== 'PENDIENTE') {
      return c.json({
        success: false,
        message: 'Esta solicitud ya fue procesada'
      }, 400);
    }

    // Update payment request
    const updatedRequest = await db
      .update(paymentRequests)
      .set({
        estado: 'RECHAZADO',
        fechaAprobacion: new Date(),
        aprobadoPor: userPayload.id,
        notasAdmin
      })
      .where(eq(paymentRequests.id, requestId))
      .returning();

    return c.json({
      success: true,
      message: 'Solicitud de pago rechazada',
      data: {
        request: updatedRequest[0]
      }
    });

  } catch (error) {
    console.error('Error rechazando solicitud:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

export default paymentRequestsRoute;
