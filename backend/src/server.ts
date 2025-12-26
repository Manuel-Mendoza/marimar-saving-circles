import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import productSelectionsRoutes from "./routes/product-selections.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const app = new Hono();
const PORT = parseInt(process.env.PORT || "5000");

// Connect to database
connectDB();

// Middleware
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";

// CORS middleware - more permissive for development
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // Allow localhost on any port for development
      if (
        origin?.startsWith("http://localhost:") ||
        origin === frontendUrl ||
        !origin
      ) {
        return origin;
      }
      return null;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  })
);

// Additional CORS headers for preflight requests
app.options("*", (c) => {
  return c.text("", 200);
});

app.use("*", rateLimiter);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/groups", groupRoutes);
app.route("/api/users", userRoutes);
app.route("/api/products", productRoutes);
app.route("/api/product-selections", productSelectionsRoutes);

// WebSocket connections storage
const groupConnections = new Map<number, WebSocket[]>();

// Function to broadcast messages to all connections in a group
export const broadcastToGroup = (groupId: number, message: any) => {
  const connections = groupConnections.get(groupId) || [];
  const messageString = JSON.stringify(message);

  connections.forEach((ws) => {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageString);
      }
    } catch (error) {
      console.error("Error broadcasting to WebSocket:", error);
    }
  });
};

// Helper function to ensure URL is always a string
const ensureString = (value: string | undefined): string => {
  return value || "/groups/0";
};

// Health check
app.get("/api/health", (c) => {
  return c.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json({ message: "Route not found" }, 404);
});

// Start Hono server
serve({
  fetch: app.fetch,
  port: PORT,
});

// WebSocket server on separate port for simplicity
const WS_PORT = 6001; // Fixed WebSocket port
const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws, req) => {
  const requestUrl = ensureString(req.url);
  const url = new URL(requestUrl as string, `http://localhost:${WS_PORT}`);
  const pathParts = url.pathname.split("/");
  const groupId = parseInt(pathParts[pathParts.length - 1]);

  if (isNaN(groupId)) {
    ws.close(1008, "Invalid group ID");
    return;
  }



  // Add connection to group
  if (!groupConnections.has(groupId)) {
    groupConnections.set(groupId, []);
  }
  groupConnections.get(groupId)!.push(ws);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "CONNECTED",
      groupId,
      message: "Connected to group real-time updates",
    })
  );

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      // Handle incoming messages if needed
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  });

  ws.on("close", () => {
    // Remove connection from group
    const connections = groupConnections.get(groupId) || [];
    const index = connections.indexOf(ws);
    if (index > -1) {
      connections.splice(index, 1);
    }

    // Clean up empty arrays
    if (connections.length === 0) {
      groupConnections.delete(groupId);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
