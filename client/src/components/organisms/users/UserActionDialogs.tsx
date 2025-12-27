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
import { CheckCircle, User, Mail, Phone, Calendar, CreditCard } from 'lucide-react';
import { StatusBadge } from '@/components/atoms';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  imagenPerfil?: string;
  fechaRegistro: string;
  ultimoAcceso?: string;
  aprobadoPor?: number;
  fechaAprobacion?: string;
  motivo?: string;
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
        return (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Aprobar Usuario</span>
          </div>
        );
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
      case 'approve':
        return '¿Estás seguro de que quieres aprobar este usuario? Esta acción activará su cuenta y le permitirá acceder al sistema.';
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

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      {/* Action Dialog (Approve/Reject/Suspend/Reactivate) */}
      <Dialog open={showActionDialog} onOpenChange={onActionDialogChange}>
        <DialogContent className={actionType === 'approve' ? 'sm:max-w-md' : ''}>
          <DialogHeader>
            <DialogTitle>
              {getDialogTitle(actionType)}
            </DialogTitle>
            <DialogDescription>
              {getDialogDescription(actionType)}
            </DialogDescription>
          </DialogHeader>

          {actionType === 'approve' && selectedUser && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedUser.nombre} {selectedUser.apellido}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedUser.tipo === 'ADMINISTRADOR' ? 'Administrador' : 'Usuario'}
                    </p>
                  </div>
                  <StatusBadge status={selectedUser.estado} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{selectedUser.correoElectronico}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{selectedUser.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>{selectedUser.cedula}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Registrado el {formatDate(selectedUser.fechaRegistro)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Al aprobar este usuario:
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-400 mt-1 space-y-1">
                      <li>• Se activará su cuenta y podrá iniciar sesión</li>
                      <li>• Podrá unirse a grupos de ahorro</li>
                      <li>• Tendrá acceso a todas las funciones del sistema</li>
                      <li>• Recibirá una notificación de aprobación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={
                actionType === 'reject' || actionType === 'suspend' ? 'destructive' : 'default'
              }
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              {actionType === 'approve' ? 'Aprobar Usuario' : 'Confirmar'}
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
