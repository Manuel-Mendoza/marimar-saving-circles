import { Hono } from 'hono';
import { eq, and, count, sql } from 'drizzle-orm';
import { productSelections } from '../db/tables/product-selections.js';
import { products } from '../db/tables/products.js';
import { users } from '../db/tables/users.js';
import { groups } from '../db/tables/groups.js';
import { userGroups } from '../db/tables/user-groups.js';
import { db } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const productSelectionsRoute = new Hono();

// Get all product selections with product and user info - Admin only
productSelectionsRoute.get('/', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const selections = await db
      .select({
        id: productSelections.id,
        estado: productSelections.estado,
        fechaSeleccion: productSelections.fechaSeleccion,
        user: {
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
          correoElectronico: users.correoElectronico,
        },
        product: {
          id: products.id,
          nombre: products.nombre,
          precioUsd: products.precioUsd,
          precioVes: products.precioVes,
          tiempoDuracion: products.tiempoDuracion,
          tags: products.tags,
        }
      })
      .from(productSelections)
      .innerJoin(users, eq(productSelections.userId, users.id))
      .innerJoin(products, eq(productSelections.productId, products.id))
      .orderBy(productSelections.fechaSeleccion);

    return c.json({
      success: true,
      data: {
        selections
      }
    });

  } catch (error) {
    console.error('Error obteniendo selecciones:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get selections for a specific product
productSelectionsRoute.get('/product/:productId', authenticate, async (c) => {
  try {
    const productId = parseInt(c.req.param('productId'));

    const selections = await db
      .select({
        id: productSelections.id,
        estado: productSelections.estado,
        fechaSeleccion: productSelections.fechaSeleccion,
        user: {
          id: users.id,
          nombre: users.nombre,
          apellido: users.apellido,
        }
      })
      .from(productSelections)
      .innerJoin(users, eq(productSelections.userId, users.id))
      .where(eq(productSelections.productId, productId))
      .orderBy(productSelections.fechaSeleccion);

    return c.json({
      success: true,
      data: {
        selections
      }
    });

  } catch (error) {
    console.error('Error obteniendo selecciones del producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Select a product - Authenticated users only
productSelectionsRoute.post('/select/:productId', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const productId = parseInt(c.req.param('productId'));

    if (!userPayload?.id) {
      return c.json({
        success: false,
        message: 'Usuario no autenticado'
      }, 401);
    }

    // Check if user is approved
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userPayload.id))
      .limit(1);

    if (!user || user.estado !== 'APROBADO') {
      return c.json({
        success: false,
        message: 'Usuario no aprobado'
      }, 403);
    }

    // Check if user already has a pending selection
    const existingSelection = await db
      .select()
      .from(productSelections)
      .where(and(
        eq(productSelections.userId, userPayload.id),
        eq(productSelections.estado, 'PENDIENTE')
      ))
      .limit(1);

    if (existingSelection.length > 0) {
      return c.json({
        success: false,
        message: 'Ya tienes una selección pendiente'
      }, 400);
    }

    // Check if product exists and is active
    const [product] = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, productId),
        eq(products.activo, true)
      ))
      .limit(1);

    if (!product) {
      return c.json({
        success: false,
        message: 'Producto no encontrado o no disponible'
      }, 404);
    }

    // Create selection
    const selection = await db
      .insert(productSelections)
      .values({
        userId: userPayload.id,
        productId: productId,
        estado: 'PENDIENTE'
      })
      .returning();

    // Check if we can form a group
    await checkAndCreateGroup(productId);

    return c.json({
      success: true,
      message: 'Producto seleccionado exitosamente',
      data: {
        selection: selection[0]
      }
    });

  } catch (error) {
    console.error('Error seleccionando producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get user's current selection
productSelectionsRoute.get('/my-selection', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    const [selection] = await db
      .select({
        id: productSelections.id,
        estado: productSelections.estado,
        fechaSeleccion: productSelections.fechaSeleccion,
        product: {
          id: products.id,
          nombre: products.nombre,
          precioUsd: products.precioUsd,
          precioVes: products.precioVes,
          tiempoDuracion: products.tiempoDuracion,
          imagen: products.imagen,
          descripcion: products.descripcion,
          tags: products.tags,
        }
      })
      .from(productSelections)
      .innerJoin(products, eq(productSelections.productId, products.id))
      .where(and(
        eq(productSelections.userId, userPayload.id),
        eq(productSelections.estado, 'PENDIENTE')
      ))
      .limit(1);

    return c.json({
      success: true,
      data: {
        selection: selection || null
      }
    });

  } catch (error) {
    console.error('Error obteniendo selección del usuario:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Cancel selection
productSelectionsRoute.delete('/cancel/:selectionId', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const selectionId = parseInt(c.req.param('selectionId'));

    const deleted = await db
      .delete(productSelections)
      .where(and(
        eq(productSelections.id, selectionId),
        eq(productSelections.userId, userPayload.id),
        eq(productSelections.estado, 'PENDIENTE')
      ))
      .returning();

    if (deleted.length === 0) {
      return c.json({
        success: false,
        message: 'Selección no encontrada o no puede ser cancelada'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Selección cancelada exitosamente'
    });

  } catch (error) {
    console.error('Error cancelando selección:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Helper function to check and create groups automatically
async function checkAndCreateGroup(productId: number) {
  try {
    // Get product info
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) return;

    // Find existing group for this duration that is not full
    const existingGroupResult = await db
      .select({
        id: groups.id,
        nombre: groups.nombre,
        duracionMeses: groups.duracionMeses,
        estado: groups.estado,
        userCount: sql<number>`count(${userGroups.id})`
      })
      .from(groups)
      .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
      .where(and(
        eq(groups.duracionMeses, product.tiempoDuracion),
        eq(groups.estado, 'SIN_COMPLETAR')
      ))
      .groupBy(groups.id)
      .having(sql`count(${userGroups.id}) < ${groups.duracionMeses}`)
      .limit(1);

    const existingGroup = existingGroupResult[0];
    let targetGroup: any = existingGroup;

    if (!targetGroup) {
      // Create new group for this duration
      const groupName = `Grupo de ${product.tiempoDuracion} meses`;
      const [newGroup] = await db
        .insert(groups)
        .values({
          nombre: groupName,
          duracionMeses: product.tiempoDuracion,
          estado: 'SIN_COMPLETAR',
          fechaInicio: null,
          turnoActual: 0
        })
        .returning();

      targetGroup = { ...newGroup, userCount: 0 };
      console.log(`Nuevo grupo creado: ${groupName}`);
    }

    // Get the current user selection
    const [selection] = await db
      .select()
      .from(productSelections)
      .where(and(
        eq(productSelections.productId, productId),
        eq(productSelections.estado, 'PENDIENTE')
      ))
      .limit(1);

    if (!selection || !targetGroup) return;

    // Get current position in group
    const [positionResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(userGroups)
      .where(eq(userGroups.groupId, targetGroup.id));

    const position = (positionResult?.count || 0) + 1;

    // Add user to group
    await db.insert(userGroups).values({
      userId: selection.userId,
      groupId: targetGroup.id,
      posicion: position,
      productoSeleccionado: product.nombre,
      monedaPago: 'USD'
    });

    // Update selection status
    await db
      .update(productSelections)
      .set({ estado: 'EN_GRUPO' })
      .where(eq(productSelections.id, selection.id));

    console.log(`Usuario añadido al grupo ${targetGroup.nombre} en posición ${position}`);

    // Check if group is now full
    const updatedCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userGroups)
      .where(eq(userGroups.groupId, targetGroup.id));

    const updatedCount = updatedCountResult[0];
    if (updatedCount && updatedCount.count >= product.tiempoDuracion) {
      // Mark group as full
      await db
        .update(groups)
        .set({
          estado: 'LLENO'
        })
        .where(eq(groups.id, targetGroup.id));

      console.log(`Grupo ${targetGroup.nombre} completado con ${updatedCount.count} miembros - Estado: LLENO`);
    }

  } catch (error) {
    console.error('Error procesando selección de producto:', error);
  }
}

// TEMPORAL: Endpoint sin auth para testing - REMOVER DESPUÉS
productSelectionsRoute.post('/simulate-test', async (c) => {
  console.log('🚨 ADVERTENCIA: Endpoint temporal de testing - remover después de usar');

  try {
    console.log('🎯 Ejecutando simulación estratégica desde endpoint de testing...');

    // Get all approved users
    const approvedUsers = await db
      .select({ id: users.id, nombre: users.nombre, apellido: users.apellido })
      .from(users)
      .where(eq(users.estado, 'APROBADO'));

    console.log(`👥 Encontrados ${approvedUsers.length} usuarios aprobados`);

    // Get all active products
    const activeProducts = await db
      .select({
        id: products.id,
        nombre: products.nombre,
        tiempoDuracion: products.tiempoDuracion
      })
      .from(products)
      .where(eq(products.activo, true));

    console.log(`📦 Encontrados ${activeProducts.length} productos activos`);

    // Sort products by duration (smaller groups first)
    const sortedProducts = activeProducts.sort((a, b) => a.tiempoDuracion - b.tiempoDuracion);

    let selectionsCreated = 0;
    let groupsFormed = 0;
    const assignedUsers = new Set<number>();

    // Strategy: Fill products with smaller group sizes first, then larger ones
    for (const product of sortedProducts) {
      console.log(`\n📦 Procesando producto: ${product.nombre} (${product.tiempoDuracion} meses)`);

      // Find users not yet assigned to any group
      const availableUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));

      if (availableUsers.length < product.tiempoDuracion) {
        console.log(`⚠️  No hay suficientes usuarios disponibles para ${product.nombre} (${availableUsers.length}/${product.tiempoDuracion})`);
        continue;
      }

      // Calculate how many full groups we can form
      const maxGroups = Math.floor(availableUsers.length / product.tiempoDuracion);

      for (let groupIndex = 0; groupIndex < maxGroups; groupIndex++) {
        console.log(`🎯 Formando grupo ${groupIndex + 1} de ${maxGroups} para ${product.nombre}`);

        // Select users for this group
        const groupUsers = availableUsers.slice(
          groupIndex * product.tiempoDuracion,
          (groupIndex + 1) * product.tiempoDuracion
        );

        try {
          // Create selections for all users in this group
          for (const user of groupUsers) {
            await db.insert(productSelections).values({
              userId: user.id,
              productId: product.id,
              estado: 'PENDIENTE'
            });

            selectionsCreated++;
            assignedUsers.add(user.id);
            console.log(`✅ ${user.nombre} ${user.apellido} asignado a: ${product.nombre}`);
          }

          // Create the group immediately
          const groupName = `Grupo de ${product.tiempoDuracion} meses`;
          const [newGroup] = await db
            .insert(groups)
            .values({
              nombre: groupName,
              duracionMeses: product.tiempoDuracion,
              estado: 'SIN_COMPLETAR',
              fechaInicio: null,
              turnoActual: 0
            })
            .returning();

          // Add all users to group and update selections
          for (let i = 0; i < groupUsers.length; i++) {
            const user = groupUsers[i];
            if (!user || !newGroup) continue;

            // Add to user_groups
            await db.insert(userGroups).values({
              userId: user.id,
              groupId: newGroup.id,
              posicion: i + 1,
              productoSeleccionado: product.nombre,
              monedaPago: 'USD'
            });

            // Update selection status
            await db
              .update(productSelections)
              .set({ estado: 'EN_GRUPO' })
              .where(and(
                eq(productSelections.userId, user.id),
                eq(productSelections.productId, product.id)
              ));
          }

          groupsFormed++;
          console.log(`🎊 Grupo "${groupName}" creado con ${product.tiempoDuracion} miembros!`);

        } catch (error) {
          console.error(`❌ Error creando grupo para ${product.nombre}:`, error);
        }
      }
    }

    // Check for remaining users
    const remainingUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));
    if (remainingUsers.length > 0) {
      console.log(`\n⚠️  ${remainingUsers.length} usuarios sin asignar. Creando grupos adicionales...`);

      // For remaining users, create additional groups with larger products
      const largeProducts = activeProducts.filter(p => p.tiempoDuracion >= 12);

      for (const product of largeProducts) {
        const needed = product.tiempoDuracion - remainingUsers.length;
        if (needed <= 0) {
          // We have enough remaining users for a full group
          const groupUsers = remainingUsers.splice(0, product.tiempoDuracion);

          try {
            // Create selections
            for (const user of groupUsers) {
              await db.insert(productSelections).values({
                userId: user.id,
                productId: product.id,
                estado: 'PENDIENTE'
              });
              selectionsCreated++;
              console.log(`✅ ${user.nombre} ${user.apellido} asignado a grupo adicional: ${product.nombre}`);
            }

            // Create group
            const groupName = `Grupo de ${product.tiempoDuracion} meses`;
            const [newGroup] = await db
              .insert(groups)
              .values({
                nombre: groupName,
                duracionMeses: product.tiempoDuracion,
                estado: 'SIN_COMPLETAR',
                fechaInicio: null,
                turnoActual: 0
              })
              .returning();

            // Add users to group
            for (let i = 0; i < groupUsers.length; i++) {
              const user = groupUsers[i];
              if (!user || !newGroup) continue;

              await db.insert(userGroups).values({
                userId: user.id,
                groupId: newGroup.id,
                posicion: i + 1,
                productoSeleccionado: product.nombre,
                monedaPago: 'USD'
              });

              await db
                .update(productSelections)
                .set({ estado: 'EN_GRUPO' })
                .where(and(
                  eq(productSelections.userId, user.id),
                  eq(productSelections.productId, product.id)
                ));
            }

            groupsFormed++;
            console.log(`🎊 Grupo adicional "${groupName}" creado!`);

          } catch (error) {
            console.error(`❌ Error creando grupo adicional:`, error);
          }
        }
      }
    }

    console.log('\n🎉 Simulación estratégica completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Selecciones creadas: ${selectionsCreated}`);
    console.log(`   - Grupos formados: ${groupsFormed}`);
    console.log(`   - Usuarios asignados: ${assignedUsers.size}/${approvedUsers.length}`);

    return c.json({
      success: true,
      message: 'Simulación completada exitosamente',
      data: {
        selectionsCreated,
        groupsFormed,
        usersAssigned: assignedUsers.size,
        totalUsers: approvedUsers.length
      }
    });

  } catch (error) {
    console.error('❌ Error en simulación:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor durante simulación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

// Admin endpoint to run simulation - only for testing
productSelectionsRoute.post('/simulate', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado - solo administradores'
      }, 403);
    }

    console.log('🎯 Ejecutando simulación estratégica desde endpoint...');

    // Get all approved users
    const approvedUsers = await db
      .select({ id: users.id, nombre: users.nombre, apellido: users.apellido })
      .from(users)
      .where(eq(users.estado, 'APROBADO'));

    console.log(`👥 Encontrados ${approvedUsers.length} usuarios aprobados`);

    // Get all active products
    const activeProducts = await db
      .select({
        id: products.id,
        nombre: products.nombre,
        tiempoDuracion: products.tiempoDuracion
      })
      .from(products)
      .where(eq(products.activo, true));

    console.log(`📦 Encontrados ${activeProducts.length} productos activos`);

    // Sort products by duration (smaller groups first)
    const sortedProducts = activeProducts.sort((a, b) => a.tiempoDuracion - b.tiempoDuracion);

    let selectionsCreated = 0;
    let groupsFormed = 0;
    const assignedUsers = new Set<number>();

    // Strategy: Fill products with smaller group sizes first, then larger ones
    for (const product of sortedProducts) {
      console.log(`\n📦 Procesando producto: ${product.nombre} (${product.tiempoDuracion} meses)`);

      // Find users not yet assigned to any group
      const availableUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));

      if (availableUsers.length < product.tiempoDuracion) {
        console.log(`⚠️  No hay suficientes usuarios disponibles para ${product.nombre} (${availableUsers.length}/${product.tiempoDuracion})`);
        continue;
      }

      // Calculate how many full groups we can form
      const maxGroups = Math.floor(availableUsers.length / product.tiempoDuracion);

      for (let groupIndex = 0; groupIndex < maxGroups; groupIndex++) {
        console.log(`🎯 Formando grupo ${groupIndex + 1} de ${maxGroups} para ${product.nombre}`);

        // Select users for this group
        const groupUsers = availableUsers.slice(
          groupIndex * product.tiempoDuracion,
          (groupIndex + 1) * product.tiempoDuracion
        );

        try {
          // Create selections for all users in this group
          for (const user of groupUsers) {
            await db.insert(productSelections).values({
              userId: user.id,
              productId: product.id,
              estado: 'PENDIENTE'
            });

            selectionsCreated++;
            assignedUsers.add(user.id);
            console.log(`✅ ${user.nombre} ${user.apellido} asignado a: ${product.nombre}`);
          }

          // Create the group immediately
          const groupName = `Grupo de ${product.tiempoDuracion} meses`;
          const [newGroup] = await db
            .insert(groups)
            .values({
              nombre: groupName,
              duracionMeses: product.tiempoDuracion,
              estado: 'ACTIVO',
              fechaInicio: new Date(),
              turnoActual: 1
            })
            .returning();

          // Add all users to group and update selections
          for (let i = 0; i < groupUsers.length; i++) {
            const user = groupUsers[i];
            if (!user || !newGroup) continue;

            // Add to user_groups
            await db.insert(userGroups).values({
              userId: user.id,
              groupId: newGroup.id,
              posicion: i + 1,
              productoSeleccionado: product.nombre,
              monedaPago: 'USD'
            });

            // Update selection status
            await db
              .update(productSelections)
              .set({ estado: 'EN_GRUPO' })
              .where(and(
                eq(productSelections.userId, user.id),
                eq(productSelections.productId, product.id)
              ));
          }

          groupsFormed++;
          console.log(`🎊 Grupo "${groupName}" creado con ${product.tiempoDuracion} miembros!`);

        } catch (error) {
          console.error(`❌ Error creando grupo para ${product.nombre}:`, error);
        }
      }
    }

    // Check for remaining users
    const remainingUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));
    if (remainingUsers.length > 0) {
      console.log(`\n⚠️  ${remainingUsers.length} usuarios sin asignar. Creando grupos adicionales...`);

      // For remaining users, create additional groups with larger products
      const largeProducts = activeProducts.filter(p => p.tiempoDuracion >= 12);

      for (const product of largeProducts) {
        const needed = product.tiempoDuracion - remainingUsers.length;
        if (needed <= 0) {
          // We have enough remaining users for a full group
          const groupUsers = remainingUsers.splice(0, product.tiempoDuracion);

          try {
            // Create selections
            for (const user of groupUsers) {
              await db.insert(productSelections).values({
                userId: user.id,
                productId: product.id,
                estado: 'PENDIENTE'
              });
              selectionsCreated++;
              console.log(`✅ ${user.nombre} ${user.apellido} asignado a grupo adicional: ${product.nombre}`);
            }

            // Create group
            const groupName = `Grupo de ${product.tiempoDuracion} meses - ${product.nombre} - ${new Date().toLocaleDateString('es-VE')} EXTRA`;
            const [newGroup] = await db
              .insert(groups)
              .values({
                nombre: groupName,
                duracionMeses: product.tiempoDuracion,
                estado: 'ACTIVO',
                fechaInicio: new Date(),
                turnoActual: 1
              })
              .returning();

            // Add users to group
            for (let i = 0; i < groupUsers.length; i++) {
              const user = groupUsers[i];
              if (!user || !newGroup) continue;

              await db.insert(userGroups).values({
                userId: user.id,
                groupId: newGroup.id,
                posicion: i + 1,
                productoSeleccionado: product.nombre,
                monedaPago: 'USD'
              });

              await db
                .update(productSelections)
                .set({ estado: 'EN_GRUPO' })
                .where(and(
                  eq(productSelections.userId, user.id),
                  eq(productSelections.productId, product.id)
                ));
            }

            groupsFormed++;
            console.log(`🎊 Grupo adicional "${groupName}" creado!`);

          } catch (error) {
            console.error(`❌ Error creando grupo adicional:`, error);
          }
        }
      }
    }

    console.log('\n🎉 Simulación estratégica completada!');
    console.log(`📊 Resumen:`);
    console.log(`   - Selecciones creadas: ${selectionsCreated}`);
    console.log(`   - Grupos formados: ${groupsFormed}`);
    console.log(`   - Usuarios asignados: ${assignedUsers.size}/${approvedUsers.length}`);

    return c.json({
      success: true,
      message: 'Simulación completada exitosamente',
      data: {
        selectionsCreated,
        groupsFormed,
        usersAssigned: assignedUsers.size,
        totalUsers: approvedUsers.length
      }
    });

  } catch (error) {
    console.error('❌ Error en simulación:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor durante simulación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, 500);
  }
});

export default productSelectionsRoute;
