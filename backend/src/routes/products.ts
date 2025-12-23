import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { products } from '../db/tables/products.js';
import { db } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const productsRoute = new Hono();

// Get all active products - Public for users to choose
productsRoute.get('/', async (c) => {
  try {
    const allProducts = await db
      .select({
        id: products.id,
        nombre: products.nombre,
        precioUsd: products.precioUsd,
        precioVes: products.precioVes,
        tiempoDuracion: products.tiempoDuracion,
        imagen: products.imagen,
        descripcion: products.descripcion,
        tags: products.tags,
        activo: products.activo
      })
      .from(products)
      .where(eq(products.activo, true))
      .orderBy(products.nombre);

    return c.json({
      success: true,
      data: {
        products: allProducts
      }
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Get product by ID - Public
productsRoute.get('/:id', async (c) => {
  try {
    const productId = parseInt(c.req.param('id'));

    const [product] = await db
      .select({
        id: products.id,
        nombre: products.nombre,
        precioUsd: products.precioUsd,
        precioVes: products.precioVes,
        tiempoDuracion: products.tiempoDuracion,
        imagen: products.imagen,
        descripcion: products.descripcion,
        tags: products.tags,
        activo: products.activo
      })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return c.json({
        success: false,
        message: 'Producto no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Error obteniendo producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Create product - Admin only
productsRoute.post('/', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { nombre, precioUsd, precioVes, tiempoDuracion, imagen, descripcion, tags } = body;

    if (!nombre || !precioUsd || !precioVes || !tiempoDuracion || !descripcion) {
      return c.json({
        success: false,
        message: 'Nombre, precios, duración y descripción son requeridos'
      }, 400);
    }

    const newProduct = await db
      .insert(products)
      .values({
        nombre,
        precioUsd: parseFloat(precioUsd),
        precioVes: parseFloat(precioVes),
        tiempoDuracion: parseInt(tiempoDuracion),
        imagen,
        descripcion,
        tags: tags || [],
        activo: true
      })
      .returning();

    return c.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: {
        product: newProduct[0]
      }
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Update product - Admin only
productsRoute.put('/:id', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const productId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const body = await c.req.json();
    const { nombre, precioUsd, precioVes, tiempoDuracion, imagen, descripcion, tags, activo } = body;

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (precioUsd !== undefined) updateData.precioUsd = parseFloat(precioUsd);
    if (precioVes !== undefined) updateData.precioVes = parseFloat(precioVes);
    if (tiempoDuracion !== undefined) updateData.tiempoDuracion = parseInt(tiempoDuracion);
    if (imagen !== undefined) updateData.imagen = imagen;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (tags !== undefined) updateData.tags = tags;
    if (activo !== undefined) updateData.activo = activo;

    const updatedProducts = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, productId))
      .returning();

    if (updatedProducts.length === 0) {
      return c.json({
        success: false,
        message: 'Producto no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: {
        product: updatedProducts[0]
      }
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

// Delete product (soft delete by setting activo to false) - Admin only
productsRoute.delete('/:id', authenticate, async (c) => {
  try {
    const userPayload = c.get('user') as any;
    const productId = parseInt(c.req.param('id'));

    if (userPayload.tipo !== 'ADMINISTRADOR') {
      return c.json({
        success: false,
        message: 'Acceso denegado'
      }, 403);
    }

    const updatedProducts = await db
      .update(products)
      .set({ activo: false })
      .where(eq(products.id, productId))
      .returning();

    if (updatedProducts.length === 0) {
      return c.json({
        success: false,
        message: 'Producto no encontrado'
      }, 404);
    }

    return c.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    return c.json({
      success: false,
      message: 'Error interno del servidor'
    }, 500);
  }
});

export default productsRoute;
