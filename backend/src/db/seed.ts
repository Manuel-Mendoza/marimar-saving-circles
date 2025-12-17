import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { products } from './tables/products';

// Cargar variables de entorno desde backend/.env
dotenv.config({ path: './backend/.env' });

// Conexión a la base de datos
const connectionString = process.env.DATABASE_URL!;
console.log('🔗 Conectando a:', connectionString ? 'URL configurada' : 'URL no encontrada');
const client = postgres(connectionString);
const db = drizzle(client);

// Script para poblar productos en las tablas nuevas con IDs numéricos
// Para usar las nuevas tablas, cambia 'products' por 'products_new'

async function seedNewTables() {
  console.log('🌱 Poblando productos en tablas nuevas con IDs numéricos...');

  // Aquí puedes poblar las nuevas tablas si decides migrar completamente
  // Por ahora, los productos ya están en las tablas originales
}

// Datos iniciales de productos para círculos de ahorro - PRODUCTOS DEL USUARIO
const initialProducts = [
  // ELECTRODOMÉSTICOS GRANDES
  {
    nombre: 'Aire acondicionado 5 mil BTU',
    precioUsd: 40 * 7, // 40$ x 7 meses = 280$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Aire acondicionado de 5 mil BTU - 40$ x 7 meses',
    activo: true,
  },
  {
    nombre: 'Aire acondicionado Ventana 12 mil BTU',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 65 * 7, // 65$ x 7 meses = 455$
    tiempoDuracion: 7,
    descripcion: 'Aire acondicionado ventana de 12 mil BTU - 45$ x 7 meses (USD) / 65$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Aire acondicionado Split 12 mil BTU',
    precioUsd: 48 * 7, // 48$ x 7 meses = 336$
    precioVes: 70 * 7, // 70$ x 7 meses = 490$
    tiempoDuracion: 7,
    descripcion: 'Aire acondicionado split de 12 mil BTU - 48$ x 7 meses (USD) / 70$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Aire acondicionado Split 18 mil BTU',
    precioUsd: 65 * 7, // 65$ x 7 meses = 455$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Aire acondicionado split de 18 mil BTU - 65$ x 7 meses',
    activo: true,
  },

  // CONGELADORES
  {
    nombre: 'Congelador 100 litros',
    precioUsd: 40 * 5, // 40$ x 5 meses = 200$
    precioVes: 0, // No especificado
    tiempoDuracion: 5,
    descripcion: 'Congelador de 100 litros - 40$ x 5 meses',
    activo: true,
  },
  {
    nombre: 'Congelador 200 litros',
    precioUsd: 50 * 7, // 50$ x 7 meses = 350$
    precioVes: 70 * 7, // 70$ x 7 meses = 490$
    tiempoDuracion: 7,
    descripcion: 'Congelador de 200 litros - 50$ x 7 meses (USD) / 70$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Congelador 300 litros',
    precioUsd: 65 * 7, // 65$ x 7 meses = 455$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Congelador de 300 litros - 65$ x 7 meses',
    activo: true,
  },

  // NEVERAS
  {
    nombre: 'Nevera 200 litros (sin escarcha)',
    precioUsd: 65 * 7, // 65$ x 7 meses = 455$
    precioVes: 80 * 7, // 80$ x 7 meses = 560$
    tiempoDuracion: 7,
    descripcion: 'Nevera de 200 litros sin escarcha - 65$ x 7 meses (USD) / 80$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Nevera 338 litros (sin escarcha)',
    precioUsd: 110 * 7, // 110$ x 7 meses = 770$
    precioVes: 135 * 7, // 135$ x 7 meses = 945$
    tiempoDuracion: 7,
    descripcion: 'Nevera de 338 litros sin escarcha - 110$ x 7 meses (USD) / 135$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Nevera 169 litros (semiescarcha)',
    precioUsd: 55 * 7, // 55$ x 7 meses = 385$
    precioVes: 80 * 7, // 80$ x 7 meses = 560$
    tiempoDuracion: 7,
    descripcion: 'Nevera de 169 litros semiescarcha - 55$ x 7 meses (USD) / 80$ x 7 meses (BCV)',
    activo: true,
  },

  // LAVADORAS
  {
    nombre: 'Lavadora de 12 kilos',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 60 * 7, // 60$ x 7 meses = 420$
    tiempoDuracion: 7,
    descripcion: 'Lavadora de 12 kilos - 45$ x 7 meses (USD) / 60$ x 7 meses (BCV)',
    activo: true,
  },

  // COCINAS
  {
    nombre: 'Cocina de 6 hornillas',
    precioUsd: 60 * 7, // 60$ x 7 meses = 420$
    precioVes: 80 * 7, // 80$ x 7 meses = 560$
    tiempoDuracion: 7,
    descripcion: 'Cocina de 6 hornillas - 60$ x 7 meses (USD) / 80$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Cocina de 4 hornillas',
    precioUsd: 45 * 5, // 45$ x 5 meses = 225$
    precioVes: 60 * 5, // 60$ x 5 meses = 300$
    tiempoDuracion: 5,
    descripcion: 'Cocina de 4 hornillas - 45$ x 5 meses (USD) / 60$ x 5 meses (BCV)',
    activo: true,
  },

  // ELECTRODOMÉSTICOS PEQUEÑOS
  {
    nombre: 'Horno 60 litros',
    precioUsd: 25 * 8, // 25$ x 8 quincenas = 200$
    precioVes: 40 * 8, // 40$ x 8 quincenas = 320$
    tiempoDuracion: 16, // 8 quincenas = 16 semanas = ~4 meses, pero mantengo como está
    descripcion: 'Horno de 60 litros - 25$ x 8 quincenas (USD) / 40$ x 8 quincenas (BCV)',
    activo: true,
  },
  {
    nombre: 'Freidora de aire 7 litros',
    precioUsd: 30 * 4, // 30$ x 4 meses = 120$
    precioVes: 0, // No especificado
    tiempoDuracion: 4,
    descripcion: 'Freidora de aire de 7 litros - 30$ x 4 meses',
    activo: true,
  },
  {
    nombre: 'Licuadora Ninja 1400 watts',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Licuadora Ninja 1400 watts - 20$ x 8 quincenas',
    activo: true,
  },
  {
    nombre: 'Batidora 5 litros 700 watts',
    precioUsd: 40 * 4, // 40$ x 4 meses = 160$
    precioVes: 0, // No especificado
    tiempoDuracion: 4,
    descripcion: 'Batidora de 5 litros 700 watts - 40$ x 4 meses',
    activo: true,
  },
  {
    nombre: 'Olla de Presión Eléctrica 6 litros',
    precioUsd: 30 * 4, // 30$ x 4 meses = 120$
    precioVes: 0, // No especificado
    tiempoDuracion: 4,
    descripcion: 'Olla de presión eléctrica de 6 litros - 30$ x 4 meses',
    activo: true,
  },

  // TELEVISORES
  {
    nombre: 'Smart TV 32"',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 32 * 7, // 32$ x 7 meses = 224$
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Smart TV de 32 pulgadas - 20$ x 8 quincenas (USD) / 32$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Smart TV 43"',
    precioUsd: 45 * 6, // 45$ x 6 meses = 270$
    precioVes: 55 * 7, // 55$ x 7 meses = 385$
    tiempoDuracion: 6,
    descripcion: 'Smart TV de 43 pulgadas - 45$ x 6 meses (USD) / 55$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Smart TV 50"',
    precioUsd: 60 * 7, // 60$ x 7 meses = 420$
    precioVes: 80 * 7, // 80$ x 7 meses = 560$
    tiempoDuracion: 7,
    descripcion: 'Smart TV de 50 pulgadas - 60$ x 7 meses (USD) / 80$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Smart TV 65"',
    precioUsd: 100 * 7, // 100$ x 7 meses = 700$
    precioVes: 120 * 7, // 120$ x 7 meses = 840$
    tiempoDuracion: 7,
    descripcion: 'Smart TV de 65 pulgadas - 100$ x 7 meses (USD) / 120$ x 7 meses (BCV)',
    activo: true,
  },

  // COMPUTADORAS
  {
    nombre: 'Laptop 8/256 GB',
    precioUsd: 50 * 7, // 50$ x 7 meses = 350$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Laptop con 8GB RAM y 256GB SSD - 50$ x 7 meses',
    activo: true,
  },
  {
    nombre: 'Computadora de escritorio 8/256 GB 19"',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Computadora de escritorio 8GB RAM, 256GB SSD, monitor 19" - 45$ x 7 meses',
    activo: true,
  },
  {
    nombre: 'Impresora tinta continua color/negro',
    precioUsd: 50 * 5, // 50$ x 5 meses = 250$
    precioVes: 0, // No especificado
    tiempoDuracion: 5,
    descripcion: 'Impresora de tinta continua color y negro - 50$ x 5 meses',
    activo: true,
  },

  // CELULARES
  {
    nombre: 'Infinix Hot 50',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Celular Infinix Hot 50 - 20$ x 8 quincenas',
    activo: true,
  },
  {
    nombre: 'Redmi 14C',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Celular Redmi 14C - 20$ x 8 quincenas',
    activo: true,
  },
  {
    nombre: 'Motorola G24',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Celular Motorola G24 - 20$ x 8 quincenas',
    activo: true,
  },
  {
    nombre: 'Samsung A16',
    precioUsd: 25 * 8, // 25$ x 8 quincenas = 200$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Celular Samsung A16 - 25$ x 8 quincenas',
    activo: true,
  },
  {
    nombre: 'Infinix Hot 50 Pro',
    precioUsd: 25 * 8, // 25$ x 8 quincenas = 200$
    precioVes: 0, // No especificado
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Celular Infinix Hot 50 Pro - 25$ x 8 quincenas',
    activo: true,
  },

  // MUEBLES
  {
    nombre: 'Cama + Colchón matrimonial (semiortop.)',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 65 * 7, // 65$ x 7 meses = 455$
    tiempoDuracion: 7,
    descripcion: 'Cama matrimonial con colchón semiortopédico - 45$ x 7 meses (USD) / 65$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Sofá modular',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 70 * 7, // 70$ x 7 meses = 490$
    tiempoDuracion: 7,
    descripcion: 'Sofá modular - 45$ x 7 meses (USD) / 70$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Colchón Matrimonial semiortopédico',
    precioUsd: 25 * 8, // 25$ x 8 quincenas = 200$
    precioVes: 35 * 7, // 35$ x 7 meses = 245$
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Colchón matrimonial semiortopédico - 25$ x 8 quincenas (USD) / 35$ x 7 meses (BCV)',
    activo: true,
  },
  {
    nombre: 'Colchón Individual semiortopédico',
    precioUsd: 20 * 8, // 20$ x 8 quincenas = 160$
    precioVes: 30 * 8, // 30$ x 8 quincenas = 240$
    tiempoDuracion: 16, // 8 quincenas
    descripcion: 'Colchón individual semiortopédico - 20$ x 8 quincenas (USD) / 30$ x 8 quincenas (BCV)',
    activo: true,
  },
  {
    nombre: 'Colchón King Size',
    precioUsd: 55 * 7, // 55$ x 7 meses = 385$
    precioVes: 0, // No especificado
    tiempoDuracion: 7,
    descripcion: 'Colchón King Size - 55$ x 7 meses',
    activo: true,
  },
  {
    nombre: 'Peinadora blanca con luces',
    precioUsd: 45 * 7, // 45$ x 7 meses = 315$
    precioVes: 55 * 7, // 55$ x 7 meses = 385$
    tiempoDuracion: 7,
    descripcion: 'Peinadora blanca con luces - 45$ x 7 meses (USD) / 55$ x 7 meses (BCV)',
    activo: true,
  },
];

async function clearExistingProducts() {
  try {
    console.log('🗑️ Eliminando productos existentes...');
    await db.delete(products);
    console.log('✅ Productos existentes eliminados');
  } catch (error) {
    console.error('❌ Error eliminando productos:', error);
    throw error;
  }
}

async function seedProducts() {
  try {
    console.log('🌱 Iniciando seeding de productos...');

    // Limpiar productos existentes primero
    await clearExistingProducts();

    // Insertar productos uno por uno para evitar conflictos
    for (const product of initialProducts) {
      await db.insert(products).values(product).onConflictDoNothing();
      console.log(`✅ Insertado: ${product.nombre}`);
    }

    console.log('🎉 Seeding completado exitosamente!');
    console.log(`📊 Total de productos agregados: ${initialProducts.length}`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
  } finally {
    await client.end();
  }
}

// Ejecutar seeding
seedProducts().catch(console.error);

export { seedProducts, initialProducts };
