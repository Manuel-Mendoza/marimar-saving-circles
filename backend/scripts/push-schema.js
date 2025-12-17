import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql } from 'drizzle-orm';

// Cargar variables de entorno desde backend/.env
dotenv.config({ path: './backend/.env' });

// Conexión a la base de datos
const connectionString = process.env.DATABASE_URL;
console.log('🔗 Conectando a base de datos...');

const client = postgres(connectionString);
const db = drizzle(client);

async function convertToNumericIds() {
  try {
    console.log('🔄 Convirtiendo IDs de UUID a numéricos auto-incrementales...');

    // Crear nuevas tablas con IDs numéricos
    console.log('📝 Creando nuevas tablas con IDs numéricos...');

    // 1. Crear tabla users nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users_new (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        cedula TEXT NOT NULL UNIQUE,
        telefono TEXT NOT NULL,
        direccion TEXT NOT NULL,
        correo_electronico TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'USUARIO',
        fecha_registro TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Crear tabla groups nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS groups_new (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        duracion_meses INTEGER NOT NULL,
        estado TEXT NOT NULL DEFAULT 'SIN_COMPLETAR',
        fecha_inicio TIMESTAMP,
        fecha_final TIMESTAMP,
        turno_actual INTEGER DEFAULT 1
      );
    `);

    // 3. Crear tabla user_groups nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_groups_new (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES groups_new(id) ON DELETE CASCADE,
        posicion INTEGER NOT NULL,
        fecha_union TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Crear tabla products nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products_new (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        precio_usd REAL NOT NULL,
        precio_ves REAL NOT NULL,
        tiempo_duracion INTEGER NOT NULL,
        imagen TEXT,
        descripcion TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT true
      );
    `);

    // 5. Crear tabla contributions nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS contributions_new (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES groups_new(id) ON DELETE CASCADE,
        monto REAL NOT NULL,
        moneda TEXT DEFAULT 'USD',
        fecha_pago TIMESTAMP NOT NULL DEFAULT NOW(),
        periodo TEXT NOT NULL,
        metodo_pago TEXT,
        estado TEXT NOT NULL DEFAULT 'PENDIENTE',
        referencia_pago TEXT
      );
    `);

    // 6. Crear tabla deliveries nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deliveries_new (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES groups_new(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        product_value TEXT NOT NULL,
        fecha_entrega TIMESTAMP NOT NULL DEFAULT NOW(),
        mes_entrega TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'ENTREGADO',
        notas TEXT
      );
    `);

    // 7. Crear tabla notifications nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications_new (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        titulo TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        leido BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Crear tabla payment_options nueva
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payment_options_new (
        id SERIAL PRIMARY KEY,
        tipo TEXT NOT NULL,
        detalles TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT true,
        fecha_creacion TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 9. Crear tabla chat_sessions nueva (aunque no se use)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS chat_sessions_new (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        session_id TEXT NOT NULL UNIQUE,
        messages TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    console.log('✅ Nuevas tablas con IDs numéricos creadas exitosamente!');
    console.log('📝 Ahora puedes migrar los datos si es necesario, o simplemente usar las nuevas tablas.');

  } catch (error) {
    console.error('❌ Error convirtiendo IDs:', error);
    throw error;
  }
}

async function pushSchema() {
  try {
    console.log('🔄 Sincronizando esquema...');

    // Primero actualizar las tablas existentes
    await db.execute(sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS precio_usd REAL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS precio_ves REAL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
    `);

    await db.execute(sql`
      ALTER TABLE products
      DROP COLUMN IF EXISTS valor_mensual,
      DROP COLUMN IF EXISTS valor_quincenal;
    `);

    await db.execute(sql`
      ALTER TABLE groups
      ADD COLUMN IF NOT EXISTS duracion_meses INTEGER,
      ADD COLUMN IF NOT EXISTS turno_actual INTEGER DEFAULT 1,
      DROP COLUMN IF EXISTS semana,
      DROP COLUMN IF EXISTS mes,
      DROP COLUMN IF EXISTS valor;
    `);

    await db.execute(sql`
      ALTER TABLE user_groups
      ADD COLUMN IF NOT EXISTS posicion INTEGER NOT NULL DEFAULT 1;
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
        product_name TEXT NOT NULL,
        product_value TEXT NOT NULL,
        fecha_entrega TIMESTAMP NOT NULL DEFAULT NOW(),
        mes_entrega TEXT NOT NULL,
        estado TEXT NOT NULL DEFAULT 'ENTREGADO',
        notas TEXT
      );
    `);

    await db.execute(sql`
      ALTER TABLE contributions
      ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS referencia_pago TEXT;
    `);

    console.log('✅ Esquema sincronizado exitosamente!');

  } catch (error) {
    console.error('❌ Error sincronizando esquema:', error);
    throw error;
  }
}

async function main() {
  try {
    // Primero sincronizar esquema
    await pushSchema();

    // Luego convertir a IDs numéricos
    await convertToNumericIds();

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    process.exit(1);
  }
}

main();
