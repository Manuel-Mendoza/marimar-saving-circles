import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { Producto } from '../../../shared/types';

export const useProducts = () => {
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<Producto[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const fetchAllProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await apiClient.getProducts();
      if (response.success && response.data) {
        setAllProducts(response.data.products);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('useProducts - Error cargando productos:', error);
      setAllProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleCreateProduct = async (productData: Partial<Producto>) => {
    if (
      !productData.nombre ||
      !productData.precioUsd ||
      !productData.precioVes ||
      !productData.tiempoDuracion ||
      !productData.descripcion
    ) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await apiClient.createProduct(productData);

      if (response.success) {
        fetchAllProducts();
        toast({
          title: 'Producto creado',
          description: 'El producto ha sido creado exitosamente.',
        });
        return true;
      } else {
        toast({
          title: 'Error al crear producto',
          description: response.message || 'No se pudo crear el producto.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('useProducts - Error creando producto:', error);
      toast({
        title: 'Error al crear producto',
        description: (error as Error).message || 'No se pudo crear el producto.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleUpdateProduct = async (productId: number, productData: Partial<Producto>) => {
    if (
      !productData.nombre ||
      !productData.precioUsd ||
      !productData.precioVes ||
      !productData.tiempoDuracion ||
      !productData.descripcion
    ) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const response = await apiClient.updateProduct(productId, productData);

      if (response.success) {
        fetchAllProducts();
        toast({
          title: 'Producto actualizado',
          description: 'El producto ha sido actualizado exitosamente.',
        });
        return true;
      } else {
        toast({
          title: 'Error al actualizar producto',
          description: response.message || 'No se pudo actualizar el producto.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('useProducts - Error actualizando producto:', error);
      toast({
        title: 'Error al actualizar producto',
        description: error.message || 'No se pudo actualizar el producto.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      const response = await apiClient.deleteProduct(productId);

      if (response.success) {
        fetchAllProducts();
        toast({
          title: 'Producto eliminado',
          description: 'El producto ha sido eliminado exitosamente.',
        });
        return true;
      } else {
        toast({
          title: 'Error al eliminar producto',
          description: response.message || 'No se pudo eliminar el producto.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('useProducts - Error eliminando producto:', error);
      toast({
        title: 'Error al eliminar producto',
        description: error.message || 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return {
    allProducts,
    productsLoading,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    refetch: fetchAllProducts,
  };
};
