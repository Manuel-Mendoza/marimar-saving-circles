import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/index.js';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}
console.log('🔧 Using DATABASE_URL: SET');
console.log('🔧 Connection string starts with:', connectionString.substring(0, 20) + '...');

// Create postgres client
const client = postgres(connectionString, {
  prepare: false,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Connection functions
export const connectDB = async (): Promise<void> => {
  try {
    // Test connection
    await client`SELECT 1`;
    console.log('🍃 PostgreSQL Connected with Drizzle');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await client.end();
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection...');
  await disconnectDB();
  process.exit(0);
});
