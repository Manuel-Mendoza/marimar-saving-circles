import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import groupRoutes from "./routes/groups.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import productSelectionsRoutes from "./routes/product-selections.js";
import paymentRequestsRoutes from "./routes/payment-requests.js";
import paymentOptionsRoutes from "./routes/payment-options.js";
import adminRoutes from "./routes/admin.js";
import ratingsRoutes from "./routes/ratings.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = new Hono();
const PORT = parseInt(process.env.PORT || "5000");

// Connect to database
connectDB();

// CORS middleware - more permissive for development and production
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // Allow localhost on any port for development
      if (
        origin?.startsWith("http://localhost:") ||
        origin?.startsWith("http://127.0.0.1:")
      ) {
        return origin;
      }

      // Allow specific production domains
      const allowedOrigins = [
        "https://marimar-saving-circles.vercel.app",
        "https://marimar-saving-circles-client.vercel.app",
      ];

      if (allowedOrigins.includes(origin)) {
        return origin;
      }

      // Allow requests without origin (like mobile apps or server-to-server)
      if (!origin) {
        return "*";
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
      "X-Forwarded-For",
      "X-Real-IP",
    ],
    exposeHeaders: ["Content-Length", "Content-Type"],
  }),
);

// Additional CORS headers for preflight requests
app.options("*", (c) => {
  return c.text("", 200);
});

app.use("*", rateLimiter);

// Routes
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/groups", groupRoutes);
app.route("/api/users", userRoutes);
app.route("/api/products", productRoutes);
app.route("/api/product-selections", productSelectionsRoutes);
app.route("/api/payment-requests", paymentRequestsRoutes);
app.route("/api/payment-options", paymentOptionsRoutes);
app.route("/api/ratings", ratingsRoutes);

// WebSocket message type
interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

// WebSocket connections storage
const groupConnections = new Map<number, WebSocket[]>();

// Function to broadcast messages to all connections in a group
export const broadcastToGroup = (
  groupId: number,
  message: WebSocketMessage,
) => {
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
  let groupId: number | null = null;
  let isClosed = false;

  try {
    const requestUrl = req.url;
    if (!requestUrl) {
      ws.close(1008, "Invalid request URL");
      return;
    }

    const url = new URL(requestUrl, `http://localhost:${WS_PORT}`);
    const pathParts = url.pathname.split("/");
    const groupIdStr = pathParts[pathParts.length - 1];

    if (!groupIdStr) {
      ws.close(1008, "Invalid group path");
      return;
    }

    const parsedGroupId = parseInt(groupIdStr);
    if (isNaN(parsedGroupId) || parsedGroupId <= 0) {
      ws.close(1008, "Invalid group ID");
      return;
    }

    groupId = parsedGroupId;

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
        timestamp: new Date().toISOString(),
      }),
    );

    console.log(
      `WebSocket connected to group ${groupId}. Total connections: ${groupConnections.get(groupId)!.length}`,
    );

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle incoming messages if needed
        // For now, we just log them
        console.log(`Message from group ${groupId}:`, message);

        // Optional: Echo back to sender for testing
        if (message.type === "PING") {
          ws.send(
            JSON.stringify({
              type: "PONG",
              timestamp: new Date().toISOString(),
            }),
          );
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        ws.send(
          JSON.stringify({
            type: "ERROR",
            message: "Invalid message format",
          }),
        );
      }
    });

    ws.on("close", () => {
      if (isClosed || groupId === null) return;
      isClosed = true;

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

      console.log(
        `WebSocket disconnected from group ${groupId}. Remaining connections: ${connections.length}`,
      );
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for group ${groupId}:`, error);
      // Don't close the connection here, let the close event handle cleanup
    });

    // Handle connection timeout
    const timeout = setTimeout(() => {
      if (!isClosed) {
        console.warn(`WebSocket connection to group ${groupId} timed out`);
        ws.terminate();
      }
    }, 300000); // 5 minutes timeout

    ws.on("close", () => {
      clearTimeout(timeout);
    });

    ws.on("pong", () => {
      clearTimeout(timeout);
      // Set new timeout for next ping
      setTimeout(() => {
        if (!isClosed) {
          ws.ping();
        }
      }, 30000); // Ping every 30 seconds
    });

    // Initial ping
    ws.ping();
  } catch (error) {
    console.error("Error in WebSocket connection:", error);
    if (!isClosed) {
      ws.close(1011, "Internal server error");
    }
  }
});

// Handle WebSocket server errors
wss.on("error", (error) => {
  console.error("WebSocket server error:", error);
});

// Handle WebSocket server close
wss.on("close", () => {
  console.log("WebSocket server closed");
});

// Graceful shutdown for WebSocket server
process.on("SIGTERM", () => {
  console.log("SIGTERM received, closing WebSocket server...");
  wss.close();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, closing WebSocket server...");
  wss.close();
});
