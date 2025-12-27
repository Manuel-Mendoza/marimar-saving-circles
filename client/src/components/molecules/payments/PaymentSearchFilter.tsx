import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentSearchFilterProps {
  /** Término de búsqueda */
  searchTerm: string;
  /** Función para cambiar el término de búsqueda */
  onSearchChange: (value: string) => void;
  /** Filtros de estado seleccionados */
  statusFilters: Set<string>;
  /** Función para cambiar filtros de estado */
  onStatusFilterChange: (status: string, checked: boolean) => void;
  /** Filtros de moneda seleccionados */
  currencyFilters: Set<string>;
  /** Función para cambiar filtros de moneda */
  onCurrencyFilterChange: (currency: string, checked: boolean) => void;
  /** Función para limpiar todos los filtros */
  onClearFilters: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Molecule: Filtros de búsqueda para solicitudes de pago
 * Combina Input, Select, Badge y botones para filtrar pagos
 */
const PaymentSearchFilter: React.FC<PaymentSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilters,
  onStatusFilterChange,
  currencyFilters,
  onCurrencyFilterChange,
  onClearFilters,
  className,
}) => {
  const statusOptions = [
    { value: 'PENDIENTE', label: 'Pendientes', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'CONFIRMADO', label: 'Confirmados', color: 'bg-green-100 text-green-800' },
    { value: 'RECHAZADO', label: 'Rechazados', color: 'bg-red-100 text-red-800' },
  ];

  const currencyOptions = [
    { value: 'VES', label: 'Bolívares (VES)' },
    { value: 'USD', label: 'Dólares (USD)' },
  ];

  const hasActiveFilters = searchTerm || statusFilters.size > 0 || currencyFilters.size > 0;

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros de Búsqueda</span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto h-6 px-2 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Búsqueda por texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre, grupo, período..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtros de estado */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Estado del pago
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = statusFilters.has(option.value);
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected ? option.color : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => onStatusFilterChange(option.value, !isSelected)}
                >
                  {option.label}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Filtros de moneda */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Moneda
          </label>
          <div className="flex flex-wrap gap-2">
            {currencyOptions.map((option) => {
              const isSelected = currencyFilters.has(option.value);
              return (
                <Badge
                  key={option.value}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected && 'bg-blue-100 text-blue-800 border-blue-200'
                  )}
                  onClick={() => onCurrencyFilterChange(option.value, !isSelected)}
                >
                  {option.label}
                  {isSelected && <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Filtros activos: {[
                searchTerm && 'búsqueda',
                statusFilters.size > 0 && `${statusFilters.size} estado(s)`,
                currencyFilters.size > 0 && `${currencyFilters.size} moneda(s)`,
              ].filter(Boolean).join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSearchFilter;
