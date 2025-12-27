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
import { GroupActionButtons } from '@/components/molecules/groups';

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
              <TableHead className="font-semibold">Duración</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold">Participantes</TableHead>
              <TableHead className="font-semibold">Inicio</TableHead>
              <TableHead className="font-semibold">Turno</TableHead>
              <TableHead className="font-semibold w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <TableCell className="font-medium">
                  {group.nombre}
                </TableCell>
                <TableCell>
                  {group.duracionMeses} meses
                </TableCell>
                <TableCell>
                  <GroupStatusBadge status={group.estado} />
                </TableCell>
                <TableCell>
                  {group.participantes || 0}
                </TableCell>
                <TableCell>
                  {group.fechaInicio
                    ? new Date(group.fechaInicio).toLocaleDateString('es-ES')
                    : '-'
                  }
                </TableCell>
                <TableCell>
                  {group.turnoActual > 0 ? group.turnoActual : '-'}
                </TableCell>
                <TableCell>
                  Posiciones: {group.estado === 'EN_MARCHA' ? 'Asignadas' : 'Sin definir'}
                </TableCell>
                <TableCell>
                  <GroupActionButtons
                    group={group}
                    actionLoadingId={actionLoadingId}
                    onViewGroup={onViewGroup}
                    onEditGroup={onEditGroup}
                    onStartDraw={onStartDraw}
                    onDeleteGroup={onDeleteGroup}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
