import React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  /** Monto a mostrar */
  amount: number;
  /** Moneda: USD o VES */
  currency: 'USD' | 'VES';
  /** Mostrar símbolo de moneda */
  showSymbol?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Formato compacto (ej: 1.2K) */
  compact?: boolean;
  /** Color basado en el monto */
  colorize?: boolean;
  /** Tamaño del texto */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente Atom para mostrar montos con formato de moneda
 * Soporta USD y VES con formato localizado
 */
const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  currency,
  showSymbol = true,
  className,
  compact = false,
  colorize = false,
  size = 'md',
}) => {
  // Formatear el monto
  const formatAmount = (value: number): string => {
    if (compact) {
      // Formato compacto (1.2K, 1.5M, etc.)
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
    }

    // Formato normal con separadores
    return new Intl.NumberFormat('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Obtener símbolo de moneda
  const getCurrencySymbol = (curr: 'USD' | 'VES'): string => {
    return curr === 'USD' ? '$' : 'Bs.';
  };

  // Obtener clases de tamaño
  const getSizeClasses = (sizeType: 'sm' | 'md' | 'lg'): string => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg font-semibold',
    };
    return sizes[sizeType];
  };

  // Obtener clases de color
  const getColorClasses = (): string => {
    if (!colorize) return '';

    if (amount > 0) {
      return 'text-green-600 dark:text-green-400';
    } else if (amount < 0) {
      return 'text-red-600 dark:text-red-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const formattedAmount = formatAmount(Math.abs(amount));
  const symbol = getCurrencySymbol(currency);
  const isNegative = amount < 0;

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium tabular-nums',
        getSizeClasses(size),
        getColorClasses(),
        className
      )}
    >
      {isNegative && <span className="mr-1">-</span>}
      {showSymbol && currency === 'USD' && <span className="mr-1 font-normal">{symbol}</span>}
      <span>{formattedAmount}</span>
      {showSymbol && currency === 'VES' && <span className="ml-1 font-normal">{symbol}</span>}
    </span>
  );
};

export default CurrencyDisplay;
