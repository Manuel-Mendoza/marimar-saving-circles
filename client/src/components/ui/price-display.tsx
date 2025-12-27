import React from 'react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Badge } from './badge';

interface PriceDisplayProps {
  vesPrice: number;
  showExchangeRate?: boolean;
  className?: string;
  compact?: boolean;
}

/**
 * Component to display VES prices converted to USD using real-time exchange rates
 */
export function PriceDisplay({
  vesPrice,
  showExchangeRate = false,
  className = '',
  compact = false,
}: PriceDisplayProps) {
  const { usdPrice, exchangeRate, isLoading, error } = useCurrencyConversion(vesPrice);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
        {!compact && <div className="h-3 bg-gray-100 rounded w-16"></div>}
      </div>
    );
  }

  if (error && !usdPrice) {
    return (
      <div className={className}>
        <div className="text-red-600 text-sm">Bs. {vesPrice.toLocaleString()}</div>
        <div className="text-xs text-red-500">Error de conversión</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {!compact ? (
        // Vista completa con ambos precios en líneas separadas
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dólares:</span>
            <span className="font-semibold text-green-600">${usdPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Bolívares:</span>
            <span className="font-semibold text-blue-600">
              Bs. {vesPrice.toLocaleString()} (${usdPrice.toLocaleString()})
            </span>
          </div>
          {showExchangeRate && exchangeRate > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Tasa: {exchangeRate.toFixed(2)} VES/USD
            </div>
          )}
          {error && <div className="text-xs text-orange-500 mt-1">⚠️ Usando tasa de respaldo</div>}
        </div>
      ) : (
        // Vista compacta
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Dólares:</span>
            <span className="font-semibold text-green-600 text-sm">${usdPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Bolívares:</span>
            <span className="font-semibold text-blue-600 text-sm">
              Bs. {vesPrice.toLocaleString()} (${usdPrice.toLocaleString()})
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Simple price display with VES conversion (VES × rate = USD)
 */
export function SimplePriceDisplay({
  vesPrice,
  usdPrice,
  className = '',
  compact = false,
}: {
  vesPrice: number;
  usdPrice: number;
  className?: string;
  compact?: boolean;
}) {
  // usdPrice aquí es el precio directo de la BD, pero necesitamos mostrar la conversión
  // Para SimplePriceDisplay: usdPrice es directo de BD, pero en bolívares mostramos la conversión
  const { usdPrice: convertedUsdPrice, isLoading, error } = useCurrencyConversion(vesPrice);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
        {!compact && <div className="h-3 bg-gray-100 rounded w-16"></div>}
      </div>
    );
  }

  return (
    <div className={className}>
      {!compact ? (
        // Vista completa con ambos precios en líneas separadas
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Dólares:</span>
            <span className="font-semibold text-green-600">${usdPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Bolívares:</span>
            <span className="font-semibold text-gray-500">
              Bs. ${vesPrice.toLocaleString()} // {convertedUsdPrice.toLocaleString()}
            </span>
          </div>
          {error && <div className="text-xs text-orange-500 mt-1">⚠️ Usando tasa de respaldo</div>}
        </div>
      ) : (
        // Vista compacta
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Dólares:</span>
            <span className="font-semibold text-green-600 text-sm">${usdPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Bolívares:</span>
            <span className="font-semibold text-blue-600 text-sm">
              Bs. ${vesPrice.toLocaleString()} -{convertedUsdPrice.toLocaleString()}-
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
