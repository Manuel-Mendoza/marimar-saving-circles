import { Hono } from 'hono';

const users = new Hono();

// Placeholder routes - to be implemented later
users.get('/', (c) => c.json({ message: 'Get users - TODO' }));
users.get('/:id', (c) => c.json({ message: 'Get user by ID - TODO' }));
users.put('/:id', (c) => c.json({ message: 'Update user - TODO' }));

export default users;
