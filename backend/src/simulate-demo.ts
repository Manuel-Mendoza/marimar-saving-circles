// Demo simulation of user product selections and automatic group formation
// This runs without database connection to show how the system works

interface Product {
  id: number;
  nombre: string;
  tiempoDuracion: number;
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
}

interface ProductSelection {
  userId: number;
  productId: number;
  user: User;
  product: Product;
}

function simulateUserSelections() {
  console.log('🎯 Iniciando simulación DEMO de selecciones de productos...\n');

  // Mock data - simulating the actual data from database
  const mockUsers: User[] = [
    { id: 1, nombre: 'Juan', apellido: 'Pérez' },
    { id: 2, nombre: 'María', apellido: 'García' },
    { id: 3, nombre: 'Carlos', apellido: 'Rodríguez' },
    { id: 4, nombre: 'Ana', apellido: 'González' },
    { id: 5, nombre: 'Luis', apellido: 'Martínez' },
    { id: 6, nombre: 'Carmen', apellido: 'Sánchez' },
    { id: 7, nombre: 'José', apellido: 'López' },
    { id: 8, nombre: 'Isabel', apellido: 'Hernández' },
    { id: 9, nombre: 'Miguel', apellido: 'Moreno' },
    { id: 10, nombre: 'Teresa', apellido: 'Jiménez' },
    // ... más usuarios
  ];

  // Add more mock users to simulate 150
  for (let i = 11; i <= 150; i++) {
    mockUsers.push({
      id: i,
      nombre: `Usuario${i}`,
      apellido: `Apellido${i}`
    });
  }

  const mockProducts: Product[] = [
    { id: 1, nombre: 'iPhone 15 Pro 256GB', tiempoDuracion: 24 },
    { id: 2, nombre: 'MacBook Air M2 13"', tiempoDuracion: 24 },
    { id: 3, nombre: 'Samsung Galaxy S24 Ultra', tiempoDuracion: 22 },
    { id: 4, nombre: 'Smart TV Samsung 55"', tiempoDuracion: 18 },
    { id: 5, nombre: 'Refrigerador LG Double Door', tiempoDuracion: 15 },
    { id: 6, nombre: 'Lavadora Samsung 18kg', tiempoDuracion: 12 },
    { id: 7, nombre: 'Aire Acondicionado Carrier 12000 BTU', tiempoDuracion: 14 },
    { id: 8, nombre: 'Laptop Dell Inspiron 15"', tiempoDuracion: 16 },
    { id: 9, nombre: 'Cocina a Gas Whirlpool 5 Quemadores', tiempoDuracion: 10 },
    { id: 10, nombre: 'Microondas LG 30L', tiempoDuracion: 6 },
    { id: 11, nombre: 'Bicicleta Eléctrica Xiaomi', tiempoDuracion: 15 },
    { id: 12, nombre: 'Moto Yamaha YBR 125', tiempoDuracion: 48 },
    { id: 13, nombre: 'Colchón Memory Foam King Size', tiempoDuracion: 8 },
    { id: 14, nombre: 'Silla Ergonómica para Oficina', tiempoDuracion: 8 },
    { id: 15, nombre: 'Cafetera Espresso DeLonghi', tiempoDuracion: 8 },
  ];

  console.log(`👥 Simulando ${mockUsers.length} usuarios aprobados`);
  console.log(`📦 Simulando ${mockProducts.length} productos activos\n`);

  const selections: ProductSelection[] = [];
  const groupsFormed: { product: Product; members: User[]; groupName: string }[] = [];
  let selectionsCreated = 0;

  // Process each user
  for (const user of mockUsers) {
    // Skip some users randomly to simulate real behavior
    if (Math.random() > 0.85) continue;

    // Select random product
    const randomProduct = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    if (!randomProduct) continue;

    selections.push({
      userId: user.id,
      productId: randomProduct.id,
      user,
      product: randomProduct
    });

    selectionsCreated++;
    console.log(`✅ ${user.nombre} ${user.apellido} seleccionó: ${randomProduct.nombre}`);

    // Check if group should be formed
    const productSelections = selections.filter(s => s.productId === randomProduct.id);

    if (productSelections.length >= randomProduct.tiempoDuracion) {
      console.log(`🎉 ¡Grupo completo para ${randomProduct.nombre}! Formando grupo...`);

      // Take the first N users for this product
      const groupMembers = productSelections.slice(0, randomProduct.tiempoDuracion).map(s => s.user);
      const groupName = `Grupo de ${randomProduct.tiempoDuracion} meses`;

      groupsFormed.push({
        product: randomProduct,
        members: groupMembers,
        groupName
      });

      console.log(`🎊 Grupo "${groupName}" creado con ${randomProduct.tiempoDuracion} miembros!`);
      console.log(`   👥 Miembros: ${groupMembers.map(u => `${u.nombre} ${u.apellido}`).join(', ')}\n`);
    }
  }

  console.log('🎉 Simulación completada!');
  console.log(`📊 Resumen:`);
  console.log(`   - Selecciones creadas: ${selectionsCreated}`);
  console.log(`   - Grupos formados: ${groupsFormed.length}`);

  console.log('\n📋 Detalles de Grupos Formados:');
  groupsFormed.forEach((group, index) => {
    console.log(`\n${index + 1}. ${group.groupName}`);
    console.log(`   📦 Producto: ${group.product.nombre}`);
    console.log(`   ⏱️  Duración: ${group.product.tiempoDuracion} meses`);
    console.log(`   👥 Miembros (${group.members.length}):`);
    group.members.forEach((member, i) => {
      console.log(`      ${i + 1}. ${member.nombre} ${member.apellido}`);
    });
  });

  console.log('\n🏁 DEMO completada exitosamente');
  console.log('\n💡 Para ejecutar en base de datos real:');
  console.log('   npx tsx backend/src/simulate-selections.ts');
}

// Run the demo
simulateUserSelections();
