import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  AlertCircle,
  FileText,
  Calendar,
  User,
  CreditCard,
  Image as ImageIcon,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { usePaymentRequests } from '@/hooks/usePaymentRequests';
import { PaymentRequest } from '../../../../../shared/types';

const PaymentRequestsView: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hook para actualizar el contador del sidebar automáticamente
  const { refetch: refetchSidebarCount } = usePaymentRequests();

  const loadPaymentRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllPaymentRequests();

      if (response.success) {
        setRequests(response.data.requests);
        // Refresh sidebar counter when loading data
        await refetchSidebarCount();
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las solicitudes de pago',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading payment requests:', error);
      toast({
        title: 'Error',
        description: 'Error al cargar las solicitudes de pago',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [refetchSidebarCount]);

  useEffect(() => {
    loadPaymentRequests();
  }, [loadPaymentRequests]);

  const handleApprove = async (requestId: number) => {
    setIsProcessing(true);
    try {
      const response = await api.approvePaymentRequest(requestId);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Solicitud de pago aprobada exitosamente',
        });
        await loadPaymentRequests(); // Refresh the list
        await refetchSidebarCount(); // Refresh sidebar counter immediately
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Error al aprobar la solicitud',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error approving payment request:', error);
      toast({
        title: 'Error',
        description: 'Error al aprobar la solicitud',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) return;

    setIsProcessing(true);
    try {
      const response = await api.rejectPaymentRequest(selectedRequest.id, rejectReason);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Solicitud de pago rechazada',
        });
        await loadPaymentRequests(); // Refresh the list
        await refetchSidebarCount(); // Refresh sidebar counter immediately
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectReason('');
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Error al rechazar la solicitud',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error rejecting payment request:', error);
      toast({
        title: 'Error',
        description: 'Error al rechazar la solicitud',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const openDetailModal = (request: PaymentRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      PENDIENTE: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      CONFIRMADO: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      RECHAZADO: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' },
    };

    const config = statusConfig[estado] || statusConfig['PENDIENTE'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {estado}
      </Badge>
    );
  };

  const getCurrencyBadge = (moneda: string) => {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <DollarSign className="w-3 h-3" />
        {moneda}
      </Badge>
    );
  };

  // Filter requests by status
  const pendingRequests = requests.filter(r => r.estado === 'PENDIENTE');
  const approvedRequests = requests.filter(r => r.estado === 'CONFIRMADO');
  const rejectedRequests = requests.filter(r => r.estado === 'RECHAZADO');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Pago</h1>
            <p className="text-gray-600 mt-1">Gestiona las solicitudes de pago de los usuarios</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando solicitudes de pago...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Pago</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de pago de los usuarios</p>
        </div>
        <Button onClick={loadPaymentRequests} disabled={loading}>
          Actualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                <p className="text-sm text-gray-600">Aprobadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-gray-600">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests by Status */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pendientes ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rechazadas ({rejectedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Pendientes</CardTitle>
              <CardDescription>Solicitudes que requieren tu aprobación</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes pendientes</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {request.user.nombre[0]}
                                {request.user.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {request.user.nombre} {request.user.apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.user.correoElectronico}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.group.nombre}</span>
                        </TableCell>
                        <TableCell>{request.periodo}</TableCell>
                        <TableCell className="font-medium">${request.monto.toFixed(2)}</TableCell>
                        <TableCell>{getCurrencyBadge(request.moneda)}</TableCell>
                        <TableCell>
                          {new Date(request.fechaSolicitud).toLocaleDateString('es-ES')}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.estado)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailModal(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(request.id)}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openRejectModal(request)}
                              disabled={isProcessing}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Aprobadas</CardTitle>
              <CardDescription>Pagos que han sido confirmados</CardDescription>
            </CardHeader>
            <CardContent>
              {approvedRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes aprobadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Fecha Aprobación</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {request.user.nombre[0]}
                                {request.user.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {request.user.nombre} {request.user.apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.user.correoElectronico}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.group.nombre}</span>
                        </TableCell>
                        <TableCell>{request.periodo}</TableCell>
                        <TableCell className="font-medium">${request.monto.toFixed(2)}</TableCell>
                        <TableCell>{getCurrencyBadge(request.moneda)}</TableCell>
                        <TableCell>
                          {request.fechaAprobacion
                            ? new Date(request.fechaAprobacion).toLocaleDateString('es-ES')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.estado)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailModal(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes Rechazadas</CardTitle>
              <CardDescription>Pagos que han sido rechazados</CardDescription>
            </CardHeader>
            <CardContent>
              {rejectedRequests.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay solicitudes rechazadas</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Grupo</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Moneda</TableHead>
                      <TableHead>Razón</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rejectedRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {request.user.nombre[0]}
                                {request.user.apellido[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {request.user.nombre} {request.user.apellido}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.user.correoElectronico}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{request.group.nombre}</span>
                        </TableCell>
                        <TableCell>{request.periodo}</TableCell>
                        <TableCell className="font-medium">${request.monto.toFixed(2)}</TableCell>
                        <TableCell>{getCurrencyBadge(request.moneda)}</TableCell>
                        <TableCell>
                          <span
                            className="text-sm text-gray-600 max-w-xs truncate"
                            title={request.notasAdmin || ''}
                          >
                            {request.notasAdmin || 'Sin razón especificada'}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.estado)}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailModal(request)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud de Pago</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud #{selectedRequest?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {selectedRequest.user.nombre[0]}
                    {selectedRequest.user.apellido[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedRequest.user.nombre} {selectedRequest.user.apellido}
                  </h3>
                  <p className="text-gray-600">{selectedRequest.user.correoElectronico}</p>
                </div>
                {getStatusBadge(selectedRequest.estado)}
              </div>

              {/* Payment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Período:</span>
                    <span className="text-sm">{selectedRequest.periodo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Monto:</span>
                    <span className="text-sm font-bold">
                      ${selectedRequest.monto.toFixed(2)} {selectedRequest.moneda}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Método:</span>
                    <span className="text-sm">{selectedRequest.metodoPago}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Grupo:</span>
                    <span className="text-sm">{selectedRequest.group.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Fecha solicitud:</span>
                    <span className="text-sm">
                      {new Date(selectedRequest.fechaSolicitud).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  {selectedRequest.fechaAprobacion && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Fecha aprobación:</span>
                      <span className="text-sm">
                        {new Date(selectedRequest.fechaAprobacion).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {selectedRequest.referenciaPago && (
                <div className="space-y-2">
                  <h4 className="font-medium">Referencia de Pago</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedRequest.referenciaPago}
                  </p>
                </div>
              )}

              {selectedRequest.comprobantePago && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Comprobante
                  </h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <img
                      src={selectedRequest.comprobantePago}
                      alt="Comprobante de pago"
                      className="max-w-full h-auto rounded"
                    />
                  </div>
                </div>
              )}

              {selectedRequest.notasAdmin && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas del Administrador
                  </h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedRequest.notasAdmin}
                  </p>
                </div>
              )}

              {/* Action Buttons for Pending Requests */}
              {selectedRequest.estado === 'PENDIENTE' && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={() => {
                      handleApprove(selectedRequest.id);
                      setShowDetailModal(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprobar Pago
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedRequest);
                    }}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud de Pago</DialogTitle>
            <DialogDescription>
              Proporciona una razón para rechazar la solicitud de {selectedRequest?.user.nombre}{' '}
              {selectedRequest?.user.apellido}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Razón del rechazo</label>
              <Textarea
                placeholder="Explica por qué rechazas esta solicitud..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedRequest(null);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Procesando...' : 'Rechazar Solicitud'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentRequestsView;
