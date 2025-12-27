import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProducts } from '@/hooks/useProducts';
import ProductFilters from './ProductFilters';
import { getTagColor, getAvailableTags } from '@/lib/tagUtils';

interface Producto {
  id: number;
  nombre: string;
  precioUsd: number;
  precioVes: number;
  tiempoDuracion: number;
  imagen?: string;
  descripcion: string;
  tags?: string[];
  activo: boolean;
}

const ProductsView: React.FC = () => {
  const {
    allProducts,
    productsLoading,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  } = useProducts();
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [productToDelete, setProductToDelete] = useState<Producto | null>(null);

  // Form state
  const [productForm, setProductForm] = useState({
    nombre: '',
    precioUsd: '',
    precioVes: '',
    tiempoDuracion: '',
    descripcion: '',
    imagen: '',
    tags: [] as string[],
    activo: true,
  });

  const availableTags = getAvailableTags();

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
      (product.tags &&
        product.tags.some(tag => tag.toLowerCase().includes(productSearchTerm.toLowerCase())));

    const matchesTags =
      selectedTags.length === 0 ||
      (product.tags && selectedTags.some(selectedTag => product.tags?.includes(selectedTag)));

    return matchesSearch && matchesTags;
  });

  const handleFilterTagToggle = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const handleClearFilters = () => {
    setProductSearchTerm('');
    setSelectedTags([]);
  };

  const resetProductForm = () => {
    setProductForm({
      nombre: '',
      precioUsd: '',
      precioVes: '',
      tiempoDuracion: '',
      descripcion: '',
      imagen: '',
      tags: [],
      activo: true,
    });
  };

  const openCreateDialog = () => {
    resetProductForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (product: Producto) => {
    setProductForm({
      nombre: product.nombre,
      precioUsd: product.precioUsd.toString(),
      precioVes: product.precioVes.toString(),
      tiempoDuracion: product.tiempoDuracion.toString(),
      descripcion: product.descripcion,
      imagen: product.imagen || '',
      tags: product.tags || [],
      activo: product.activo,
    });
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    resetProductForm();
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingProduct(null);
    resetProductForm();
  };

  const openDeleteDialog = (product: Producto) => {
    setProductToDelete(product);
  };

  const closeDeleteDialog = () => {
    setProductToDelete(null);
  };

  const onSubmitCreate = async () => {
    if (
      !productForm.nombre ||
      !productForm.precioUsd ||
      !productForm.precioVes ||
      !productForm.tiempoDuracion ||
      !productForm.descripcion
    ) {
      return;
    }

    const success = await handleCreateProduct({
      nombre: productForm.nombre,
      precioUsd: parseFloat(productForm.precioUsd),
      precioVes: parseFloat(productForm.precioVes),
      tiempoDuracion: parseInt(productForm.tiempoDuracion),
      descripcion: productForm.descripcion,
      imagen: productForm.imagen || undefined,
      tags: productForm.tags,
      activo: productForm.activo,
    });

    if (success) {
      closeCreateDialog();
    }
  };

  const onSubmitUpdate = async () => {
    if (!editingProduct) return;

    if (
      !productForm.nombre ||
      !productForm.precioUsd ||
      !productForm.precioVes ||
      !productForm.tiempoDuracion ||
      !productForm.descripcion
    ) {
      return;
    }

    const success = await handleUpdateProduct(editingProduct.id, {
      nombre: productForm.nombre,
      precioUsd: parseFloat(productForm.precioUsd),
      precioVes: parseFloat(productForm.precioVes),
      tiempoDuracion: parseInt(productForm.tiempoDuracion),
      descripcion: productForm.descripcion,
      imagen: productForm.imagen || undefined,
      tags: productForm.tags,
      activo: productForm.activo,
    });

    if (success) {
      closeEditDialog();
    }
  };

  const onSubmitDelete = async () => {
    if (!productToDelete) return;

    const success = await handleDeleteProduct(productToDelete.id);
    if (success) {
      closeDeleteDialog();
    }
  };

  const handleTagToggle = (tag: string) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Productos</h1>
            <p className="text-gray-600 mt-1">
              Administra el catálogo de productos para círculos de ahorro
            </p>
          </div>
          <Button onClick={openCreateDialog} className="bg-green-600 hover:bg-green-700">
            Nuevo Producto
          </Button>
        </div>

        {/* Product Filters */}
        <Card>
          <CardContent className="p-6">
            <ProductFilters
              searchTerm={productSearchTerm}
              onSearchChange={setProductSearchTerm}
              selectedTags={selectedTags}
              onTagToggle={handleFilterTagToggle}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>

        {/* Products List */}
        {productsLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Cargando productos...</p>
            </CardContent>
          </Card>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                {productSearchTerm || selectedTags.length > 0
                  ? 'No se encontraron productos con los filtros aplicados'
                  : 'No hay productos registrados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{product.nombre}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>USD: ${product.precioUsd.toLocaleString()}</p>
                        <p>VES: {product.precioVes.toLocaleString()} Bs</p>
                        <p>Duración: {product.tiempoDuracion} meses</p>
                      </div>
                    </div>
                    <Badge variant={product.activo ? 'default' : 'secondary'}>
                      {product.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2">{product.descripcion}</p>

                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.tags.map(tag => (
                        <Badge key={tag} className={`text-xs border ${getTagColor(tag)}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="flex-1"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(product)}
                      className="flex-1"
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
            <DialogDescription>
              Agrega un nuevo producto al catálogo de círculos de ahorro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-nombre" className="text-right">
                Nombre *
              </label>
              <Input
                id="product-nombre"
                value={productForm.nombre}
                onChange={e => setProductForm(prev => ({ ...prev, nombre: e.target.value }))}
                className="col-span-3"
                placeholder="Ej: Lavadora Samsung 18kg"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-precio-usd" className="text-right">
                Precio USD *
              </label>
              <Input
                id="product-precio-usd"
                type="number"
                step="0.01"
                value={productForm.precioUsd}
                onChange={e => setProductForm(prev => ({ ...prev, precioUsd: e.target.value }))}
                className="col-span-3"
                placeholder="450.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-precio-ves" className="text-right">
                Precio VES *
              </label>
              <Input
                id="product-precio-ves"
                type="number"
                step="1000"
                value={productForm.precioVes}
                onChange={e => setProductForm(prev => ({ ...prev, precioVes: e.target.value }))}
                className="col-span-3"
                placeholder="18000000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-duracion" className="text-right">
                Duración (meses) *
              </label>
              <Input
                id="product-duracion"
                type="number"
                value={productForm.tiempoDuracion}
                onChange={e =>
                  setProductForm(prev => ({ ...prev, tiempoDuracion: e.target.value }))
                }
                className="col-span-3"
                placeholder="12"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-imagen" className="text-right">
                Imagen URL
              </label>
              <Input
                id="product-imagen"
                value={productForm.imagen}
                onChange={e => setProductForm(prev => ({ ...prev, imagen: e.target.value }))}
                className="col-span-3"
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">Tags</label>
              <div className="col-span-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={productForm.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className={productForm.tags.includes(tag) ? '' : getTagColor(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="product-descripcion" className="text-right">
                Descripción *
              </label>
              <textarea
                id="product-descripcion"
                value={productForm.descripcion}
                onChange={e => setProductForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className="col-span-3 min-h-[80px] p-3 border rounded-md resize-none"
                placeholder="Describe el producto..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Estado</label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="product-activo"
                  checked={productForm.activo}
                  onChange={e => setProductForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="product-activo">Producto activo</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeCreateDialog}>
              Cancelar
            </Button>
            <Button onClick={onSubmitCreate} className="bg-green-600 hover:bg-green-700">
              Crear Producto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>Modifica la información del producto seleccionado</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-nombre" className="text-right">
                Nombre *
              </label>
              <Input
                id="edit-product-nombre"
                value={productForm.nombre}
                onChange={e => setProductForm(prev => ({ ...prev, nombre: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-precio-usd" className="text-right">
                Precio USD *
              </label>
              <Input
                id="edit-product-precio-usd"
                type="number"
                step="0.01"
                value={productForm.precioUsd}
                onChange={e => setProductForm(prev => ({ ...prev, precioUsd: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-precio-ves" className="text-right">
                Precio VES *
              </label>
              <Input
                id="edit-product-precio-ves"
                type="number"
                step="1000"
                value={productForm.precioVes}
                onChange={e => setProductForm(prev => ({ ...prev, precioVes: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-duracion" className="text-right">
                Duración (meses) *
              </label>
              <Input
                id="edit-product-duracion"
                type="number"
                value={productForm.tiempoDuracion}
                onChange={e =>
                  setProductForm(prev => ({ ...prev, tiempoDuracion: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-imagen" className="text-right">
                Imagen URL
              </label>
              <Input
                id="edit-product-imagen"
                value={productForm.imagen}
                onChange={e => setProductForm(prev => ({ ...prev, imagen: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right pt-2">Tags</label>
              <div className="col-span-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={productForm.tags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                      className={productForm.tags.includes(tag) ? '' : getTagColor(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="edit-product-descripcion" className="text-right">
                Descripción *
              </label>
              <textarea
                id="edit-product-descripcion"
                value={productForm.descripcion}
                onChange={e => setProductForm(prev => ({ ...prev, descripcion: e.target.value }))}
                className="col-span-3 min-h-[80px] p-3 border rounded-md resize-none"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">Estado</label>
              <div className="col-span-3 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-product-activo"
                  checked={productForm.activo}
                  onChange={e => setProductForm(prev => ({ ...prev, activo: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="edit-product-activo">Producto activo</label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditDialog}>
              Cancelar
            </Button>
            <Button onClick={onSubmitUpdate} className="bg-blue-600 hover:bg-blue-700">
              Actualizar Producto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={!!productToDelete} onOpenChange={open => !open && closeDeleteDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {productToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">{productToDelete.nombre}</h4>
                  <p className="text-sm text-gray-600">
                    USD: ${productToDelete.precioUsd.toLocaleString()}
                  </p>
                </div>
                <Badge variant="destructive">Eliminar</Badge>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeDeleteDialog}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={onSubmitDelete}>
              Eliminar Producto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsView;
