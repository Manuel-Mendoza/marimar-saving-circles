import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CurrencyDisplay } from '@/components/atoms';
import StatusBadge from '@/components/atoms/StatusBadge';
import ProductActionButtons from '@/components/molecules/products/ProductActionButtons';
import { Edit, Trash2, Package, DollarSign } from 'lucide-react';

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

interface ProductsTableProps {
  /** Lista de productos a mostrar */
  products: Producto[];
  /** Título de la tabla */
  title: string;
  /** Producto actualmente cargando acción */
  actionLoadingId?: number;
  /** Función para manejar acciones de producto */
  onProductAction: (product: Producto, action: string) => void;
}

/**
 * Componente Organism para mostrar tabla de productos
 * Combina tabla, filas de producto y botones de acción
 */
const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  title,
  actionLoadingId,
  onProductAction,
}) => {
  // Get available actions for product
  const getAvailableActions = (product: Producto) => {
    const actions = [
      { label: 'Editar', action: 'edit', variant: 'default' as const, icon: Edit },
      { label: 'Eliminar', action: 'delete', variant: 'destructive' as const, icon: Trash2 },
    ];

    return actions;
  };

  // Render product table row
  const renderProductRow = (product: Producto) => (
    <TableRow key={product.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            {product.imagen ? (
              <img
                src={product.imagen}
                alt={product.nombre}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <div className="font-medium">{product.nombre}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{product.descripcion}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <CurrencyDisplay amount={product.precioUsd} currency="USD" />
      </TableCell>
      <TableCell>
        <CurrencyDisplay amount={product.precioVes} currency="VES" />
      </TableCell>
      <TableCell>{product.tiempoDuracion} meses</TableCell>
      <TableCell>
        <StatusBadge status={product.activo ? 'ACTIVO' : 'INACTIVO'} size="sm" />
      </TableCell>
      <TableCell>
        <ProductActionButtons
          actions={getAvailableActions(product)}
          productId={product.id}
          isLoading={actionLoadingId === product.id}
          onAction={action => onProductAction(product, action)}
        />
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Precio USD</TableHead>
              <TableHead>Precio VES</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron productos
                </TableCell>
              </TableRow>
            ) : (
              products.map(renderProductRow)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
