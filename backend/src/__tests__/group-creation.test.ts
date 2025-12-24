import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Hono } from 'hono';
import usersRoute from '../routes/users.js';
import { db } from '../config/database.js';
import { users as usersTable } from '../db/tables/users.js';
import { products } from '../db/tables/products.js';
import { groups } from '../db/tables/groups.js';
import { userGroups } from '../db/tables/user-groups.js';
import { eq, and } from 'drizzle-orm';

describe('Group Creation Logic', () => {
  let app: Hono;

  beforeEach(async () => {
    app = new Hono();
    app.route('/api/users', usersRoute);

    // Clean up test data
    await db.delete(userGroups);
    await db.delete(groups);
    await db.delete(products);
    await db.delete(usersTable);
  });

  afterEach(async () => {
    // Clean up after each test
    await db.delete(userGroups);
    await db.delete(groups);
    await db.delete(products);
    await db.delete(usersTable);
  });

  describe('POST /api/users/join - Product Selection and Group Assignment', () => {
    it('should create a new group when no group exists for the product duration', async () => {
      // Create a test user
      const [testUser] = await db
        .insert(usersTable)
        .values({
          nombre: 'Test',
          apellido: 'User',
          cedula: '12345678',
          telefono: '04123456789',
          direccion: 'Test Address',
          correoElectronico: 'test@example.com',
          password: 'hashedpassword',
          tipo: 'USUARIO',
          estado: 'APROBADO'
        })
        .returning();

      // Create a test product
      const [testProduct] = await db
        .insert(products)
        .values({
          nombre: 'Test Product',
          precioUsd: 100,
          precioVes: 1000000,
          tiempoDuracion: 8,
          descripcion: 'Test product description',
          activo: true
        })
        .returning();

      // Mock authentication middleware
      app.use('/api/users/join', async (c, next) => {
        c.set('user', { id: testUser.id, tipo: 'USUARIO' });
        await next();
      });

      const response = await app.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: testProduct.id,
          currency: 'USD'
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.groupId).toBeDefined();
      expect(result.data.position).toBe(null);
      expect(result.data.currency).toBe('USD');
      expect(result.data.monthlyPayment).toBe(100);

      // Verify group was created
      const createdGroups = await db
        .select()
        .from(groups)
        .where(eq(groups.duracionMeses, 8));

      expect(createdGroups.length).toBe(1);
      expect(createdGroups[0].nombre).toBe('Grupo 8 meses');
      expect(createdGroups[0].estado).toBe('SIN_COMPLETAR');
    });

    it('should assign users to the same group when choosing products with same duration', async () => {
      // Create test users
      const [user1] = await db
        .insert(usersTable)
        .values({
          nombre: 'User',
          apellido: 'One',
          cedula: '11111111',
          telefono: '04111111111',
          direccion: 'Address 1',
          correoElectronico: 'user1@example.com',
          password: 'hashedpassword',
          tipo: 'USUARIO',
          estado: 'APROBADO'
        })
        .returning();

      const [user2] = await db
        .insert(usersTable)
        .values({
          nombre: 'User',
          apellido: 'Two',
          cedula: '22222222',
          telefono: '04222222222',
          direccion: 'Address 2',
          correoElectronico: 'user2@example.com',
          password: 'hashedpassword',
          tipo: 'USUARIO',
          estado: 'APROBADO'
        })
        .returning();

      // Create test products with same duration
      const [product1] = await db
        .insert(products)
        .values({
          nombre: 'Product 8 months A',
          precioUsd: 100,
          precioVes: 1000000,
          tiempoDuracion: 8,
          descripcion: 'Product A',
          activo: true
        })
        .returning();

      const [product2] = await db
        .insert(products)
        .values({
          nombre: 'Product 8 months B',
          precioUsd: 150,
          precioVes: 1500000,
          tiempoDuracion: 8,
          descripcion: 'Product B',
          activo: true
        })
        .returning();

      // Mock authentication for user1
      app.use('/api/users/join', async (c, next) => {
        c.set('user', { id: user1.id, tipo: 'USUARIO' });
        await next();
      });

      // User 1 joins with first product
      const response1 = await app.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product1.id,
          currency: 'USD'
        })
      });

      const result1 = await response1.json();
      expect(response1.status).toBe(200);
      const groupId1 = result1.data.groupId;

      // Mock authentication for user2
      app.use('/api/users/join', async (c, next) => {
        c.set('user', { id: user2.id, tipo: 'USUARIO' });
        await next();
      });

      // User 2 joins with second product (same duration)
      const response2 = await app.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product2.id,
          currency: 'USD'
        })
      });

      const result2 = await response2.json();
      expect(response2.status).toBe(200);
      const groupId2 = result2.data.groupId;

      // Both users should be in the same group
      expect(groupId1).toBe(groupId2);

      // Verify only one group was created for 8 months
      const groups8Months = await db
        .select()
        .from(groups)
        .where(eq(groups.duracionMeses, 8));

      expect(groups8Months.length).toBe(1);

      // Verify both users are in the group with null positions (to be assigned by lottery)
      const groupMembers = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.groupId, groupId1));

      expect(groupMembers.length).toBe(2);
      expect(groupMembers[0].posicion).toBe(null);
      expect(groupMembers[1].posicion).toBe(null);
    });

    it('should create separate groups for products with different durations', async () => {
      // Create test user
      const [testUser] = await db
        .insert(usersTable)
        .values({
          nombre: 'Test',
          apellido: 'User',
          cedula: '12345678',
          telefono: '04123456789',
          direccion: 'Test Address',
          correoElectronico: 'test@example.com',
          password: 'hashedpassword',
          tipo: 'USUARIO',
          estado: 'APROBADO'
        })
        .returning();

      // Create products with different durations
      const [product8Months] = await db
        .insert(products)
        .values({
          nombre: 'Product 8 months',
          precioUsd: 100,
          precioVes: 1000000,
          tiempoDuracion: 8,
          descripcion: '8 month product',
          activo: true
        })
        .returning();

      const [product10Months] = await db
        .insert(products)
        .values({
          nombre: 'Product 10 months',
          precioUsd: 150,
          precioVes: 1500000,
          tiempoDuracion: 10,
          descripcion: '10 month product',
          activo: true
        })
        .returning();

      // Mock authentication
      app.use('/api/users/join', async (c, next) => {
        c.set('user', { id: testUser.id, tipo: 'USUARIO' });
        await next();
      });

      // First, clear user groups for this user (simulate user can join multiple groups)
      await db.delete(userGroups).where(eq(userGroups.userId, testUser.id));

      // Join 8-month product
      const response1 = await app.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product8Months.id,
          currency: 'USD'
        })
      });

      const result1 = await response1.json();
      expect(response1.status).toBe(200);
      const groupId8 = result1.data.groupId;

      // Join 10-month product (same user, different group)
      const response2 = await app.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product10Months.id,
          currency: 'USD'
        })
      });

      const result2 = await response2.json();
      expect(response2.status).toBe(200);
      const groupId10 = result2.data.groupId;

      // Should be different groups
      expect(groupId8).not.toBe(groupId10);

      // Verify groups were created for each duration
      const groups8Months = await db
        .select()
        .from(groups)
        .where(eq(groups.duracionMeses, 8));

      const groups10Months = await db
        .select()
        .from(groups)
        .where(eq(groups.duracionMeses, 10));

      expect(groups8Months.length).toBe(1);
      expect(groups10Months.length).toBe(1);
      expect(groups8Months[0].id).toBe(groupId8);
      expect(groups10Months[0].id).toBe(groupId10);
    });

    it('should handle multiple users choosing different products simultaneously', async () => {
      // Create multiple users
      const usersData = [];
      for (let i = 1; i <= 5; i++) {
        const [user] = await db
          .insert(usersTable)
          .values({
            nombre: `User${i}`,
            apellido: `Test${i}`,
            cedula: `1000000${i}`,
            telefono: `041200000${i}`,
            direccion: `Address ${i}`,
            correoElectronico: `user${i}@example.com`,
            password: 'hashedpassword',
            tipo: 'USUARIO',
            estado: 'APROBADO'
          })
          .returning();
        usersData.push(user);
      }

      // Create products with different durations
      const productsData: any[] = [];
      const durations = [6, 8, 10, 12];
      for (let i = 0; i < durations.length; i++) {
        const [product] = await db
          .insert(products)
          .values({
            nombre: `Product ${durations[i]} months`,
            precioUsd: 100 + (i * 50),
            precioVes: (100 + (i * 50)) * 10000,
            tiempoDuracion: durations[i],
            descripcion: `${durations[i]} month product`,
            activo: true
          })
          .returning();
        productsData.push(product);
      }

      // Simulate multiple users joining different groups
      const joinPromises = usersData.map(async (user, index) => {
        const product = productsData[index % productsData.length];

        // Mock authentication for each user
        const testApp = new Hono();
        testApp.route('/api/users', usersRoute);
        testApp.use('/api/users/join', async (c, next) => {
          c.set('user', { id: user.id, tipo: 'USUARIO' });
          await next();
        });

        const response = await testApp.request('/api/users/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            currency: 'USD'
          })
        });

        const result = await response.json();
        return { userId: user.id, productDuration: product.tiempoDuracion, result };
      });

      const results = await Promise.all(joinPromises);

      // Verify all joins were successful
      results.forEach(({ result }) => {
        expect(result.success).toBe(true);
        expect(result.data.groupId).toBeDefined();
        expect(result.data.position).toBe(null); // Positions are null until lottery
      });

      // Verify groups were created correctly
      const allGroups = await db.select().from(groups);
      expect(allGroups.length).toBe(4); // One group per unique duration

      // Verify group distribution
      const durationGroups = new Map<number, number>();
      allGroups.forEach(group => {
        durationGroups.set(group.duracionMeses, (durationGroups.get(group.duracionMeses) || 0) + 1);
      });

      expect(durationGroups.get(6)).toBe(1);
      expect(durationGroups.get(8)).toBe(1);
      expect(durationGroups.get(10)).toBe(1);
      expect(durationGroups.get(12)).toBe(1);

      // Verify user assignments
      const allUserGroups = await db.select().from(userGroups);
      expect(allUserGroups.length).toBe(5); // 5 users joined

      // All positions should be null (to be assigned by admin lottery)
      allUserGroups.forEach(ug => {
        expect(ug.posicion).toBe(null);
      });
    });

    it('should create a new group when the current group reaches maximum capacity', async () => {
      // Create users
      const users: any[] = [];
      for (let i = 1; i <= 5; i++) {
        const [user] = await db
          .insert(usersTable)
          .values({
            nombre: `User${i}`,
            apellido: 'Test',
            cedula: `100000${i}`,
            telefono: `041200000${i}`,
            direccion: `Address ${i}`,
            correoElectronico: `user${i}@test.com`,
            password: 'hashedpassword',
            tipo: 'USUARIO',
            estado: 'APROBADO'
          })
          .returning();
        users.push(user);
      }

      // Create a 3-month product (should have max 3 members)
      const [product] = await db
        .insert(products)
        .values({
          nombre: 'Product 3 months',
          precioUsd: 50,
          precioVes: 500000,
          tiempoDuracion: 3,
          descripcion: '3 month product',
          activo: true
        })
        .returning();

      // First 3 users should join the same group
      const groupIds: number[] = [];

      for (let i = 0; i < 3; i++) {
        const testApp = new Hono();
        testApp.route('/api/users', usersRoute);
        testApp.use('/api/users/join', async (c, next) => {
          c.set('user', { id: users[i].id, tipo: 'USUARIO' });
          await next();
        });

        const response = await testApp.request('/api/users/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            currency: 'USD'
          })
        });

        const result = await response.json();
        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        groupIds.push(result.data.groupId);
      }

      // First 3 users should be in the same group
      expect(groupIds[0]).toBe(groupIds[1]);
      expect(groupIds[1]).toBe(groupIds[2]);

      // Check that the group has exactly 3 members
      const firstGroupMembers = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.groupId, groupIds[0]));

      expect(firstGroupMembers.length).toBe(3);

      // 4th user should get a new group
      const testApp4 = new Hono();
      testApp4.route('/api/users', usersRoute);
      testApp4.use('/api/users/join', async (c, next) => {
        c.set('user', { id: users[3].id, tipo: 'USUARIO' });
        await next();
      });

      const response4 = await testApp4.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          currency: 'USD'
        })
      });

      const result4 = await response4.json();
      expect(response4.status).toBe(200);
      expect(result4.success).toBe(true);
      expect(result4.data.groupId).not.toBe(groupIds[0]); // Different group

      // 5th user should join the second group
      const testApp5 = new Hono();
      testApp5.route('/api/users', usersRoute);
      testApp5.use('/api/users/join', async (c, next) => {
        c.set('user', { id: users[4].id, tipo: 'USUARIO' });
        await next();
      });

      const response5 = await testApp5.request('/api/users/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          currency: 'USD'
        })
      });

      const result5 = await response5.json();
      expect(response5.status).toBe(200);
      expect(result5.success).toBe(true);
      expect(result5.data.groupId).toBe(result4.data.groupId); // Same as 4th user

      // Verify we have 2 groups for 3-month products
      const all3MonthGroups = await db
        .select()
        .from(groups)
        .where(eq(groups.duracionMeses, 3));

      expect(all3MonthGroups.length).toBe(2);

      // Check member distribution
      const secondGroupMembers = await db
        .select()
        .from(userGroups)
        .where(eq(userGroups.groupId, result4.data.groupId));

      expect(secondGroupMembers.length).toBe(2); // 4th and 5th users
    });
  });
});
