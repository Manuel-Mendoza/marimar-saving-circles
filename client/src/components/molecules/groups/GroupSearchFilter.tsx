import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grupo } from '@/lib/types';
import { Search, X } from 'lucide-react';

/**
 * Molecule: Group Search and Filter
 * Search bar and filters for groups
 */
interface GroupSearchFilterProps {
  /** Current search term */
  searchTerm: string;
  /** Function to handle search term change */
  onSearchChange: (term: string) => void;
  /** Selected status filters */
  statusFilters: Set<string>;
  /** Function to handle status filter toggle */
  onStatusFilterChange: (status: string, checked: boolean) => void;
  /** Function to clear all filters */
  onClearFilters: () => void;
}

export const GroupSearchFilter: React.FC<GroupSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilters,
  onStatusFilterChange,
  onClearFilters,
}) => {
  const groupStatuses: { value: Grupo['estado']; label: string }[] = [
    { value: 'SIN_COMPLETAR', label: 'Sin Completar' },
    { value: 'LLENO', label: 'Completo' },
    { value: 'EN_MARCHA', label: 'En Marcha' },
    { value: 'COMPLETADO', label: 'Completado' },
  ];

  const handleStatusChange = (status: string) => {
    const isSelected = statusFilters.has(status);
    onStatusFilterChange(status, !isSelected);
  };

  const hasActiveFilters = searchTerm || statusFilters.size > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar grupos por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Estado:
          </label>
          <Select onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {groupStatuses.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {statusFilters.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtros activos:</span>
            {Array.from(statusFilters).map(status => {
              const statusConfig = groupStatuses.find(s => s.value === status);
              return (
                <div
                  key={status}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {statusConfig?.label}
                  <button
                    onClick={() => onStatusFilterChange(status, false)}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};
