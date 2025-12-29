import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/atoms';

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

interface ProductActionDialogsProps {
  /** Diálogo de crear/editar abierto */
  showFormDialog: boolean;
  /** Diálogo de eliminar abierto */
  showDeleteDialog: boolean;
  /** Tipo de acción: 'create' | 'edit' | 'delete' */
  actionType: 'create' | 'edit' | 'delete';
  /** Producto seleccionado para editar/eliminar */
  selectedProduct: Producto | null;
  /** Loading state */
  isLoading: boolean;
  /** Función para cambiar estado del diálogo de formulario */
  onFormDialogChange: (open: boolean) => void;
  /** Función para cambiar estado del diálogo de eliminación */
  onDeleteDialogChange: (open: boolean) => void;
  /** Función para crear producto */
  onCreateProduct: (productData: Partial<Producto>) => Promise<void>;
  /** Función para actualizar producto */
  onUpdateProduct: (productId: number, productData: Partial<Producto>) => Promise<void>;
  /** Función para eliminar producto */
  onDeleteProduct: (productId: number) => Promise<void>;
}

/**
 * Componente Organism para manejar todos los diálogos de acciones de producto
 * Centraliza la lógica de diálogos para create/edit/delete de productos
 */
const ProductActionDialogs: React.FC<ProductActionDialogsProps> = ({
  showFormDialog,
  showDeleteDialog,
  actionType,
  selectedProduct,
  isLoading,
  onFormDialogChange,
  onDeleteDialogChange,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    precioUsd: '',
    precioVes: '',
    tiempoDuracion: '',
    imagen: '',
    descripcion: '',
    tags: '',
  });

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (showFormDialog && selectedProduct && actionType === 'edit') {
      setFormData({
        nombre: selectedProduct.nombre,
        precioUsd: selectedProduct.precioUsd.toString(),
        precioVes: selectedProduct.precioVes.toString(),
        tiempoDuracion: selectedProduct.tiempoDuracion.toString(),
        imagen: selectedProduct.imagen || '',
        descripcion: selectedProduct.descripcion,
        tags: selectedProduct.tags.join(', '),
      });
    } else if (showFormDialog && actionType === 'create') {
      setFormData({
        nombre: '',
        precioUsd: '',
        precioVes: '',
        tiempoDuracion: '',
        imagen: '',
        descripcion: '',
        tags: '',
      });
    }
  }, [showFormDialog, selectedProduct, actionType]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      nombre: formData.nombre,
      precioUsd: parseFloat(formData.precioUsd),
      precioVes: parseFloat(formData.precioVes),
      tiempoDuracion: parseInt(formData.tiempoDuracion),
      imagen: formData.imagen || undefined,
      descripcion: formData.descripcion,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag),
    };

    try {
      if (actionType === 'create') {
        await onCreateProduct(productData);
      } else if (actionType === 'edit' && selectedProduct) {
        await onUpdateProduct(selectedProduct.id, productData);
      }
      onFormDialogChange(false);
      setFormData({
        nombre: '',
        precioUsd: '',
        precioVes: '',
        tiempoDuracion: '',
        imagen: '',
        descripcion: '',
        tags: '',
      });
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        await onDeleteProduct(selectedProduct.id);
        onDeleteDialogChange(false);
      } catch (error) {
        // Error handling is done in parent component
      }
    }
  };

  return (
    <>
      {/* Create/Edit Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={onFormDialogChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'create' ? 'Crear Producto' : 'Editar Producto'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'create'
                ? 'Complete los datos del nuevo producto.'
                : 'Modifique los datos del producto seleccionado.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tiempoDuracion">Duración (meses) *</Label>
                <Input
                  id="tiempoDuracion"
                  type="number"
                  value={formData.tiempoDuracion}
                  onChange={e => setFormData({ ...formData, tiempoDuracion: e.target.value })}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precioUsd">Precio USD *</Label>
                <Input
                  id="precioUsd"
                  type="number"
                  step="0.01"
                  value={formData.precioUsd}
                  onChange={e => setFormData({ ...formData, precioUsd: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioVes">Precio VES *</Label>
                <Input
                  id="precioVes"
                  type="number"
                  step="0.01"
                  value={formData.precioVes}
                  onChange={e => setFormData({ ...formData, precioVes: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagen">URL de Imagen</Label>
              <Input
                id="imagen"
                type="url"
                value={formData.imagen}
                onChange={e => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="electrodomésticos, lavadoras, hogar"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onFormDialogChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
                {actionType === 'create' ? 'Crear Producto' : 'Actualizar Producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{selectedProduct?.nombre}" será marcado
              como inactivo y ya no estará disponible para nuevos grupos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Eliminar Producto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductActionDialogs;
