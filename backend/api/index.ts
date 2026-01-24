import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "@hono/node-server/vercel";
import { connectDB } from "../src/config/database.js";
import authRoutes from "../src/routes/auth.js";
import groupRoutes from "../src/routes/groups.js";
import userRoutes from "../src/routes/users.js";
import productRoutes from "../src/routes/products.js";
import productSelectionsRoutes from "../src/routes/product-selections.js";
import paymentRequestsRoutes from "../src/routes/payment-requests.js";
import paymentOptionsRoutes from "../src/routes/payment-options.js";
import adminRoutes from "../src/routes/admin.js";
import ratingsRoutes from "../src/routes/ratings.js";
import { errorHandler } from "../src/middleware/errorHandler.js";
import { rateLimiter } from "../src/middleware/rateLimiter.js";

const app = new Hono();

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

// Vercel configuration
export const config = {
  api: {
    bodyParser: false,
  },
};

export default handle(app);
