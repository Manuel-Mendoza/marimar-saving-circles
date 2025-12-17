import { MiddlewareHandler } from 'hono';

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const clientIP = c.req.header('x-forwarded-for') ||
                   c.req.header('x-real-ip') ||
                   'unknown';

  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // requests per window

  const clientData = requests.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset or initialize
    requests.set(clientIP, {
      count: 1,
      resetTime: now + windowMs
    });
  } else {
    // Increment counter
    if (clientData.count >= maxRequests) {
      return c.json({
        success: false,
        message: 'Too many requests, please try again later'
      }, 429);
    }
    clientData.count++;
  }

  await next();
};
