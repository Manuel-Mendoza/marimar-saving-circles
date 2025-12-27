import React from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms';

interface User {
  id: number;
  nombre: string;
  apellido: string;
}

interface UserActionDialogsProps {
  /** Usuario seleccionado */
  selectedUser: User | null;
  /** Diálogo de acción abierto */
  showActionDialog: boolean;
  /** Diálogo de eliminación abierto */
  showDeleteDialog: boolean;
  /** Tipo de acción actual */
  actionType: 'approve' | 'reject' | 'suspend' | 'reactivate' | 'delete';
  /** Razón para la acción */
  reason: string;
  /** Loading state */
  isLoading: boolean;
  /** Función para cambiar estado del diálogo de acción */
  onActionDialogChange: (open: boolean) => void;
  /** Función para cambiar estado del diálogo de eliminación */
  onDeleteDialogChange: (open: boolean) => void;
  /** Función para cambiar la razón */
  onReasonChange: (reason: string) => void;
  /** Función para confirmar acción */
  onConfirmAction: () => void;
  /** Función para confirmar eliminación */
  onConfirmDelete: () => void;
}

/**
 * Componente Organism para manejar todos los diálogos de acciones de usuario
 * Centraliza la lógica de diálogos para approve/reject/suspend/reactivate/delete
 */
const UserActionDialogs: React.FC<UserActionDialogsProps> = ({
  selectedUser,
  showActionDialog,
  showDeleteDialog,
  actionType,
  reason,
  isLoading,
  onActionDialogChange,
  onDeleteDialogChange,
  onReasonChange,
  onConfirmAction,
  onConfirmDelete,
}) => {
  // Get dialog title based on action type
  const getDialogTitle = (action: string) => {
    switch (action) {
      case 'approve':
        return 'Aprobar Usuario';
      case 'reject':
        return 'Rechazar Usuario';
      case 'suspend':
        return 'Suspender Usuario';
      case 'reactivate':
        return 'Reactivar Usuario';
      case 'delete':
        return 'Eliminar Usuario';
      default:
        return 'Acción de Usuario';
    }
  };

  // Get dialog description based on action type
  const getDialogDescription = (action: string) => {
    switch (action) {
      case 'reject':
        return 'Por favor, indique el motivo del rechazo:';
      case 'suspend':
        return 'Por favor, indique el motivo de la suspensión:';
      default:
        return '';
    }
  };

  // Check if action requires reason input
  const requiresReason = (action: string) => {
    return action === 'reject' || action === 'suspend' || action === 'delete';
  };

  return (
    <>
      {/* Action Dialog (Approve/Reject/Suspend/Reactivate) */}
      <Dialog open={showActionDialog} onOpenChange={onActionDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {getDialogTitle(actionType)}
            </DialogTitle>
            <DialogDescription>
              {getDialogDescription(actionType)}
            </DialogDescription>
          </DialogHeader>
          {requiresReason(actionType) && (
            <div>
              <Textarea
                placeholder="Motivo..."
                value={reason}
                onChange={e => onReasonChange(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => onActionDialogChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirmAction}
              disabled={isLoading}
              variant={
                actionType === 'reject' || actionType === 'suspend' ? 'destructive' : 'default'
              }
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del
              sistema. Por favor, indique el motivo de la eliminación:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Motivo de eliminación..."
              value={reason}
              onChange={e => onReasonChange(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserActionDialogs;
