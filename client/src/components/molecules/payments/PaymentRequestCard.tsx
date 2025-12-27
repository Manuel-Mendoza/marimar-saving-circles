import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge, PaymentInfo, UserAvatar } from '@/components/atoms';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentRequest } from '@/lib/types';

interface PaymentRequestCardProps {
  /** Solicitud de pago */
  paymentRequest: PaymentRequest;
  /** Modo de vista (admin o user) */
  mode: 'admin' | 'user';
  /** Función para aprobar pago (solo admin) */
  onApprove?: (requestId: number) => void;
  /** Función para rechazar pago (solo admin) */
  onReject?: (requestId: number) => void;
  /** Función para ver detalles */
  onViewDetails?: (request: PaymentRequest) => void;
  /** Loading state para acciones */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Molecule: Tarjeta para mostrar una solicitud de pago
 * Combina PaymentStatusBadge, PaymentInfo, UserAvatar y botones de acción
 */
const PaymentRequestCard: React.FC<PaymentRequestCardProps> = ({
  paymentRequest,
  mode,
  onApprove,
  onReject,
  onViewDetails,
  isLoading = false,
  className,
}) => {
  const {
    id,
    periodo,
    monto,
    moneda,
    metodoPago,
    referenciaPago,
    comprobantePago,
    estado,
    fechaSolicitud,
    notasAdmin,
    user,
    group,
  } = paymentRequest;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPending = estado === 'PENDIENTE';

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {user && (
              <UserAvatar
                name={user.nombre}
                lastname={user.apellido}
                size="sm"
              />
            )}
            <div>
              <CardTitle className="text-lg">
                {user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido'}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {group?.nombre || 'Grupo desconocido'} • {periodo}
              </p>
            </div>
          </div>
          <PaymentStatusBadge status={estado} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del pago */}
        <PaymentInfo
          amount={monto}
          currency={moneda}
          paymentMethod={metodoPago}
          reference={referenciaPago}
        />

        {/* Información adicional */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Fecha solicitud:</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(fechaSolicitud)}
            </p>
          </div>
          {comprobantePago && (
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-blue-600 hover:underline cursor-pointer">
                Ver comprobante
              </span>
            </div>
          )}
        </div>

        {/* Notas del admin (si existen) */}
        {notasAdmin && (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Notas del administrador:
            </p>
            <p className="text-sm text-gray-900 dark:text-white">{notasAdmin}</p>
          </div>
        )}

        <Separator />

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(paymentRequest)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Ver detalles</span>
          </Button>

          {mode === 'admin' && isPending && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject?.(id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rechazar
              </Button>
              <Button
                size="sm"
                onClick={() => onApprove?.(id)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aprobar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentRequestCard;
