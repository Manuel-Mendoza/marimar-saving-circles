import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/atoms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Producto } from '@/lib/types';

/**
 * Page: User Products Management
 * Shows available products for users to choose and join groups
 */
interface UserProductsManagementProps {
  /** Current user */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO';
    imagenCedula?: string;
  };
}

export const UserProductsManagement: React.FC<UserProductsManagementProps> = ({ user }) => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingProduct, setSelectingProduct] = useState<number | null>(null);

  // Selection dialog state
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'VES' | 'USD'>('VES');

  const { toast } = useToast();

  // Load products data
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();

      if (response.success) {
        setProducts(response.data.products);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los productos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle product selection
  const handleSelectProduct = (product: Producto) => {
    setSelectedProduct(product);
    setSelectedCurrency('VES'); // Default to VES
    setShowSelectDialog(true);
  };

  // Handle join group with selected product and currency
  const handleJoinGroup = async () => {
    if (!selectedProduct) return;

    try {
      setSelectingProduct(selectedProduct.id);
      const response = await api.joinGroup(selectedProduct.id, selectedCurrency);

      if (response.success) {
        toast({
          title: '¡Producto seleccionado!',
          description: `Te has unido exitosamente a un grupo con el plan ${selectedProduct.nombre}`,
        });
        setShowSelectDialog(false);
        setSelectedProduct(null);
        // Optionally reload products or navigate to groups
      } else {
        toast({
          title: 'Error',
          description: response.message || 'No se pudo seleccionar el producto',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setSelectingProduct(null);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando productos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Planes de Ahorro
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Elige el plan de ahorro que mejor se adapte a tus necesidades
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{product.nombre}</CardTitle>
                <CardDescription className="text-base">
                  {product.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Precio mensual:</span>
                      <div className="text-right">
                        <div className="font-semibold text-green-600 text-lg">
                          {formatCurrency(product.precioUsd, 'USD')}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {formatCurrency(product.precioVes, 'VES').replace('Bs.S', 'BcV')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Duration Badge */}
                  <div className="flex justify-center">
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {product.tiempoDuracion} meses
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{product.tiempoDuracion} participantes por grupo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>Pagos mensuales</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {product.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSelectProduct(product)}
                    disabled={selectingProduct === product.id}
                    className="w-full"
                    size="lg"
                  >
                    {selectingProduct === product.id ? 'Seleccionando...' : 'Elegir este Producto'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Los productos estarán disponibles próximamente.
            </p>
          </div>
        )}
      </div>

      {/* Selection Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Seleccionar Plan de Ahorro</DialogTitle>
            <DialogDescription>
              Has seleccionado el plan <strong>{selectedProduct?.nombre}</strong>.
              Elige la moneda en la que deseas realizar tus pagos mensuales.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Moneda de pago</Label>
              <RadioGroup
                value={selectedCurrency}
                onValueChange={(value) => setSelectedCurrency(value as 'VES' | 'USD')}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="VES" id="ves" />
                  <Label htmlFor="ves" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>BcV (Bolívares)</span>
                      <span className="font-semibold text-gray-600">
                        {selectedProduct ? formatCurrency(selectedProduct.precioVes, 'VES').replace('Bs.S', 'BcV') : ''}
                      </span>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="USD" id="usd" />
                  <Label htmlFor="usd" className="flex-1 cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span>USD (Dólares)</span>
                      <span className="font-semibold text-green-600">
                        {selectedProduct ? formatCurrency(selectedProduct.precioUsd, 'USD') : ''}
                      </span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Nota:</strong> Al seleccionar este plan, serás asignado automáticamente a un grupo disponible
                o se creará uno nuevo si es necesario. Los pagos se realizarán mensualmente durante {selectedProduct?.tiempoDuracion} meses.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSelectDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleJoinGroup}
              disabled={selectingProduct !== null}
            >
              {selectingProduct !== null ? 'Uniendo...' : 'Confirmar selección'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
