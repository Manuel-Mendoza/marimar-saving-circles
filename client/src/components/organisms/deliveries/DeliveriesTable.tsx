import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import StatusBadge from '@/components/atoms/StatusBadge';
import { MapPin, Package, Calendar, Settings, CheckCircle } from 'lucide-react';

interface DeliveryFromAPI {
  id: number;
  productName: string;
  productValue: string;
  fechaEntrega: string;
  mesEntrega: string;
  estado: string;
  direccion?: string;
  user: { nombre: string; apellido: string } | null;
  group: { nombre: string } | null;
}

interface DeliveriesTableProps {
  /** Lista de entregas a mostrar */
  deliveries: DeliveryFromAPI[];
  /** Título de la tabla */
  title: string;
  /** Entrega actualmente cargando acción */
  actionLoadingId?: number;
  /** Función para manejar acciones de entrega */
  onDeliveryAction: (delivery: DeliveryFromAPI, action: 'update-status' | 'complete') => void;
}

/**
 * Componente Organism para mostrar tabla de entregas
 * Combina tabla, filas de entrega y botones de acción
 */
const DeliveriesTable: React.FC<DeliveriesTableProps> = ({
  deliveries,
  title,
  actionLoadingId,
  onDeliveryAction
}) => {
  // Get available actions for delivery
  const getAvailableActions = (delivery: DeliveryFromAPI) => {
    const actions = [];

    if (delivery.estado === 'PENDIENTE') {
      actions.push(
        { label: 'Marcar En Ruta', action: 'update-status', variant: 'default' as const, icon: MapPin },
        { label: 'Completar', action: 'complete', variant: 'default' as const, icon: CheckCircle }
      );
    } else if (delivery.estado === 'EN_RUTA') {
      actions.push(
        { label: 'Completar', action: 'complete', variant: 'default' as const, icon: CheckCircle },
        { label: 'Cambiar Estado', action: 'update-status', variant: 'outline' as const, icon: Settings }
      );
    }

    return actions;
  };

  // Get status badge color
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'warning';
      case 'EN_RUTA':
        return 'info';
      case 'ENTREGADO':
        return 'success';
      default:
        return 'default';
    }
  };

  // Render delivery table row
  const renderDeliveryRow = (delivery: DeliveryFromAPI) => (
    <TableRow key={delivery.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div className="font-medium">{delivery.productName}</div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">
          {delivery.user?.nombre} {delivery.user?.apellido}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{delivery.group?.nombre}</div>
          <div className="text-sm text-gray-500">{delivery.mesEntrega}</div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={delivery.estado as 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO'} size="sm" />
      </TableCell>
      <TableCell>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {new Date(delivery.fechaEntrega).toLocaleDateString('es-ES')}
        </div>
        {delivery.direccion && (
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <MapPin className="h-3 w-3 mr-1" />
            {delivery.direccion.length > 30
              ? `${delivery.direccion.substring(0, 30)}...`
              : delivery.direccion
            }
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {getAvailableActions(delivery).map((actionItem) => (
            <button
              key={actionItem.action}
              onClick={() => onDeliveryAction(delivery, actionItem.action as 'update-status' | 'complete')}
              disabled={actionLoadingId === delivery.id}
              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                actionItem.variant === 'default'
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                  : actionItem.variant === 'destructive'
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
              } ${actionLoadingId === delivery.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <actionItem.icon className="h-3 w-3 mr-1" />
              {actionItem.label}
            </button>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron entregas
                </TableCell>
              </TableRow>
            ) : (
              deliveries.map(renderDeliveryRow)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DeliveriesTable;
