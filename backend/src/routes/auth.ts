import { Hono } from 'hono';

const auth = new Hono();

// Placeholder routes - to be implemented later
auth.post('/login', (c) => c.json({ message: 'Login endpoint - TODO' }));
auth.post('/register', (c) => c.json({ message: 'Register endpoint - TODO' }));
auth.post('/logout', (c) => c.json({ message: 'Logout endpoint - TODO' }));
auth.get('/me', (c) => c.json({ message: 'Get current user - TODO' }));

export default auth;
