import { Hono } from 'hono';

const products = new Hono();

// Placeholder routes - to be implemented later
products.get('/', (c) => c.json({ message: 'Get products - TODO' }));
products.post('/', (c) => c.json({ message: 'Create product - TODO' }));
products.get('/:id', (c) => c.json({ message: 'Get product by ID - TODO' }));
products.put('/:id', (c) => c.json({ message: 'Update product - TODO' }));
products.delete('/:id', (c) => c.json({ message: 'Delete product - TODO' }));

export default products;
