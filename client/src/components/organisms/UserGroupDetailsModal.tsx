import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/atoms';
import { Users, Calendar, DollarSign, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { UserGroup, Contribution } from '@/lib/types';
import { PaymentRequestModal } from './PaymentRequestModal';

/**
 * Modal: User Group Details
 * Shows detailed information about a user's group including position, payments, and product
 */
interface UserGroupDetailsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The user's group to show details for */
  userGroup: UserGroup | null;
  /** Current user */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO';
  };
}

export const UserGroupDetailsModal: React.FC<UserGroupDetailsModalProps> = ({
  isOpen,
  onClose,
  userGroup,
  user,
}) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const { toast } = useToast();

  // Load contributions and deliveries for this group
  const loadData = async () => {
    if (!userGroup) return;

    try {
      setLoading(true);

      // Load contributions
      const contributionsResponse = await api.getMyContributions();
      if (contributionsResponse.success) {
        // Filter contributions for this specific group
        let groupContributions = contributionsResponse.data.contributions.filter(
          (contribution: Contribution) => contribution.groupId === userGroup.groupId
        );

        // Remove duplicate contributions for the same periodo, keeping CONFIRMADO over PENDIENTE
        const uniqueContributions = new Map<string, Contribution>();
        groupContributions.forEach(contribution => {
          const key = `${contribution.userId}-${contribution.groupId}-${contribution.periodo}`;
          const existing = uniqueContributions.get(key);

          if (!existing || (existing.estado === 'PENDIENTE' && contribution.estado === 'CONFIRMADO')) {
            uniqueContributions.set(key, contribution);
          }
        });

        groupContributions = Array.from(uniqueContributions.values());
        setContributions(groupContributions);
      }

      // Load deliveries
      const deliveriesResponse = await api.getMyDeliveries();
      if (deliveriesResponse.success) {
        setDeliveries(deliveriesResponse.data.deliveries);
      }

    } catch (error) {
      console.error('Error loading data:', error);
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
    if (isOpen && userGroup) {
      loadData();
    }
  }, [isOpen, userGroup]);

  // Handle payment action
  const handleMakePayment = (contribution: Contribution) => {
    setSelectedContribution(contribution);
    setShowPaymentRequestModal(true);
  };

  // Handle payment request success
  const handlePaymentRequestSuccess = () => {
    // Reload contributions to show updated status
    loadData();
  };

  // Handle delivery address submission
  const handleSubmitDeliveryAddress = async () => {
    if (!userGroup) return;

    try {
      setIsSubmittingAddress(true);

      console.log('🔍 Buscando delivery para grupo:', userGroup.groupId, 'usuario:', user.id);

      // Find the user's current delivery for this group (pending or with address)
      let currentDelivery = deliveries.find(
        delivery => delivery.groupId === userGroup.groupId
      );

      console.log('🎯 Delivery encontrada:', currentDelivery);

      // If no delivery exists, create one automatically
      if (!currentDelivery) {
        console.log('⚠️ No hay delivery, creando una automáticamente...');

        // Create delivery automatically for the current user turn
        const createResponse = await api.createCurrentUserDelivery(userGroup.groupId);

        if (!createResponse.success) {
          throw new Error(createResponse.message || 'Error al crear la entrega automáticamente.');
        }

        console.log('✅ Delivery creada automáticamente:', createResponse.data);

        // Use the newly created delivery
        currentDelivery = createResponse.data.delivery;

        console.log('🎯 Nueva delivery encontrada:', currentDelivery);
      }

      if (!currentDelivery) {
        throw new Error('No se pudo encontrar o crear la entrega.');
      }

      console.log('📤 Actualizando dirección para delivery ID:', currentDelivery.id);

      // Update the delivery address
      const response = await api.updateDeliveryAddress(currentDelivery.id, deliveryAddress);

      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: isEditingAddress
            ? 'Dirección de entrega actualizada exitosamente.'
            : 'Dirección de entrega enviada exitosamente. Los administradores procesarán tu pedido.',
        });

        // Reload data and reset form
        await loadData();
        setDeliveryAddress('');
        setIsEditingAddress(false);

        // Close modal if it's not editing
        if (!isEditingAddress) {
          onClose();
        }
      } else {
        throw new Error(response.message || 'Error al actualizar la dirección');
      }
    } catch (error) {
      console.error('Error submitting delivery address:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingAddress(false);
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

  // Get status badge for contributions
  const getContributionStatusBadge = (estado: string) => {
    const statusConfig = {
      'PENDIENTE': { label: 'Pendiente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'CONFIRMADO': { label: 'Pagado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig['PENDIENTE'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Get status badge for group
  const getGroupStatusBadge = (estado: string) => {
    const statusConfig = {
      'SIN_COMPLETAR': { label: 'Formándose', variant: 'secondary' as const },
      'LLENO': { label: 'Completo', variant: 'default' as const },
      'EN_MARCHA': { label: 'Activo', variant: 'default' as const },
      'COMPLETADO': { label: 'Finalizado', variant: 'outline' as const },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig['SIN_COMPLETAR'];

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  if (!userGroup) return null;

  const totalContributions = contributions.length;
  const paidContributions = contributions.filter(c => c.estado === 'CONFIRMADO').length;
  const pendingContributions = contributions.filter(c => c.estado === 'PENDIENTE').length;

  // Sort contributions by period to find the next chronological pending contribution
  const sortedContributions = [...contributions].sort((a, b) => {
    // Extract month number from periodo (e.g., "Mes 1" -> 1, "Mes 10" -> 10)
    const aMatch = a.periodo.match(/Mes (\d+)/);
    const bMatch = b.periodo.match(/Mes (\d+)/);
    const aNum = aMatch ? parseInt(aMatch[1]) : 0;
    const bNum = bMatch ? parseInt(bMatch[1]) : 0;
    return aNum - bNum;
  });

  // Find the earliest pending contribution that comes after any confirmed contributions
  const confirmedMonths = new Set(
    contributions
      .filter(c => c.estado === 'CONFIRMADO')
      .map(c => {
        const match = c.periodo.match(/Mes (\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
  );

  const nextPendingContribution = sortedContributions.find(c => {
    if (c.estado !== 'PENDIENTE') return false;
    const monthMatch = c.periodo.match(/Mes (\d+)/);
    const monthNum = monthMatch ? parseInt(monthMatch[1]) : 0;
    // Only consider it pending if all previous months are confirmed
    for (let i = 1; i < monthNum; i++) {
      if (!confirmedMonths.has(i)) return false;
    }
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Detalles del Grupo: {userGroup.group?.nombre}
          </DialogTitle>
          <DialogDescription>
            Información completa sobre tu participación en este grupo de ahorro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Información del Grupo
                {userGroup.group && getGroupStatusBadge(userGroup.group.estado)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Tu posición:</span>
                    <span className="font-semibold">{userGroup.posicion || 'Pendiente'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                    <span className="font-semibold">{userGroup.group?.duracionMeses} meses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Producto:</span>
                    <span className="font-semibold">{userGroup.productoSeleccionado}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Moneda:</span>
                    <span className="font-semibold">{userGroup.monedaPago}</span>
                  </div>
                  {userGroup.group?.turnoActual && userGroup.group.estado === 'EN_MARCHA' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Turno Actual:</span>
                      <span className="font-semibold">{userGroup.group.turnoActual}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Fecha de unión:</span>
                    <span className="font-semibold">
                      {new Date(userGroup.fechaUnion).toLocaleDateString()}
                    </span>
                  </div>
                  {userGroup.group?.fechaInicio && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Fecha de inicio:</span>
                      <span className="font-semibold">
                        {new Date(userGroup.group.fechaInicio).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Status - Only show when it's the user's turn */}
          {userGroup.group?.turnoActual === userGroup.posicion && userGroup.group.estado === 'EN_MARCHA' && (
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  ¡Es tu turno para recibir el producto!
                </CardTitle>
                <CardDescription>
                  Ingresa tu dirección de entrega para procesar tu pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                        {userGroup.productoSeleccionado}
                      </h3>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        Mes {userGroup.group.turnoActual} - Tu turno ha llegado
                      </p>
                    </div>
                    <Badge variant="default" className="bg-purple-600">
                      Procesando
                    </Badge>
                  </div>
                </div>

                {/* Address Input Form - Show different UI based on whether address exists */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dirección de Entrega
                    </label>
                    {(() => {
                      // Find existing delivery with address for this user/group
                      const existingDeliveryWithAddress = deliveries.find(
                        delivery =>
                          delivery.groupId === userGroup.groupId &&
                          delivery.direccion &&
                          delivery.direccion.trim().length > 0
                      );

                      const hasAddress = !!existingDeliveryWithAddress;

                      if (isEditingAddress || !hasAddress) {
                        return (
                          <textarea
                            className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                            rows={3}
                            placeholder="Ingresa tu dirección completa para la entrega..."
                            value={isEditingAddress && existingDeliveryWithAddress ? existingDeliveryWithAddress.direccion : deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                          />
                        );
                      } else {
                        return (
                          <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {existingDeliveryWithAddress?.direccion}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setIsEditingAddress(true);
                                  setDeliveryAddress(existingDeliveryWithAddress?.direccion || '');
                                }}
                                className="text-xs"
                              >
                                Editar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (confirm('¿Estás seguro de que quieres eliminar la dirección?')) {
                                    // Clear the address
                                    if (existingDeliveryWithAddress) {
                                      api.updateDeliveryAddress(existingDeliveryWithAddress.id, '').then(response => {
                                        if (response.success) {
                                          loadData(); // Reload data
                                          toast({
                                            title: 'Dirección eliminada',
                                            description: 'La dirección de entrega ha sido eliminada.',
                                          });
                                        }
                                      });
                                    }
                                  }
                                }}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <Button
                    onClick={handleSubmitDeliveryAddress}
                    disabled={!deliveryAddress.trim() || isSubmittingAddress}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {isSubmittingAddress ? 'Enviando...' : isEditingAddress ? 'Actualizar Dirección' : 'Enviar Dirección y Confirmar Entrega'}
                  </Button>
                  {isEditingAddress && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingAddress(false);
                        setDeliveryAddress('');
                      }}
                      className="w-full"
                    >
                      Cancelar Edición
                    </Button>
                  )}
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Una vez enviada la dirección, los administradores procesarán tu entrega</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Recibirás confirmación cuando tu producto esté en camino</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Todos tus pagos han sido verificados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Pagos</CardTitle>
              <CardDescription>
                Estado de tus contribuciones mensuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{totalContributions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total de pagos</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{paidContributions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pagos completados</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{pendingContributions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pagos pendientes</div>
                </div>
              </div>

              {/* Next Payment */}
              {nextPendingContribution && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-semibold text-yellow-800 dark:text-yellow-200">
                          Próximo pago pendiente
                        </div>
                        <div className="text-sm text-yellow-700 dark:text-yellow-300">
                          {nextPendingContribution.periodo} - {formatCurrency(nextPendingContribution.monto, nextPendingContribution.moneda)}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleMakePayment(nextPendingContribution)}
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Realizar Pago
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contributions History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Contribuciones</CardTitle>
              <CardDescription>
                Detalle de todos tus pagos mensuales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="sm" text="Cargando contribuciones..." />
                </div>
              ) : contributions.filter(c => c.estado === 'CONFIRMADO').length > 0 ? (
                <div className="space-y-3">
                  {contributions
                    .filter(c => c.estado === 'CONFIRMADO')
                    .sort((a, b) => {
                      // Sort by period chronologically
                      const aMatch = a.periodo.match(/Mes (\d+)/);
                      const bMatch = b.periodo.match(/Mes (\d+)/);
                      const aNum = aMatch ? parseInt(aMatch[1]) : 0;
                      const bNum = bMatch ? parseInt(bMatch[1]) : 0;
                      return aNum - bNum;
                    })
                    .map((contribution, index) => (
                    <div key={contribution.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            <CheckCircle className="h-3 w-3" />
                            Pagado
                          </Badge>
                        </div>
                        <div>
                          <div className="font-medium">{contribution.periodo}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(contribution.monto, contribution.moneda)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Pagado: {new Date(contribution.fechaPago!).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hay contribuciones registradas
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      {/* Payment Request Modal */}
      <PaymentRequestModal
        isOpen={showPaymentRequestModal}
        onClose={() => {
          setShowPaymentRequestModal(false);
          setSelectedContribution(null);
        }}
        contribution={selectedContribution}
        onSuccess={handlePaymentRequestSuccess}
      />
    </Dialog>
  );
};
