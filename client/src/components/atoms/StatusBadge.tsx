import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType =
  | 'APROBADO'
  | 'PENDIENTE'
  | 'RECHAZADO'
  | 'SUSPENDIDO'
  | 'REACTIVADO'
  | 'SIN_COMPLETAR'
  | 'LLENO'
  | 'EN_MARCHA'
  | 'COMPLETADO'
  | 'CONFIRMADO'
  | 'ENTREGADO'
  | 'ACTIVO'
  | 'INACTIVO';

interface StatusBadgeProps {
  /** Estado a mostrar */
  status: StatusType;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del badge */
  size?: 'sm' | 'md';
  /** Mostrar texto del estado */
  showLabel?: boolean;
}

/**
 * Componente Atom para mostrar badges de estado
 * Estilizado según el tipo de estado
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
  showLabel = true
}) => {
  // Configuración de colores y textos por estado
  const getStatusConfig = (status: StatusType) => {
    const configs = {
      // Estados de usuario
      APROBADO: {
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
        label: 'Aprobado'
      },
      PENDIENTE: {
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800',
        label: 'Pendiente'
      },
      RECHAZADO: {
        variant: 'destructive' as const,
        bgColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
        label: 'Rechazado'
      },
      SUSPENDIDO: {
        variant: 'destructive' as const,
        bgColor: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800',
        label: 'Suspendido'
      },
      REACTIVADO: {
        variant: 'default' as const,
        bgColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
        label: 'Reactivado'
      },

      // Estados de grupo
      SIN_COMPLETAR: {
        variant: 'outline' as const,
        bgColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800',
        label: 'Sin completar'
      },
      LLENO: {
        variant: 'default' as const,
        bgColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800',
        label: 'Completo'
      },
      EN_MARCHA: {
        variant: 'default' as const,
        bgColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800',
        label: 'En marcha'
      },
      COMPLETADO: {
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
        label: 'Completado'
      },

      // Estados de pago/contribuciones
      CONFIRMADO: {
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
        label: 'Confirmado'
      },

      // Estados de entrega
      ENTREGADO: {
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
        label: 'Entregado'
      },

      // Estados generales
      ACTIVO: {
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800',
        label: 'Activo'
      },
      INACTIVO: {
        variant: 'secondary' as const,
        bgColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800',
        label: 'Inactivo'
      }
    };

    return configs[status] || {
      variant: 'outline' as const,
      bgColor: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800',
      label: status
    };
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1';

  return (
    <Badge
      variant={config.variant}
      className={cn(
        sizeClasses,
        config.bgColor,
        'font-medium border',
        className
      )}
    >
      {showLabel ? config.label : status}
    </Badge>
  );
};

export default StatusBadge;
