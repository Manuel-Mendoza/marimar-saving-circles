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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms';
import StatusBadge from '@/components/atoms/StatusBadge';
import { CheckCircle, Package, MapPin, Calendar, User, Truck, Home } from 'lucide-react';

interface DeliveryFromAPI {
  id: number;
  productName: string;
  productValue: string;
  fechaEntrega: string;
  mesEntrega: string;
  estado: string;
  direccion?: string;
  user: { nombre: string; apellido: string };
  group: { nombre: string };
}

interface DeliveryActionDialogsProps {
  /** Entrega seleccionada */
  selectedDelivery: DeliveryFromAPI | null;
  /** Diálogo de cambio de estado abierto */
  showStatusDialog: boolean;
  /** Diálogo de completado abierto */
  showCompleteDialog: boolean;
  /** Estado de acción actual */
  statusAction: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO';
  /** Notas para la acción */
  notes: string;
  /** Loading state */
  isLoading: boolean;
  /** Función para cambiar estado del diálogo de estado */
  onStatusDialogChange: (open: boolean) => void;
  /** Función para cambiar estado del diálogo de completado */
  onCompleteDialogChange: (open: boolean) => void;
  /** Función para cambiar estado de acción */
  onStatusActionChange: (action: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO') => void;
  /** Función para cambiar notas */
  onNotesChange: (notes: string) => void;
  /** Función para confirmar cambio de estado */
  onConfirmStatusUpdate: () => void;
  /** Función para confirmar completado */
  onConfirmComplete: () => void;
}

/**
 * Componente Organism para manejar todos los diálogos de acciones de entrega
 * Centraliza la lógica de diálogos para cambiar estado y completar entregas
 */
const DeliveryActionDialogs: React.FC<DeliveryActionDialogsProps> = ({
  selectedDelivery,
  showStatusDialog,
  showCompleteDialog,
  statusAction,
  notes,
  isLoading,
  onStatusDialogChange,
  onCompleteDialogChange,
  onStatusActionChange,
  onNotesChange,
  onConfirmStatusUpdate,
  onConfirmComplete,
}) => {
  // Get status options based on current status
  const getStatusOptions = (currentStatus: string) => {
    const allOptions = [
      { value: 'PENDIENTE', label: 'Pendiente' },
      { value: 'EN_RUTA', label: 'En Ruta' },
      { value: 'ENTREGADO', label: 'Entregado' },
    ];

    // Filter out current status
    return allOptions.filter(option => option.value !== currentStatus);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'EN_RUTA':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'ENTREGADO':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
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
      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={onStatusDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {getStatusIcon(statusAction)}
              <span>Cambiar Estado de Entrega</span>
            </DialogTitle>
            <DialogDescription>
              Actualice el estado de esta entrega. Esta acción será registrada en el sistema.
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedDelivery.productName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valor: {selectedDelivery.productValue}
                    </p>
                  </div>
                  <StatusBadge status={selectedDelivery.estado as 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO'} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      {selectedDelivery.user?.nombre} {selectedDelivery.user?.apellido}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{selectedDelivery.group?.nombre} - {selectedDelivery.mesEntrega}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Entrega: {formatDate(selectedDelivery.fechaEntrega)}</span>
                  </div>
                  {selectedDelivery.direccion && (
                    <div className="flex items-start space-x-2 text-sm">
                      <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-xs">{selectedDelivery.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nuevo Estado
                </label>
                <Select
                  value={statusAction}
                  onValueChange={(value: 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO') =>
                    onStatusActionChange(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {getStatusOptions(selectedDelivery.estado).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(option.value)}
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas (opcional)
                </label>
                <Textarea
                  placeholder="Agregar notas sobre el cambio de estado..."
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Cambio de estado:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      De <strong>{selectedDelivery.estado}</strong> a <strong>{statusAction}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onStatusDialogChange(false)}>
              Cancelar
            </Button>
            <Button onClick={onConfirmStatusUpdate} disabled={isLoading}>
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Actualizar Estado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Delivery Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={onCompleteDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Marcar Entrega como Completada</span>
            </DialogTitle>
            <DialogDescription>
              Confirme que esta entrega ha sido completada exitosamente.
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedDelivery.productName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Valor: {selectedDelivery.productValue}
                    </p>
                  </div>
                  <StatusBadge status={selectedDelivery.estado as 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO'} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>
                      {selectedDelivery.user?.nombre} {selectedDelivery.user?.apellido}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>{selectedDelivery.group?.nombre} - {selectedDelivery.mesEntrega}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Entrega: {formatDate(selectedDelivery.fechaEntrega)}</span>
                  </div>
                  {selectedDelivery.direccion && (
                    <div className="flex items-start space-x-2 text-sm">
                      <Home className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-xs">{selectedDelivery.direccion}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notas de Completación (opcional)
                </label>
                <Textarea
                  placeholder="Agregar notas sobre la entrega completada..."
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                      Al marcar como completada:
                    </p>
                    <ul className="text-sm text-green-700 dark:text-green-400 mt-1 space-y-1">
                      <li>• La entrega se marcará como "ENTREGADO"</li>
                      <li>• Se actualizará la fecha de entrega</li>
                      <li>• El usuario será notificado</li>
                      <li>• Se avanzará el progreso del grupo si corresponde</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onCompleteDialogChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={onConfirmComplete}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
              Marcar como Completada
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeliveryActionDialogs;
