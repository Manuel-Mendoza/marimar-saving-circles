import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = new Hono();
const PORT = parseInt(process.env.PORT || '5000');

// Connect to database
connectDB();

// Middleware
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
console.log(`🔗 CORS configured for: ${frontendUrl}`);

// CORS middleware - more permissive for development
app.use('*', cors({
  origin: (origin, c) => {
    // Allow localhost on any port for development
    if (origin?.startsWith('http://localhost:') || origin === frontendUrl || !origin) {
      return origin;
    }
    return null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Additional CORS headers for preflight requests
app.options('*', (c) => {
  return c.text('', 200);
});
app.use('*', logger());
app.use('*', rateLimiter);

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/groups', groupRoutes);
app.route('/api/users', userRoutes);
app.route('/api/products', productRoutes);

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json({ message: 'Route not found' }, 404);
});

console.log(`🚀 Server starting on port ${PORT}`);
console.log(`📊 Health check: http://localhost:${PORT}/api/health`);

serve({
  fetch: app.fetch,
  port: PORT,
});
