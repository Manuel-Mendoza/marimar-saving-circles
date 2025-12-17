import { Hono } from 'hono';

const groups = new Hono();

// Placeholder routes - to be implemented later
groups.get('/', (c) => c.json({ message: 'Get groups - TODO' }));
groups.post('/', (c) => c.json({ message: 'Create group - TODO' }));
groups.get('/:id', (c) => c.json({ message: 'Get group by ID - TODO' }));
groups.put('/:id', (c) => c.json({ message: 'Update group - TODO' }));
groups.delete('/:id', (c) => c.json({ message: 'Delete group - TODO' }));

export default groups;
