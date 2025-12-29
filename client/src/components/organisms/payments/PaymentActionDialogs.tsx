import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PaymentInfo, PaymentStatusBadge } from '@/components/atoms';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentRequest } from '@/lib/types';

interface PaymentActionDialogsProps {
  /** Solicitud de pago seleccionada */
  selectedRequest: PaymentRequest | null;
  /** Mostrar diálogo de aprobación */
  showApproveDialog: boolean;
  /** Mostrar diálogo de rechazo */
  showRejectDialog: boolean;
  /** Estado de carga */
  isLoading: boolean;
  /** Notas del admin para rechazo */
  rejectNotes: string;
  /** Función para cambiar estado del diálogo de aprobación */
  onApproveDialogChange: (show: boolean) => void;
  /** Función para cambiar estado del diálogo de rechazo */
  onRejectDialogChange: (show: boolean) => void;
  /** Función para cambiar notas de rechazo */
  onRejectNotesChange: (notes: string) => void;
  /** Función para confirmar aprobación */
  onConfirmApprove: () => void;
  /** Función para confirmar rechazo */
  onConfirmReject: () => void;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Organism: Diálogos para acciones de pago (aprobar/rechazar)
 * Maneja la lógica de aprobación y rechazo con validaciones
 */
const PaymentActionDialogs: React.FC<PaymentActionDialogsProps> = ({
  selectedRequest,
  showApproveDialog,
  showRejectDialog,
  isLoading,
  rejectNotes,
  onApproveDialogChange,
  onRejectDialogChange,
  onRejectNotesChange,
  onConfirmApprove,
  onConfirmReject,
  className,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = () => {
    onConfirmApprove();
  };

  const handleReject = () => {
    if (!rejectNotes.trim()) {
      return; // El botón estará deshabilitado, pero por si acaso
    }
    onConfirmReject();
  };

  return (
    <>
      {/* Diálogo de Aprobación */}
      <Dialog open={showApproveDialog} onOpenChange={onApproveDialogChange}>
        <DialogContent className={cn('sm:max-w-md', className)}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Aprobar Solicitud de Pago</span>
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres aprobar esta solicitud de pago? Esta acción no se puede
              deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.user?.nombre} {selectedRequest.user?.apellido}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRequest.group?.nombre} • {selectedRequest.periodo}
                    </p>
                  </div>
                  <PaymentStatusBadge status={selectedRequest.estado} />
                </div>

                <PaymentInfo
                  amount={selectedRequest.monto}
                  currency={selectedRequest.moneda}
                  paymentMethod={selectedRequest.metodoPago}
                  reference={selectedRequest.referenciaPago}
                />

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Solicitado el {formatDate(selectedRequest.fechaSolicitud)}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Al aprobar esta solicitud:
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-400 mt-1 space-y-1">
                      <li>• Se registrará el pago como confirmado</li>
                      <li>• Se creará una entrada en las contribuciones del grupo</li>
                      <li>• El usuario podrá continuar con sus pagos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onApproveDialogChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Aprobando...' : 'Aprobar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Rechazo */}
      <Dialog open={showRejectDialog} onOpenChange={onRejectDialogChange}>
        <DialogContent className={cn('sm:max-w-md', className)}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span>Rechazar Solicitud de Pago</span>
            </DialogTitle>
            <DialogDescription>
              Proporciona una razón detallada para el rechazo de esta solicitud. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedRequest.user?.nombre} {selectedRequest.user?.apellido}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedRequest.group?.nombre} • {selectedRequest.periodo}
                    </p>
                  </div>
                  <PaymentStatusBadge status={selectedRequest.estado} />
                </div>

                <PaymentInfo
                  amount={selectedRequest.monto}
                  currency={selectedRequest.moneda}
                  paymentMethod={selectedRequest.metodoPago}
                  reference={selectedRequest.referenciaPago}
                />

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Solicitado el {formatDate(selectedRequest.fechaSolicitud)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reject-notes" className="text-sm font-medium">
                  Razón del rechazo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-notes"
                  placeholder="Explica por qué se rechaza esta solicitud de pago..."
                  value={rejectNotes}
                  onChange={e => onRejectNotesChange(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Esta nota será visible para el usuario y le ayudará a corregir su solicitud.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                      Al rechazar esta solicitud:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-400 mt-1 space-y-1">
                      <li>• El usuario podrá enviar una nueva solicitud</li>
                      <li>• Se notificará al usuario sobre el rechazo</li>
                      <li>• La solicitud quedará registrada como rechazada</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onRejectDialogChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectNotes.trim()}
            >
              {isLoading ? 'Rechazando...' : 'Rechazar Pago'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentActionDialogs;
