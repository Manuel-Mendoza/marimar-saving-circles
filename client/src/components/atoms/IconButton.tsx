import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  /** Ícono a mostrar (de Lucide React) */
  icon: LucideIcon;
  /** Tamaño del botón */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Variante del botón */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Función onClick */
  onClick?: () => void;
  /** Deshabilitado */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Clases CSS adicionales */
  className?: string;
  /** Tipo de botón */
  type?: 'button' | 'submit' | 'reset';
  /** Aria label para accesibilidad */
  'aria-label'?: string;
}

/**
 * Componente Atom para botones con solo ícono
 * Basado en el Button de shadcn/ui
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  size = 'md',
  variant = 'ghost',
  onClick,
  disabled = false,
  loading = false,
  tooltip,
  className,
  type = 'button',
  'aria-label': ariaLabel,
  ...props
}) => {
  // Obtener clases de tamaño para el ícono
  const getIconSizeClasses = (sizeType: 'xs' | 'sm' | 'md' | 'lg'): string => {
    const sizes = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    return sizes[sizeType];
  };

  // Obtener clases de tamaño para el botón
  const getButtonSizeClasses = (sizeType: 'xs' | 'sm' | 'md' | 'lg'): string => {
    const sizes = {
      xs: 'h-6 w-6 p-1',
      sm: 'h-8 w-8 p-1.5',
      md: 'h-10 w-10 p-2',
      lg: 'h-12 w-12 p-3'
    };
    return sizes[sizeType];
  };

  const iconClasses = getIconSizeClasses(size);
  const buttonClasses = getButtonSizeClasses(size);

  return (
    <Button
      type={type}
      variant={variant}
      size="sm" // Usamos sm como base y override con nuestras clases
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        buttonClasses,
        'flex items-center justify-center',
        tooltip && 'relative',
        className
      )}
      aria-label={ariaLabel}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconClasses)} />
      ) : (
        <Icon className={iconClasses} />
      )}
    </Button>
  );
};

export default IconButton;
