import React from 'react';
import CurrencyDisplay from './CurrencyDisplay';
import { cn } from '@/lib/utils';

interface PaymentInfoProps {
  /** Monto del pago */
  amount: number;
  /** Moneda del pago */
  currency: 'VES' | 'USD';
  /** Método de pago */
  paymentMethod: string;
  /** Referencia de pago (opcional) */
  reference?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Atom: Información básica de un pago
 */
const PaymentInfo: React.FC<PaymentInfoProps> = ({
  amount,
  currency,
  paymentMethod,
  reference,
  className,
}) => {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900 dark:text-white">Monto:</span>
        <CurrencyDisplay amount={amount} currency={currency} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">Método:</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{paymentMethod}</span>
      </div>
      {reference && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Referencia:</span>
          <span className="text-sm font-mono text-gray-900 dark:text-white">{reference}</span>
        </div>
      )}
    </div>
  );
};

export default PaymentInfo;
