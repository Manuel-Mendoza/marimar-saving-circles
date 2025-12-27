import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter } from 'lucide-react';

interface UserSearchFilterProps {
  /** Valor del campo de búsqueda */
  searchTerm: string;
  /** Función para cambiar el término de búsqueda */
  onSearchChange: (value: string) => void;
  /** Filtros de estado activos */
  statusFilters: Set<string>;
  /** Función para cambiar filtros de estado */
  onStatusFilterChange: (status: string, checked: boolean) => void;
  /** Función para limpiar todos los filtros */
  onClearFilters: () => void;
  /** Estados disponibles para filtrar */
  availableStatuses?: string[];
}

/**
 * Componente Molecule para búsqueda y filtrado de usuarios
 * Combina input de búsqueda y dropdown de filtros de estado
 */
const UserSearchFilter: React.FC<UserSearchFilterProps> = ({
  searchTerm,
  onSearchChange,
  statusFilters,
  onStatusFilterChange,
  onClearFilters,
  availableStatuses = ['APROBADO', 'SUSPENDIDO', 'REACTIVADO', 'RECHAZADO', 'PENDIENTE'],
}) => {
  // Get filter summary text
  const getFilterSummary = () => {
    if (statusFilters.size === 0) return 'Todos';
    const statuses = Array.from(statusFilters).map(status => {
      switch (status) {
        case 'PENDIENTE':
          return 'Pendientes';
        case 'APROBADO':
          return 'Aprobados';
        case 'RECHAZADO':
          return 'Rechazados';
        case 'SUSPENDIDO':
          return 'Suspendidos';
        case 'REACTIVADO':
          return 'Reactivados';
        default:
          return status;
      }
    });
    return statuses.join(', ');
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros: {getFilterSummary()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filtrar por Estado</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableStatuses.map(status => (
            <DropdownMenuCheckboxItem
              key={status}
              checked={statusFilters.has(status)}
              onCheckedChange={checked => onStatusFilterChange(status, checked)}
            >
              {status === 'APROBADO' && 'Aprobados'}
              {status === 'SUSPENDIDO' && 'Suspendidos'}
              {status === 'REACTIVADO' && 'Reactivados'}
              {status === 'RECHAZADO' && 'Rechazados'}
              {status === 'PENDIENTE' && 'Pendientes'}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="w-full justify-start text-xs"
              disabled={statusFilters.size === 0 && searchTerm === ''}
            >
              Limpiar Filtros
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserSearchFilter;
