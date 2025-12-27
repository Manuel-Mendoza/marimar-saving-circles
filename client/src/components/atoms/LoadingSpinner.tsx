import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color del spinner */
  color?: 'default' | 'primary' | 'secondary' | 'white';
  /** Clases CSS adicionales */
  className?: string;
  /** Texto opcional junto al spinner */
  text?: string;
  /** Mostrar spinner en línea o centrado */
  inline?: boolean;
  /** Mostrar overlay */
  overlay?: boolean;
}

/**
 * Componente Atom para mostrar estados de carga
 * Spinner animado con diferentes tamaños y colores
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'default',
  className,
  text,
  inline = false,
  overlay = false,
}) => {
  // Obtener clases de tamaño
  const getSizeClasses = (sizeType: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    const sizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    };
    return sizes[sizeType];
  };

  // Obtener clases de color
  const getColorClasses = (colorType: 'default' | 'primary' | 'secondary' | 'white'): string => {
    const colors = {
      default: 'border-gray-300 border-t-gray-600',
      primary: 'border-blue-200 border-t-blue-600',
      secondary: 'border-gray-200 border-t-gray-500',
      white: 'border-white/30 border-t-white',
    };
    return colors[colorType];
  };

  const sizeClasses = getSizeClasses(size);
  const colorClasses = getColorClasses(color);

  const spinner = (
    <div
      className={cn(
        'animate-spin rounded-full border-2',
        sizeClasses,
        colorClasses,
        'border-t-transparent',
        className
      )}
      role="status"
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
          {spinner}
          {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
        </div>
      </div>
    );
  }

  if (inline) {
    return (
      <div className="inline-flex items-center space-x-2">
        {spinner}
        {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      {spinner}
      {text && <p className="text-center text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
