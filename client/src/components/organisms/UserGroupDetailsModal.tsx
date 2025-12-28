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
  const [loading, setLoading] = useState(false);
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  const { toast } = useToast();

  // Load contributions for this group
  const loadContributions = async () => {
    if (!userGroup) return;

    try {
      setLoading(true);
      const response = await api.getMyContributions();

      if (response.success) {
        // Filter contributions for this specific group
        const groupContributions = response.data.contributions.filter(
          (contribution: Contribution) => contribution.groupId === userGroup.groupId
        );
        setContributions(groupContributions);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las contribuciones',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
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
      loadContributions();
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
    loadContributions();
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

  const nextPendingContribution = sortedContributions.find(c => c.estado === 'PENDIENTE');

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
