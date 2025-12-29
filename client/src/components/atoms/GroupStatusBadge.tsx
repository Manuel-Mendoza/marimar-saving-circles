import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Grupo } from '@/lib/types';

/**
 * Atom: Group Status Badge
 * Displays the status of a group with appropriate styling
 */
interface GroupStatusBadgeProps {
  /** Group status */
  status: Grupo['estado'];
  /** Optional custom className */
  className?: string;
}

export const GroupStatusBadge: React.FC<GroupStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: Grupo['estado']) => {
    switch (status) {
      case 'SIN_COMPLETAR':
        return {
          label: 'Sin Completar',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
      case 'LLENO':
        return {
          label: 'Completo',
          variant: 'default' as const,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
      case 'EN_MARCHA':
        return {
          label: 'En Marcha',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
      case 'COMPLETADO':
        return {
          label: 'Completado',
          variant: 'default' as const,
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        };
      default:
        return {
          label: 'Desconocido',
          variant: 'secondary' as const,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      {config.label}
    </Badge>
  );
};
