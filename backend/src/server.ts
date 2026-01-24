import { Hono } from "hono";
import { cors } from "hono/cors";
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
import sseRoutes from "./routes/sse.js";

// Broadcast function for group updates (basic implementation)
function broadcastToGroup(groupId: number, message: any) {
  // For now, this is a basic implementation that logs the message
  // In a production environment, this would use WebSockets or SSE to broadcast to group members
  console.log(
    `Broadcasting to group ${groupId}:`,
    JSON.stringify(message, null, 2),
  );

  // TODO: Implement actual real-time broadcasting using WebSockets or SSE
  // This could integrate with the existing SSE routes for group updates
}

const app = new Hono();
const PORT = parseInt(process.env.PORT || "5000");

// Connect to database
connectDB();

// CORS middleware - more permissive for development and production
app.use(
  "*",
  cors({
    origin: (origin, c) => {
      // Allow localhost on any port or domain for development
      if (
        origin?.startsWith("http://localhost") ||
        origin?.startsWith("http://127.0.0.1") ||
        origin?.startsWith("http://0.0.0.0")
      ) {
        return origin;
      }

      // Allow specific local network IP addresses for development
      if (
        origin === "http://192.168.0.188:8080" ||
        origin?.startsWith("http://192.168.")
      ) {
        return origin;
      }

      // Allow other local network ranges
      if (
        origin?.startsWith("http://10.") ||
        origin?.startsWith("http://172.")
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
app.route("/api", sseRoutes);

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

// For development, we still want to run the server locally
// but for production Vercel deployment, this won't be used
if (process.env.NODE_ENV !== "production") {
  const { serve } = await import("@hono/node-server");

  serve({
    fetch: app.fetch,
    port: PORT,
  });
}

// Export the broadcast function for use in other modules
export { broadcastToGroup };
