import { seedProducts } from '../src/db/seed.js';

async function main() {
  try {
    await seedProducts();
    console.log('✅ Seed completado exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

main();
