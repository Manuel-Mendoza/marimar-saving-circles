import { db } from './config/database.js';
import { products } from './db/tables/products.js';
import { sql } from 'drizzle-orm';

async function removeClimatizacionTag() {
  try {
    console.log('🔄 Eliminando el tag "climatización" de todos los productos...');

    // Update query to remove 'climatización' from tags array
    await db.update(products)
      .set({
        tags: sql`array_remove(${products.tags}, 'climatización')`
      })
      .where(sql`'climatización' = ANY(${products.tags})`);

    console.log('✅ Tag "climatización" eliminado exitosamente de todos los productos');

  } catch (error) {
    console.error('❌ Error al eliminar el tag:', error);
    throw error;
  }
}

// Run the function
removeClimatizacionTag()
  .then(() => {
    console.log('🏁 Operación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
