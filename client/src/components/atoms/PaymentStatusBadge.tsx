import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PaymentStatusBadgeProps {
  /** Estado del pago */
  status: 'PENDIENTE' | 'CONFIRMADO' | 'RECHAZADO';
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Atom: Badge para mostrar el estado de un pago
 */
const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  className,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return {
          variant: 'secondary' as const,
          text: 'Pendiente',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
        };
      case 'CONFIRMADO':
        return {
          variant: 'default' as const,
          text: 'Confirmado',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
        };
      case 'RECHAZADO':
        return {
          variant: 'destructive' as const,
          text: 'Rechazado',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
        };
      default:
        return {
          variant: 'secondary' as const,
          text: status,
          className: '',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={cn('font-medium', config.className, className)}
    >
      {config.text}
    </Badge>
  );
};

export default PaymentStatusBadge;
