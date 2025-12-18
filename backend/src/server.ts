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
app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
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
