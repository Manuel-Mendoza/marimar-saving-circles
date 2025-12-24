import { db } from './config/database.js';
import { users } from './db/tables/users.js';
import { products } from './db/tables/products.js';
import { productSelections } from './db/tables/product-selections.js';
import { groups } from './db/tables/groups.js';
import { userGroups } from './db/tables/user-groups.js';
import { eq, and } from 'drizzle-orm';

async function simulateUserSelections() {
  try {
    console.log('🎯 Iniciando simulación estratégica de selecciones...');

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

    // Strategy: Create maximum 10 groups total, prioritizing different durations
    const maxTotalGroups = 10;
    let totalGroupsCreated = 0;

    for (const product of sortedProducts) {
      if (totalGroupsCreated >= maxTotalGroups) break;

      console.log(`\n📦 Procesando producto: ${product.nombre} (${product.tiempoDuracion} meses)`);

      // Find users not yet assigned to any group
      const availableUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));

      if (availableUsers.length < product.tiempoDuracion) {
        console.log(`⚠️  No hay suficientes usuarios disponibles para ${product.nombre} (${availableUsers.length}/${product.tiempoDuracion})`);
        continue;
      }

      // Create groups for this duration until we reach max total or run out of users
      let groupsForThisDuration = 0;
      while (totalGroupsCreated < maxTotalGroups && availableUsers.length >= product.tiempoDuracion) {
        const currentAvailableUsers = approvedUsers.filter(user => !assignedUsers.has(user.id));

        if (currentAvailableUsers.length < product.tiempoDuracion) break;

        console.log(`🎯 Formando grupo ${groupsForThisDuration + 1} para ${product.nombre} (${product.tiempoDuracion} meses)`);

        // Always create full groups for this duration
        const groupSize = product.tiempoDuracion;
        const groupUsers = currentAvailableUsers.slice(0, groupSize);

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

          // Create the group
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

          // Since the group is now full, mark it as LLENO
          if (newGroup) {
            await db
              .update(groups)
              .set({ estado: 'LLENO' })
              .where(eq(groups.id, newGroup.id));
          }

          groupsFormed++;
          totalGroupsCreated++;
          groupsForThisDuration++;

          console.log(`🎊 Grupo "${groupName}" creado y marcado como LLENO con ${groupUsers.length} miembros!`);
          console.log(`📊 Progreso: ${totalGroupsCreated}/${maxTotalGroups} grupos totales creados`);

        } catch (error) {
          console.error(`❌ Error creando grupo para ${product.nombre}:`, error);
        }
      }

      console.log(`✅ Completado ${groupsForThisDuration} grupos para ${product.nombre}`);
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

  } catch (error) {
    console.error('❌ Error en simulación estratégica:', error);
    throw error;
  }
}

// Run the simulation
simulateUserSelections()
  .then(() => {
    console.log('🏁 Simulación finalizada exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal en simulación:', error);
    process.exit(1);
  });
