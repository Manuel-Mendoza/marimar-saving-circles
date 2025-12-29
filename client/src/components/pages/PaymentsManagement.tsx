import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/atoms';
import { PaymentRequestCard } from '@/components/molecules/payments';
import {
  PaymentStatsGrid,
  PaymentRequestsTable,
  PaymentActionDialogs,
} from '@/components/organisms/payments';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { PaymentRequest } from '@/lib/types';

interface PaymentsManagementProps {
  /** Usuario administrador actual */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
}

/**
 * Page: Gestión completa de pagos para administradores
 * Vista principal que combina estadísticas, filtros, tabla y acciones
 */
const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ user }) => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Estados de diálogos
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showComprobanteDialog, setShowComprobanteDialog] = useState(false);
  const [comprobanteUrl, setComprobanteUrl] = useState<string>('');
  const [rejectNotes, setRejectNotes] = useState('');

  const { toast } = useToast();

  // Load payment requests
  const loadPaymentRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllPaymentRequests();
      if (response.success) {
        setPaymentRequests(response.data.requests);
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las solicitudes de pago',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPaymentRequests();
  }, [loadPaymentRequests]);

  // Separate requests by status
  const pendingRequests = paymentRequests.filter(r => r.estado === 'PENDIENTE');
  const confirmedRequests = paymentRequests.filter(r => r.estado === 'CONFIRMADO');
  const rejectedRequests = paymentRequests.filter(r => r.estado === 'RECHAZADO');

  // Calculate stats
  const stats = useMemo(() => {
    const totalRequests = paymentRequests.length;
    const pendingRequestsCount = paymentRequests.filter(r => r.estado === 'PENDIENTE').length;
    const confirmedRequestsCount = paymentRequests.filter(r => r.estado === 'CONFIRMADO').length;
    const rejectedRequestsCount = paymentRequests.filter(r => r.estado === 'RECHAZADO').length;

    const confirmedRequestsData = paymentRequests.filter(r => r.estado === 'CONFIRMADO');
    const totalConfirmedAmount = confirmedRequestsData.reduce((sum, r) => sum + r.monto, 0);

    const pendingRequestsData = paymentRequests.filter(r => r.estado === 'PENDIENTE');
    const totalPendingAmount = pendingRequestsData.reduce((sum, r) => sum + r.monto, 0);

    return {
      totalRequests,
      pendingRequests: pendingRequestsCount,
      confirmedRequests: confirmedRequestsCount,
      rejectedRequests: rejectedRequestsCount,
      totalConfirmedAmount,
      totalPendingAmount,
    };
  }, [paymentRequests]);

  // Handle payment actions
  const handleApprove = (requestId: number) => {
    const request = paymentRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowApproveDialog(true);
    }
  };

  const handleReject = (requestId: number) => {
    const request = paymentRequests.find(r => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowRejectDialog(true);
      setRejectNotes('');
    }
  };

  const handleViewDetails = (request: PaymentRequest) => {
    // TODO: Implementar vista de detalles
    console.log('Ver detalles:', request);
  };

  const handleViewComprobante = (comprobanteUrl: string) => {
    // Abrir comprobante en dialog
    setComprobanteUrl(comprobanteUrl);
    setShowComprobanteDialog(true);
  };

  // Confirm approve
  const confirmApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(selectedRequest.id);
      const response = await api.approvePaymentRequest(selectedRequest.id);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Solicitud de pago aprobada exitosamente',
        });
        await loadPaymentRequests(); // Reload data
        setShowApproveDialog(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo aprobar la solicitud de pago',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm reject
  const confirmReject = async () => {
    if (!selectedRequest || !rejectNotes.trim()) return;

    try {
      setActionLoading(selectedRequest.id);
      const response = await api.rejectPaymentRequest(selectedRequest.id, rejectNotes);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Solicitud de pago rechazada',
        });
        await loadPaymentRequests(); // Reload data
        setShowRejectDialog(false);
        setSelectedRequest(null);
        setRejectNotes('');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo rechazar la solicitud de pago',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando solicitudes de pago..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Pagos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra todas las solicitudes de pago de los usuarios
        </p>
      </div>

      {/* Stats Grid */}
      <PaymentStatsGrid stats={stats} className="mb-6" />

      {/* Payment Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmadas ({confirmedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">Todas ({paymentRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <svg
                  className="mx-auto h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay solicitudes pendientes
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todas las solicitudes han sido procesadas
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pendingRequests.map(request => (
                <PaymentRequestCard
                  key={request.id}
                  paymentRequest={request}
                  mode="admin"
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewDetails={handleViewDetails}
                  onViewComprobante={handleViewComprobante}
                  isLoading={actionLoading === request.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="confirmed" className="space-y-4">
          <PaymentRequestsTable
            paymentRequests={confirmedRequests}
            mode="admin"
            loadingIds={actionLoading ? [actionLoading] : []}
            onViewDetails={handleViewDetails}
            onViewComprobante={handleViewComprobante}
            title="Solicitudes Confirmadas"
          />
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <PaymentRequestsTable
            paymentRequests={rejectedRequests}
            mode="admin"
            loadingIds={actionLoading ? [actionLoading] : []}
            onViewDetails={handleViewDetails}
            onViewComprobante={handleViewComprobante}
            title="Solicitudes Rechazadas"
          />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <PaymentRequestsTable
            paymentRequests={paymentRequests}
            mode="admin"
            loadingIds={actionLoading ? [actionLoading] : []}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
            onViewComprobante={handleViewComprobante}
            title="Todas las Solicitudes"
          />
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      <PaymentActionDialogs
        selectedRequest={selectedRequest}
        showApproveDialog={showApproveDialog}
        showRejectDialog={showRejectDialog}
        isLoading={actionLoading !== null}
        rejectNotes={rejectNotes}
        onApproveDialogChange={setShowApproveDialog}
        onRejectDialogChange={setShowRejectDialog}
        onRejectNotesChange={setRejectNotes}
        onConfirmApprove={confirmApprove}
        onConfirmReject={confirmReject}
      />

      {/* Comprobante Dialog */}
      <Dialog open={showComprobanteDialog} onOpenChange={() => setShowComprobanteDialog(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Comprobante de Pago</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center min-h-[400px]">
            {comprobanteUrl && (
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={e => {
                  console.error('Error loading comprobante image:', e);
                  toast({
                    title: 'Error',
                    description: 'No se pudo cargar la imagen del comprobante',
                    variant: 'destructive',
                  });
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsManagement;
