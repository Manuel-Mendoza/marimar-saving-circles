import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/atoms';
import { DeliveryStatsGrid, DeliveriesTable, DeliveryActionDialogs } from '@/components/organisms';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import type { Delivery } from '@/lib/types';

interface DeliveriesManagementProps {
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
}

export const DeliveriesManagement: React.FC<DeliveriesManagementProps> = ({ user }) => {
  const [deliveries, setDeliveries] = useState<Array<{
    id: number;
    productName: string;
    productValue: string;
    fechaEntrega: string;
    mesEntrega: string;
    estado: string;
    direccion?: string;
    user: { nombre: string; apellido: string };
    group: { nombre: string };
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState<typeof deliveries[0] | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [statusAction, setStatusAction] = useState<'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO'>('PENDIENTE');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<{
    stats: {
      totalDeliveries: number;
      pendingDeliveries: number;
      completedDeliveries: number;
      monthlyDeliveries: number;
      completionRate: number;
    };
    deliveriesByStatus: Record<string, number>;
    recentDeliveries: Array<{
      id: number;
      productName: string;
      productValue: string;
      fechaEntrega: string;
      mesEntrega: string;
      estado: string;
      direccion?: string;
      user: { nombre: string; apellido: string };
      group: { nombre: string };
    }>;
    deliveriesByGroup: Array<{
      groupId: number;
      groupName: string;
      totalDeliveries: number;
      pendingDeliveries: number;
      completedDeliveries: number;
    }>;
  } | null>(null);

  // Load deliveries dashboard data
  const loadDeliveriesData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getDeliveriesDashboard();

      if (response.success) {
        setDashboardData(response.data);
        // Flatten recent deliveries for table display
        setDeliveries(response.data.recentDeliveries);
      }
    } catch (error) {
      console.error('Error loading deliveries data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de entregas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDeliveriesData();
  }, [loadDeliveriesData]);

  // Filter deliveries based on search term and status filters
  const filterDeliveries = (deliveryList: typeof deliveries) => {
    let filtered = deliveryList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        delivery =>
          delivery.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          delivery.group.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilters.size > 0) {
      filtered = filtered.filter(delivery => statusFilters.has(delivery.estado));
    }

    return filtered;
  };

  // Handle status filter toggle
  const handleStatusFilterToggle = (status: string, checked: boolean) => {
    const newFilters = new Set(statusFilters);
    if (checked) {
      newFilters.add(status);
    } else {
      newFilters.delete(status);
    }
    setStatusFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilters(new Set());
    setSearchTerm('');
  };

  // Handle delivery actions
  const handleDeliveryAction = async (
    delivery: typeof deliveries[0],
    action: 'update-status' | 'complete'
  ) => {
    setSelectedDelivery(delivery);
    setNotes('');

    if (action === 'complete') {
      setShowCompleteDialog(true);
    } else {
      setStatusAction(delivery.estado as 'PENDIENTE' | 'EN_RUTA' | 'ENTREGADO');
      setShowStatusDialog(true);
    }
  };

  // Confirm status update
  const confirmStatusUpdate = async () => {
    if (!selectedDelivery) return;

    try {
      setActionLoading(selectedDelivery.id);
      const response = await api.updateDeliveryStatus(selectedDelivery.id, statusAction, notes);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: `Estado de entrega actualizado a ${statusAction}`,
        });
        await loadDeliveriesData(); // Reload data
        setShowStatusDialog(false);
        setNotes('');
      }
    } catch (error) {
      console.error('Error updating delivery status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la entrega',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm delivery completion
  const confirmDeliveryComplete = async () => {
    if (!selectedDelivery) return;

    try {
      setActionLoading(selectedDelivery.id);
      const response = await api.completeDelivery(selectedDelivery.id, notes);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Entrega marcada como completada',
        });
        await loadDeliveriesData(); // Reload data
        setShowCompleteDialog(false);
        setNotes('');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: 'Error',
        description: 'No se pudo completar la entrega',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_RUTA':
        return 'En Ruta';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando entregas..." />
        </div>
      </div>
    );
  }

  const filteredDeliveries = filterDeliveries(deliveries);
  const filteredPendingDeliveries = filterDeliveries(
    deliveries.filter(d => d.estado === 'PENDIENTE')
  );

  const stats = dashboardData ? {
    totalDeliveries: dashboardData.stats.totalDeliveries,
    pendingDeliveries: dashboardData.stats.pendingDeliveries,
    completedDeliveries: dashboardData.stats.completedDeliveries,
    monthlyDeliveries: dashboardData.stats.monthlyDeliveries,
    completionRate: dashboardData.stats.completionRate,
  } : {
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    monthlyDeliveries: 0,
    completionRate: 0,
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Entregas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra todas las entregas del sistema de ahorro colaborativo
        </p>
      </div>

      {/* Search and Filter - TODO: Implement DeliverySearchFilter component */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por producto, usuario o grupo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            {['PENDIENTE', 'EN_RUTA', 'ENTREGADO'].map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={statusFilters.has(status)}
                  onChange={(e) => handleStatusFilterToggle(status, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {getStatusText(status)}
                </span>
              </label>
            ))}
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <DeliveryStatsGrid {...stats} />

      {/* Deliveries Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas las Entregas ({filteredDeliveries.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes ({filteredPendingDeliveries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <DeliveriesTable
            deliveries={filteredDeliveries}
            title="Todas las Entregas"
            actionLoadingId={actionLoading}
            onDeliveryAction={handleDeliveryAction}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <DeliveriesTable
            deliveries={filteredPendingDeliveries}
            title="Entregas Pendientes"
            actionLoadingId={actionLoading}
            onDeliveryAction={handleDeliveryAction}
          />
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      <DeliveryActionDialogs
        selectedDelivery={selectedDelivery}
        showStatusDialog={showStatusDialog}
        showCompleteDialog={showCompleteDialog}
        statusAction={statusAction}
        notes={notes}
        isLoading={actionLoading !== null}
        onStatusDialogChange={setShowStatusDialog}
        onCompleteDialogChange={setShowCompleteDialog}
        onStatusActionChange={setStatusAction}
        onNotesChange={setNotes}
        onConfirmStatusUpdate={confirmStatusUpdate}
        onConfirmComplete={confirmDeliveryComplete}
      />
    </div>
  );
};
