import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/index.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres client with enhanced configuration
const client = postgres(connectionString, {
  prepare: false,
  // Connection pool settings
  max: 20, // Maximum number of connections
  idle_timeout: 20, // Close idle connections after 20 seconds
  max_lifetime: 60 * 60 * 24, // Close connections after 24 hours
  // Error handling
  onnotice: (notice) => {
    console.warn("Database notice:", notice);
  },
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Connection functions
export const connectDB = async (): Promise<void> => {
  try {
    // Test connection with timeout
    const connectionTest = await Promise.race([
      client`SELECT 1`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      )
    ]);
    
    console.log("✅ Database connection established successfully");
    
    // Test schema access
    try {
      await db.query.users.findFirst();
    } catch (schemaError) {
      if (schemaError instanceof Error) {
        console.warn("⚠️  Schema validation warning:", schemaError.message);
      } else {
        console.warn("⚠️  Schema validation warning:", String(schemaError));
      }
    }
  } catch (error) {
    console.error("❌ PostgreSQL connection error:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.error("💡 Make sure PostgreSQL is running and accessible");
      } else if (error.message.includes("authentication failed")) {
        console.error("💡 Check your DATABASE_URL credentials");
      } else if (error.message.includes("database does not exist")) {
        console.error("💡 Create the database or check the database name in DATABASE_URL");
      }
    }
    
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await client.end();
    console.log("✅ Database connection closed successfully");
  } catch (error) {
    console.error("❌ Error closing database connection:", error);
  }
};

// Enhanced graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Stop accepting new connections
    console.log("🛑 Stopping new connections...");
    
    // Wait for active connections to finish (with timeout)
    const shutdownTimeout = setTimeout(() => {
      console.error("❌ Force closing connections due to timeout");
      process.exit(1);
    }, 10000);
    
    await disconnectDB();
    clearTimeout(shutdownTimeout);
    
    console.log("✅ Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  disconnectDB().finally(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  disconnectDB().finally(() => process.exit(1));
});
