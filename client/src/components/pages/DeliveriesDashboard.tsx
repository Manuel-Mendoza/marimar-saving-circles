import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/atoms';
import { Package, Clock, CheckCircle, Truck, MapPin, Users, Calendar, Play } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface DeliveriesDashboardData {
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
}

/**
 * Admin Deliveries Dashboard Page
 * Comprehensive dashboard for managing deliveries
 */
export const DeliveriesDashboard: React.FC = () => {
  const [data, setData] = useState<DeliveriesDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.getDeliveriesDashboard();

      if (response.success && response.data) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Error al cargar datos del dashboard');
      }
    } catch (error) {
      console.error('Error loading deliveries dashboard:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle complete delivery
  const handleCompleteDelivery = async (deliveryId: number) => {
    try {
      const response = await api.completeDelivery(deliveryId, 'Completado desde dashboard');

      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: 'Entrega completada exitosamente',
        });

        // Reload data
        await loadDashboardData();
      } else {
        throw new Error(response.message || 'Error al completar entrega');
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error interno del servidor',
        variant: 'destructive',
      });
    }
  };

  // Handle status change to "EN RUTA"
  const handleStartDelivery = async (deliveryId: number) => {
    try {
      const response = await api.updateDeliveryStatus(deliveryId, 'EN_RUTA', 'Entrega iniciada desde dashboard');

      if (response.success) {
        toast({
          title: '¡Éxito!',
          description: 'Entrega iniciada exitosamente',
        });

        // Reload data
        await loadDashboardData();
      } else {
        throw new Error(response.message || 'Error al iniciar entrega');
      }
    } catch (error) {
      console.error('Error starting delivery:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error interno del servidor',
        variant: 'destructive',
      });
    }
  };

  // Get status badge for deliveries
  const getDeliveryStatusBadge = (id: number, estado: string) => {
    const statusConfig = {
      'PENDIENTE': { label: 'Pendiente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'EN_RUTA': { label: 'En Ruta', variant: 'outline' as const, icon: Truck, color: 'text-blue-600' },
      'ENTREGADO': { label: 'Entregado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig['PENDIENTE'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Cargando dashboard de entregas..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se pudieron cargar los datos del dashboard</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard de Entregas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestión completa de entregas y envíos del sistema
        </p>
      </div>

      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-blue-600">{data.stats.totalDeliveries}</div>
          <div className="text-xs text-blue-700 dark:text-blue-300">Total</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600">{data.stats.pendingDeliveries}</div>
          <div className="text-xs text-yellow-700 dark:text-yellow-300">Pendientes</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600">{data.stats.completedDeliveries}</div>
          <div className="text-xs text-green-700 dark:text-green-300">Completadas</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-purple-600">{data.stats.completionRate}%</div>
          <div className="text-xs text-purple-700 dark:text-purple-300">Éxito</div>
        </div>
      </div>

      {/* Bottom Row - Content */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Left - Recent Deliveries */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-3">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Recientes
          </h3>
          <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
            {data.recentDeliveries.length > 0 ? (
              data.recentDeliveries.slice(0, 8).map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      {getDeliveryStatusBadge(delivery.id, delivery.estado)}
                      {delivery.direccion && (
                        <MapPin className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <div className="font-medium truncate text-xs">{delivery.productName}</div>
                    <div className="text-muted-foreground truncate text-xs">
                      {delivery.user.nombre} • {delivery.group.nombre}
                    </div>
                    {delivery.direccion && (
                      <div className="text-muted-foreground truncate text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {delivery.direccion}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {delivery.estado === 'PENDIENTE' && (
                      <Button
                        size="sm"
                        onClick={() => handleStartDelivery(delivery.id)}
                        className="h-6 px-2 text-xs"
                        title="Iniciar entrega"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {(delivery.estado === 'PENDIENTE' || delivery.estado === 'EN_RUTA') && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteDelivery(delivery.id)}
                        className="h-6 px-2 text-xs"
                        title="Marcar como entregado"
                      >
                        ✓
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground text-xs">
                Sin entregas
              </div>
            )}
          </div>
        </div>

        {/* Right - Groups Summary */}
        <div className="space-y-3">
          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-3">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Estados
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.deliveriesByStatus).map(([estado, count]) => (
                <div key={estado} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-bold text-sm">{Number(count) || 0}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {estado.toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-3 flex-1">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos
            </h3>
            <div className="space-y-2 max-h-[calc(100vh-420px)] overflow-y-auto">
              {data.deliveriesByGroup.length > 0 ? (
                data.deliveriesByGroup.slice(0, 5).map((group) => (
                  <div key={group.groupId} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate">{group.groupName}</span>
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 px-1 rounded">
                        {group.totalDeliveries}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-yellow-500" />
                        {group.pendingDeliveries}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {group.completedDeliveries}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground text-xs">
                  Sin grupos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveriesDashboard;
