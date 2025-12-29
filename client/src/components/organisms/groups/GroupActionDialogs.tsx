import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Grupo } from '@/lib/types';
import { Loader2 } from 'lucide-react';

/**
 * Organism: Group Action Dialogs
 * Dialogs for creating, editing, and deleting groups
 */
interface GroupActionDialogsProps {
  /** Dialog states */
  showCreateDialog: boolean;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  /** Group being edited */
  selectedGroup: Grupo | null;
  /** Loading state */
  isLoading: boolean;
  /** Delete reason */
  deleteReason: string;
  /** Functions to control dialogs */
  onCreateDialogChange: (open: boolean) => void;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  /** Functions to handle actions */
  onCreateGroup: (groupData: { nombre: string; duracionMeses: number }) => void;
  onUpdateGroup: (
    groupId: number,
    groupData: { nombre?: string; duracionMeses?: number; estado?: string }
  ) => void;
  onDeleteGroup: (groupId: number, reason?: string) => void;
  /** Function to update delete reason */
  onDeleteReasonChange: (reason: string) => void;
}

export const GroupActionDialogs: React.FC<GroupActionDialogsProps> = ({
  showCreateDialog,
  showEditDialog,
  showDeleteDialog,
  selectedGroup,
  isLoading,
  deleteReason,
  onCreateDialogChange,
  onEditDialogChange,
  onDeleteDialogChange,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onDeleteReasonChange,
}) => {
  // Form states
  const [createForm, setCreateForm] = useState({ nombre: '', duracionMeses: 1 });
  const [editForm, setEditForm] = useState({
    nombre: '',
    duracionMeses: 1,
    estado: 'SIN_COMPLETAR',
  });

  // Reset forms when dialogs open
  useEffect(() => {
    if (showCreateDialog) {
      setCreateForm({ nombre: '', duracionMeses: 1 });
    }
  }, [showCreateDialog]);

  useEffect(() => {
    if (showEditDialog && selectedGroup) {
      setEditForm({
        nombre: selectedGroup.nombre,
        duracionMeses: selectedGroup.duracionMeses,
        estado: selectedGroup.estado,
      });
    }
  }, [showEditDialog, selectedGroup]);

  // Handle create form submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (createForm.nombre.trim() && createForm.duracionMeses >= 1) {
      onCreateGroup(createForm);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGroup && editForm.nombre.trim() && editForm.duracionMeses >= 1) {
      onUpdateGroup(selectedGroup.id, {
        nombre: editForm.nombre,
        duracionMeses: editForm.duracionMeses,
        estado: editForm.estado,
      });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      onDeleteGroup(selectedGroup.id, deleteReason.trim() || undefined);
    }
  };

  const groupStatuses = [
    { value: 'SIN_COMPLETAR', label: 'Sin Completar' },
    { value: 'LLENO', label: 'Completo' },
    { value: 'EN_MARCHA', label: 'En Marcha' },
    { value: 'COMPLETADO', label: 'Completado' },
  ];

  return (
    <>
      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={onCreateDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Grupo</DialogTitle>
            <DialogDescription>
              Crea un nuevo grupo de ahorro especificando su nombre y duración.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-nombre">Nombre del Grupo</Label>
              <Input
                id="create-nombre"
                value={createForm.nombre}
                onChange={e => setCreateForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Grupo Primavera"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-duracion">Duración (meses)</Label>
              <Input
                id="create-duracion"
                type="number"
                min="1"
                max="24"
                value={createForm.duracionMeses}
                onChange={e =>
                  setCreateForm(prev => ({ ...prev, duracionMeses: parseInt(e.target.value) || 1 }))
                }
                required
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onCreateDialogChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || !createForm.nombre.trim()}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Grupo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditDialog} onOpenChange={onEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
            <DialogDescription>Modifica la información del grupo seleccionado.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre del Grupo</Label>
              <Input
                id="edit-nombre"
                value={editForm.nombre}
                onChange={e => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Grupo Primavera"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duracion">Duración (meses)</Label>
              <Input
                id="edit-duracion"
                type="number"
                min="1"
                max="24"
                value={editForm.duracionMeses}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, duracionMeses: parseInt(e.target.value) || 1 }))
                }
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estado">Estado</Label>
              <Select
                value={editForm.estado}
                onValueChange={value => setEditForm(prev => ({ ...prev, estado: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onEditDialogChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !editForm.nombre.trim() || !selectedGroup}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Group Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el grupo "
              <strong>{selectedGroup?.nombre}</strong>" y toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-reason">Razón de eliminación (opcional)</Label>
            <Textarea
              id="delete-reason"
              value={deleteReason}
              onChange={e => onDeleteReasonChange(e.target.value)}
              placeholder="Ej: Grupo cancelado por falta de participantes..."
              disabled={isLoading}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar Grupo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
