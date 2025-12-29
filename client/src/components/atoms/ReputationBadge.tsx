import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ReputationBadgeProps {
  /** Puntuación de reputación (0-10) */
  score: number;
  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar puntuación detallada */
  showDetails?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente Atom para mostrar la reputación de un usuario
 * Muestra diferentes estados basados en la puntuación
 */
const ReputationBadge: React.FC<ReputationBadgeProps> = ({
  score,
  size = 'md',
  showDetails = false,
  className,
}) => {
  // Determinar estado y colores basados en la puntuación
  const getReputationStatus = (score: number) => {
    if (score >= 9.0) {
      return {
        label: 'Excelente',
        icon: '⭐',
        variant: 'default' as const,
        bgColor: 'bg-green-100 dark:bg-green-900',
        textColor: 'text-green-800 dark:text-green-200',
      };
    } else if (score >= 7.0) {
      return {
        label: 'Confiable',
        icon: '👍',
        variant: 'secondary' as const,
        bgColor: 'bg-blue-100 dark:bg-blue-900',
        textColor: 'text-blue-800 dark:text-blue-200',
      };
    } else if (score >= 5.0) {
      return {
        label: 'Aceptable',
        icon: '⚠️',
        variant: 'outline' as const,
        bgColor: 'bg-yellow-100 dark:bg-yellow-900',
        textColor: 'text-yellow-800 dark:text-yellow-200',
      };
    } else {
      return {
        label: 'Bajo Observación',
        icon: '❌',
        variant: 'destructive' as const,
        bgColor: 'bg-red-100 dark:bg-red-900',
        textColor: 'text-red-800 dark:text-red-200',
      };
    }
  };

  const status = getReputationStatus(score);

  // Tamaños del badge
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      variant={status.variant}
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        sizeClasses[size],
        status.bgColor,
        status.textColor,
        className
      )}
    >
      <span className="text-lg leading-none">{status.icon}</span>
      <span>{status.label}</span>
      {showDetails && <span className="text-xs opacity-75">({score.toFixed(1)})</span>}
    </Badge>
  );
};

export default ReputationBadge;
