import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/atoms';
import { ProductStatsGrid, ProductsTable, ProductActionDialogs } from '@/components/organisms';
import { useProducts } from '@/hooks/useProducts';
import { Plus } from 'lucide-react';

// Local type definition for Producto
interface Producto {
  id: number;
  nombre: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
  tags: string[];
  activo: boolean;
}

interface ProductsManagementProps {
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
}

/**
 * Página para gestión completa de productos (CRUD)
 * Incluye búsqueda, filtros, estadísticas, tabla y diálogos de acciones
 */
export const ProductsManagement: React.FC<ProductsManagementProps> = ({ user }) => {
  const {
    allProducts,
    productsLoading,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProducts();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  // Dialog states
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionType, setActionType] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);

  // Filter products based on search term and status filters
  const filterProducts = (products: Producto[]) => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        product =>
          product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilters.size > 0) {
      filtered = filtered.filter(product => {
        const status = product.activo ? 'ACTIVO' : 'INACTIVO';
        return statusFilters.has(status);
      });
    }

    return filtered;
  };

  // Handle status filter toggle
  const handleStatusFilterToggle = (status: string, checked: boolean) => {
    const newFilters = new Set(statusFilters);
    if (checked) {
      newFilters.add(status);
    } else {
      newFilters.delete(status);
    }
    setStatusFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilters(new Set());
    setSearchTerm('');
  };

  // Handle product actions
  const handleProductAction = async (product: Producto, action: string) => {
    setSelectedProduct(product);

    if (action === 'edit') {
      setActionType('edit');
      setShowFormDialog(true);
    } else if (action === 'delete') {
      setActionType('delete');
      setShowDeleteDialog(true);
    }
  };

  // Handle create new product
  const handleCreateNew = () => {
    setSelectedProduct(null);
    setActionType('create');
    setShowFormDialog(true);
  };

  // Dialog action handlers
  const handleCreateProductDialog = async (productData: Partial<Producto>) => {
    setDialogLoading(true);
    try {
      await handleCreateProduct(productData);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleUpdateProductDialog = async (productId: number, productData: Partial<Producto>) => {
    setDialogLoading(true);
    try {
      await handleUpdateProduct(productId, productData);
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDeleteProductDialog = async (productId: number) => {
    setDialogLoading(true);
    try {
      await handleDeleteProduct(productId);
    } finally {
      setDialogLoading(false);
    }
  };

  if (productsLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando productos..." />
        </div>
      </div>
    );
  }

  const filteredProducts = filterProducts(allProducts);

  // Calculate statistics
  const stats = {
    totalProducts: allProducts.length,
    activeProducts: allProducts.filter(p => p.activo).length,
    inactiveProducts: allProducts.filter(p => !p.activo).length,
    averagePrice:
      allProducts.length > 0
        ? allProducts.reduce((sum, p) => sum + p.precioUsd, 0) / allProducts.length
        : 0,
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra el catálogo de productos disponibles para ahorro colaborativo
            </p>
          </div>
          <Button onClick={handleCreateNew} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <ProductStatsGrid {...stats} />

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        title={`Productos (${filteredProducts.length})`}
        actionLoadingId={dialogLoading ? selectedProduct?.id : undefined}
        onProductAction={handleProductAction}
      />

      {/* Action Dialogs */}
      <ProductActionDialogs
        showFormDialog={showFormDialog}
        showDeleteDialog={showDeleteDialog}
        actionType={actionType}
        selectedProduct={selectedProduct}
        isLoading={dialogLoading}
        onFormDialogChange={setShowFormDialog}
        onDeleteDialogChange={setShowDeleteDialog}
        onCreateProduct={handleCreateProductDialog}
        onUpdateProduct={handleUpdateProductDialog}
        onDeleteProduct={handleDeleteProductDialog}
      />
    </div>
  );
};
