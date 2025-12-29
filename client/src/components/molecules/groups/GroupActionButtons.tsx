import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Grupo } from '@/lib/types';
import { MoreHorizontal, Eye, Edit, Play, Trash2 } from 'lucide-react';

/**
 * Molecule: Group Action Buttons
 * Action buttons for group management (view, edit, start draw, delete)
 */
interface GroupActionButtonsProps {
  /** Group data */
  group: Grupo;
  /** Loading state for specific group actions */
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

export const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  group,
  actionLoadingId,
  onViewGroup,
  onEditGroup,
  onStartDraw,
  onDeleteGroup,
}) => {
  // Only disable for actual operations, not for viewing details
  const isLoading = actionLoadingId === group.id && actionLoadingId !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={isLoading}
          onClick={e => {
            // Prevent event bubbling and ensure button works
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onViewGroup(group)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalles
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => onEditGroup(group)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar grupo
        </DropdownMenuItem>

        {group.estado === 'LLENO' && (
          <DropdownMenuItem
            onClick={() => onStartDraw(group)}
            disabled={isLoading}
            className="text-green-600 dark:text-green-400"
          >
            <Play className="mr-2 h-4 w-4" />
            {isLoading ? 'Iniciando...' : 'Iniciar sorteo'}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => onDeleteGroup(group)}
          disabled={isLoading}
          className="text-red-600 dark:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar grupo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
