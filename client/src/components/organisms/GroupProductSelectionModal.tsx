import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Grupo, Producto } from '@/lib/types';

/**
 * Modal: Group Product Selection
 * Shows products that match the group's duration for selection
 */
interface GroupProductSelectionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The group to join */
  group: Grupo | null;
  /** Current user */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO';
  };
  /** Callback when successfully joined */
  onJoined?: () => void;
}

export const GroupProductSelectionModal: React.FC<GroupProductSelectionModalProps> = ({
  isOpen,
  onClose,
  group,
  user,
  onJoined,
}) => {
  const [products, setProducts] = useState<Producto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'VES' | 'USD'>('VES');
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const { toast } = useToast();

  // Load products that match the group's duration
  const loadProducts = async () => {
    if (!group) return;

    try {
      setLoading(true);
      const response = await api.getProducts();

      if (response.success) {
        // Filter products that match the group's duration
        const matchingProducts = response.data.products.filter(
          (product: Producto) => product.tiempoDuracion === group.duracionMeses
        );
        setProducts(matchingProducts);

        // Auto-select first product if available
        if (matchingProducts.length > 0) {
          setSelectedProduct(matchingProducts[0]);
        }
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
    if (isOpen && group) {
      loadProducts();
    } else {
      // Reset state when modal closes
      setProducts([]);
      setSelectedProduct(null);
      setSelectedCurrency('VES');
    }
  }, [isOpen, group]);

  // Handle joining the group with selected product
  const handleJoinGroup = async () => {
    if (!group || !selectedProduct) return;

    try {
      setJoining(true);
      const response = await api.joinGroup(selectedProduct.id, selectedCurrency);

      if (response.success) {
        toast({
          title: '¡Te has unido al grupo!',
          description: `Grupo: ${group.nombre} - Plan: ${selectedProduct.nombre}`,
        });
        onClose();
        onJoined?.();
      } else {
        toast({
          title: 'Error',
          description: response.message || 'No se pudo unir al grupo',
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
      setJoining(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: 'VES' | 'USD') => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'VES',
      minimumFractionDigits: 2,
    }).format(amount).replace('Bs.S', 'BcV');
  };

  if (!group) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unirse al Grupo: {group.nombre}</DialogTitle>
          <DialogDescription>
            Selecciona un plan de ahorro de {group.duracionMeses} meses para unirte a este grupo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold">{group.duracionMeses} meses</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duración</div>
                </div>
                <div>
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="font-semibold">{group.participantes || 0}/{group.duracionMeses}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Participantes</div>
                </div>
                <div>
                  <div className="h-8 w-8 mx-auto mb-2 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">
                      {group.estado === 'SIN_COMPLETAR' ? 'Formándose' : 'Completo'}
                    </span>
                  </div>
                  <div className="font-semibold">Estado</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Listo para empezar</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Planes disponibles para {group.duracionMeses} meses</h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando planes...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className={`cursor-pointer transition-all ${
                      selectedProduct?.id === product.id
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{product.nombre}</CardTitle>
                        {selectedProduct?.id === product.id && (
                          <div className="h-4 w-4 rounded-full bg-blue-600"></div>
                        )}
                      </div>
                      <CardDescription>{product.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Pricing */}
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-green-600">
                            USD {formatCurrency(product.precioUsd, 'USD').replace('USD ', '')}
                          </div>
                          <div className="text-sm text-gray-500">
                            BcV {formatCurrency(product.precioVes, 'VES').replace('BcV ', '')}
                          </div>
                        </div>

                        {/* Tags */}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay planes disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No se encontraron planes de ahorro para {group.duracionMeses} meses.
                </p>
              </div>
            )}
          </div>

          {/* Currency Selection */}
          {selectedProduct && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seleccionar moneda de pago</CardTitle>
                <CardDescription>
                  Has seleccionado: <strong>{selectedProduct.nombre}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={selectedCurrency}
                  onValueChange={(value) => setSelectedCurrency(value as 'VES' | 'USD')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="VES" id="ves-group" />
                    <Label htmlFor="ves-group" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">BcV (Bolívares)</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(selectedProduct.precioVes, 'VES')}
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <RadioGroupItem value="USD" id="usd-group" />
                    <Label htmlFor="usd-group" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">USD (Dólares)</span>
                        <span className="font-semibold text-blue-600">
                          {formatCurrency(selectedProduct.precioUsd, 'USD')}
                        </span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={joining}>
            Cancelar
          </Button>
          <Button
            onClick={handleJoinGroup}
            disabled={!selectedProduct || joining}
          >
            {joining ? 'Uniéndose...' : 'Unirme al Grupo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
