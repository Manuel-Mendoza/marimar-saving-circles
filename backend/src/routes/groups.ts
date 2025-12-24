import { Hono } from 'hono';
import { eq, count, sql } from 'drizzle-orm';
import { groups } from '../db/tables/groups.js';
import { userGroups } from '../db/tables/user-groups.js';
import { db } from '../config/database.js';

const groupsRoute = new Hono();

// Get all groups
groupsRoute.get('/', async (c) => {
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
        participantes: sql<number>`count(${userGroups.id})`
      })
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .groupBy(groups.id)
      .orderBy(groups.id);

    return c.json({
      success: true,
      data: {
        groups: allGroups
      }
    });
  } catch (error) {
    console.error('Error obteniendo grupos:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get group by ID
groupsRoute.get('/:id', async (c) => {
  try {
    const groupId = parseInt(c.req.param('id'));

    const [group] = await db
      .select({
        id: groups.id,
        nombre: groups.nombre,
        duracionMeses: groups.duracionMeses,
        estado: groups.estado,
        fechaInicio: groups.fechaInicio,
        fechaFinal: groups.fechaFinal,
        turnoActual: groups.turnoActual
      })
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    if (!group) {
      return c.json({
        success: false,
        message: 'Grupo no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        group
      }
    });
  } catch (error) {
    console.error('Error obteniendo grupo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Create group - Admin only
groupsRoute.post('/', async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { nombre, duracionMeses } = body;

    if (!nombre || !duracionMeses || duracionMeses < 1) {
      return c.json({
        success: false,
        message: 'Datos inválidos'
      }, 400);
    }

    const newGroup = await db
      .insert(groups)
      .values({
        nombre,
        duracionMeses,
        estado: 'SIN_COMPLETAR',
        turnoActual: 0,
        fechaInicio: null
      })
      .returning();

    return c.json({
      success: true,
      message: 'Grupo creado exitosamente',
      data: {
        group: newGroup[0]
      }
    });
  } catch (error) {
    console.error('Error creando grupo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Update group - Admin only
groupsRoute.put('/:id', async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const groupId = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { nombre, duracionMeses, estado } = body;

    const updatedGroup = await db
      .update(groups)
      .set({
        nombre,
        duracionMeses,
        estado
      })
      .where(eq(groups.id, groupId))
      .returning();

    if (updatedGroup.length === 0) {
      return c.json({
        success: false,
        message: 'Grupo no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Grupo actualizado exitosamente',
      data: {
        group: updatedGroup[0]
      }
    });
  } catch (error) {
    console.error('Error actualizando grupo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Join existing group
groupsRoute.post('/:id/join', async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const groupId = parseInt(c.req.param('id'));

    console.log('User trying to join group:', { userId: userPayload?.id, groupId });

    if (!userPayload?.id) {
      return c.json({
        success: false,
        message: 'Usuario no autenticado'
      }, 401);
    }

    // Check if user is already in a group
    const existingUserGroup = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.userId, userPayload.id))
      .limit(1);

    console.log('Existing user groups found:', existingUserGroup.length);

    if (existingUserGroup.length > 0) {
      return c.json({
        success: false,
        message: 'Ya estás en un grupo'
      }, 400);
    }

    // Check if group exists
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, groupId))
      .limit(1);

    console.log('Group found:', !!group);

    if (!group) {
      return c.json({
        success: false,
        message: 'Grupo no encontrado'
      }, 404);
    }

    // Get current members count
    const currentMembers = await db
      .select()
      .from(userGroups)
      .where(eq(userGroups.groupId, groupId));

    const position = currentMembers.length + 1;
    console.log('Assigning position:', position);

    // Add user to group
    const result = await db
      .insert(userGroups)
      .values({
        userId: userPayload.id,
        groupId: groupId,
        posicion: position,
        productoSeleccionado: `Miembro del grupo ${group.nombre}`,
        monedaPago: 'USD'
      })
      .returning();

    console.log('Insert result:', result);

    return c.json({
      success: true,
      message: 'Te has unido exitosamente al grupo',
      data: {
        groupId: groupId,
        position: position
      }
    });
  } catch (error) {
    console.error('Error uniendo al grupo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Delete group - Admin only
groupsRoute.delete('/:id', async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const groupId = parseInt(c.req.param('id'));

    await db
      .delete(groups)
      .where(eq(groups.id, groupId));

    return c.json({
      success: true,
      message: 'Grupo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando grupo:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

export default groupsRoute;
