import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge, PaymentInfo, UserAvatar } from '@/components/atoms';
import { CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentRequest } from '@/lib/types';

interface PaymentRequestsTableProps {
  /** Lista de solicitudes de pago */
  paymentRequests: PaymentRequest[];
  /** Modo de vista (admin o user) */
  mode: 'admin' | 'user';
  /** IDs de solicitudes cargando */
  loadingIds?: number[];
  /** Función para aprobar pago (solo admin) */
  onApprove?: (requestId: number) => void;
  /** Función para rechazar pago (solo admin) */
  onReject?: (requestId: number) => void;
  /** Función para ver detalles */
  onViewDetails?: (request: PaymentRequest) => void;
  /** Función para ver comprobante */
  onViewComprobante?: (comprobanteUrl: string) => void;
  /** Título de la tabla */
  title?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Organism: Tabla para mostrar solicitudes de pago
 * Vista tabular con acciones para administradores
 */
const PaymentRequestsTable: React.FC<PaymentRequestsTableProps> = ({
  paymentRequests,
  mode,
  loadingIds = [],
  onApprove,
  onReject,
  onViewDetails,
  onViewComprobante,
  title,
  className,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (paymentRequests.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="text-gray-400 dark:text-gray-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay solicitudes de pago
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {mode === 'admin'
            ? 'No se encontraron solicitudes de pago que coincidan con los filtros.'
            : 'No tienes solicitudes de pago registradas.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className={cn('', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {paymentRequests.length} solicitud{paymentRequests.length !== 1 ? 'es' : ''} encontrada{paymentRequests.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              <TableHead className="w-12">#</TableHead>
              {mode === 'admin' && <TableHead>Usuario</TableHead>}
              <TableHead>Grupo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymentRequests.map((request, index) => {
              const isLoading = loadingIds.includes(request.id);
              const isPending = request.estado === 'PENDIENTE';

              return (
                <TableRow key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {index + 1}
                  </TableCell>

                  {mode === 'admin' && (
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <UserAvatar
                          name={request.user?.nombre || ''}
                          lastname={request.user?.apellido || ''}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.user?.nombre} {request.user?.apellido}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {request.user?.correoElectronico}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  )}

                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.group?.nombre || 'N/A'}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">{request.periodo}</Badge>
                  </TableCell>

                  <TableCell>
                    <PaymentInfo
                      amount={request.monto}
                      currency={request.moneda}
                      paymentMethod={request.metodoPago}
                      className="text-sm"
                    />
                  </TableCell>

                  <TableCell>
                    <PaymentStatusBadge status={request.estado} />
                  </TableCell>

                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(request.fechaSolicitud)}
                  </TableCell>

                  <TableCell>
                    {request.comprobantePago ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewComprobante?.(request.comprobantePago!)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-sm">No requerido</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(request)}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {mode === 'admin' && isPending && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onReject?.(request.id)}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onApprove?.(request.id)}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PaymentRequestsTable;
