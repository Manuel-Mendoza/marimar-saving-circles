import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Grupo } from '@/lib/types';
import { GroupStatusBadge } from '@/components/atoms';

/**
 * Organism: Groups Table
 * Table displaying groups with actions
 */
interface GroupsTableProps {
  /** Array of groups to display */
  groups: Grupo[];
  /** Title for the table */
  title: string;
  /** Loading state for group actions */
  actionLoadingId?: number | null;
  /** Function to handle view group details */
  onViewGroup: (group: Grupo) => void;
  /** Function to handle edit group */
  onEditGroup: (group: Grupo) => void;
  /** Function to handle start draw */
  onStartDraw: (group: Grupo) => void;
  /** Function to handle delete group */
  onDeleteGroup: (group: Grupo) => void;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({
  groups,
  title,
  actionLoadingId,
  onViewGroup,
  onEditGroup,
  onStartDraw,
  onDeleteGroup,
}) => {
  if (groups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No hay grupos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title} ({groups.length})
      </h2>

      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Participantes</TableHead>
              <TableHead className="font-semibold">Posiciones</TableHead>
              <TableHead className="font-semibold w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium">{group.nombre}</TableCell>
                <TableCell>
                  <GroupStatusBadge status={group.estado} />
                </TableCell>
                <TableCell>{group.participantes || 0}</TableCell>
                <TableCell>{group.fechaInicio ? 'Asignadas' : 'Sin definir'}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewGroup(group)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                    >
                      Ver
                    </button>

                    {group.estado === 'LLENO' && (
                      <button
                        onClick={() => onStartDraw(group)}
                        disabled={actionLoadingId === group.id}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      >
                        {actionLoadingId === group.id ? 'Iniciando...' : 'Sortear'}
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteGroup(group)}
                      disabled={actionLoadingId === group.id}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
