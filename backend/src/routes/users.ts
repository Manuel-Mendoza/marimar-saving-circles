import { Hono } from 'hono';
import { eq, and, or } from 'drizzle-orm';
import { users } from '../db/tables/users.js';
import { groups } from '../db/tables/groups.js';
import { products } from '../db/tables/products.js';
import { userGroups } from '../db/tables/user-groups.js';
import { db } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const usersRoute = new Hono();

// Get all users - Admin only
usersRoute.get('/', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    // Verificar que sea administrador
    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
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
        fechaRegistro: users.fechaRegistro,
        aprobadoPor: users.aprobadoPor,
        fechaAprobacion: users.fechaAprobacion
      })
      .from(users)
      .orderBy(users.fechaRegistro);

    return c.json({
      success: true,
      data: {
        users: allUsers
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get pending users - Admin only
usersRoute.get('/pending', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
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
        fechaRegistro: users.fechaRegistro
      })
      .from(users)
      .where(eq(users.estado, 'PENDIENTE'))
      .orderBy(users.fechaRegistro);

    return c.json({
      success: true,
      data: {
        users: pendingUsers
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios pendientes:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Approve, reject, suspend or reactivate user - Admin only
usersRoute.put('/:id/status', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const userId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { action, reason } = body; // 'approve', 'reject', 'suspend', or 'reactivate', and optional reason

    if (!['approve', 'reject', 'suspend', 'reactivate'].includes(action)) {
      return c.json({
        success: false,
        message: 'Acción inválida'
      }, 400);
    }

    let status: string;
    let whereCondition: any;

    switch (action) {
      case 'approve':
        status = 'APROBADO';
        whereCondition = and(eq(users.id, userId), eq(users.estado, 'PENDIENTE'));
        break;
      case 'reject':
        status = 'RECHAZADO';
        whereCondition = and(eq(users.id, userId), eq(users.estado, 'PENDIENTE'));
        break;
      case 'suspend':
        status = 'SUSPENDIDO';
        whereCondition = and(
          eq(users.id, userId),
          or(eq(users.estado, 'APROBADO'), eq(users.estado, 'REACTIVADO'))
        );
        break;
      case 'reactivate':
        status = 'REACTIVADO';
        whereCondition = and(eq(users.id, userId), eq(users.estado, 'SUSPENDIDO'));
        break;
      default:
        return c.json({
          success: false,
          message: 'Acción inválida'
        }, 400);
    }

    let updateData: any = {
      estado: status,
      aprobadoPor: userPayload.id,
      fechaAprobacion: new Date()
    };

    // Add reason for reject action
    if (action === 'reject' && reason) {
      updateData.motivo = reason;
    }

    const updatedUsers = await db
      .update(users)
      .set(updateData)
      .where(whereCondition)
      .returning();

    if (updatedUsers.length === 0) {
      return c.json({
        success: false,
        message: 'Usuario no encontrado o ya procesado'
      }, 404);
    }

    const actionText = action === 'approve' ? 'aprobado' :
                      action === 'reject' ? 'rechazado' :
                      action === 'suspend' ? 'suspendido' : 'reactivado';

    return c.json({
      success: true,
      message: `Usuario ${actionText} exitosamente`,
      data: {
        user: updatedUsers[0]
      }
    });

  } catch (error) {
    console.error('Error actualizando estado de usuario:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get user by ID
usersRoute.get('/:id', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const userId = parseInt(c.req.param('id'));

    // Solo admin puede ver otros usuarios, usuarios normales solo su propio perfil
    if (userPayload.tipo !== 'ADMINISTRADOR' && userPayload.id !== userId) {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
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
        fechaRegistro: users.fechaRegistro,
        ultimoAcceso: users.ultimoAcceso,
        aprobadoPor: users.aprobadoPor,
        fechaAprobacion: users.fechaAprobacion
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return c.json({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Delete user - Admin only
usersRoute.delete('/:id', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const userId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
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
      return c.json({
        success: false,
        message: 'Usuario no encontrado'
      }, 404);
    }

    if (userToDelete.tipo === 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'No se pueden eliminar usuarios administradores'
      }, 403);
    }

    // Update the user with deletion reason before deleting (for audit purposes)
    await db
      .update(users)
      .set({
        motivo: reason,
        aprobadoPor: userPayload.id,
        fechaAprobacion: new Date()
      })
      .where(eq(users.id, userId));

    // Delete the user
    await db
      .delete(users)
      .where(eq(users.id, userId));

    return c.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Join a group with selected product and currency
usersRoute.post('/join', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const body = await c.req.json();
    const { productId, currency } = body;

    if (!productId || !currency || !['VES', 'USD'].includes(currency)) {
      return c.json({
        success: false,
        message: 'Datos inválidos'
      }, 400);
    }

    // Check if user is already in a group
    const existingUserGroup = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.userId, userPayload.id))
      .limit(1);

    if (existingUserGroup.length > 0) {
      return c.json({
        success: false,
        message: 'Ya estás en un grupo'
      }, 400);
    }

    // Get product details
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return c.json({
        success: false,
        message: 'Producto no encontrado'
      }, 404);
    }

    // Find or create group for this duration
    let groupResult = await db
      .select()
      .from(groups)
      .where(and(
        eq(groups.duracionMeses, product.tiempoDuracion),
        eq(groups.estado, 'SIN_COMPLETAR')
      ))
      .limit(1);

    let group;
    if (groupResult.length === 0) {
      // Create new group
      const newGroup = await db
        .insert(groups)
        .values({
          nombre: `Grupo ${product.tiempoDuracion} meses`,
          duracionMeses: product.tiempoDuracion,
          estado: 'SIN_COMPLETAR',
          turnoActual: 0,
          fechaInicio: null
        })
        .returning();

      if (newGroup.length === 0) {
        return c.json({
          success: false,
          message: 'Error al crear el grupo'
        }, 500);
      }

      group = newGroup[0];
    } else {
      group = groupResult[0];
    }

    if (!group) {
      return c.json({
        success: false,
        message: 'Error al obtener el grupo'
      }, 500);
    }

    // Get current members count
    const currentMembers = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.groupId, group.id));

    const position = currentMembers.length + 1;

    // Add user to group
    await db
      .insert(userGroups)
      .values({
        userId: userPayload.id,
        groupId: group.id,
        posicion: position,
        productoSeleccionado: product.nombre,
        monedaPago: currency
      });

    // Check if group is now full (assuming max 10 members for example)
    // For now, let's assume groups can have unlimited members or update logic later

    return c.json({
      success: true,
      message: 'Te has unido exitosamente al grupo',
      data: {
        groupId: group.id,
        position: position,
        currency: currency
      }
    });

  } catch (error) {
    console.error('Error joining group:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

export default usersRoute;
