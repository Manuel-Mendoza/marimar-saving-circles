import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/atoms';
import { Package, Clock, CheckCircle, Truck, MapPin, Users, Calendar } from 'lucide-react';
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

  // Get status badge for deliveries
  const getDeliveryStatusBadge = (estado: string) => {
    const statusConfig = {
      'PENDIENTE': { label: 'Pendiente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      'ENTREGADO': { label: 'Entregado', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
    };

    const config = statusConfig[estado as keyof typeof statusConfig] || statusConfig['PENDIENTE'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
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
    <div className="h-full flex flex-col p-6">
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard de Entregas</h1>
          <p className="text-sm text-gray-600">
            Gestión completa de entregas y envíos del sistema
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          Actualizar
        </Button>
      </div>

      {/* Main Content Grid - No Scroll Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Left Column - Stats & Status Distribution */}
        <div className="space-y-4">
          {/* Statistics Cards - Compact */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{data.stats.totalDeliveries}</p>
                </div>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pendientes</p>
                  <p className="text-lg font-bold text-yellow-600">{data.stats.pendingDeliveries}</p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                  <p className="text-lg font-bold text-green-600">{data.stats.completedDeliveries}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tasa Éxito</p>
                  <p className="text-lg font-bold">{data.stats.completionRate}%</p>
                </div>
                <Truck className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Status Distribution - Compact */}
          <Card className="p-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Distribución por Estado
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(data.deliveriesByStatus).map(([estado, count]) => (
                <div key={estado} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="text-lg font-bold">{count}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {estado.toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle Column - Recent Deliveries */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5" />
              Entregas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-2 max-h-full overflow-y-auto">
              {data.recentDeliveries.length > 0 ? (
                data.recentDeliveries.slice(0, 6).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDeliveryStatusBadge(delivery.estado)}
                        {delivery.direccion && <MapPin className="h-3 w-3 text-gray-400" />}
                      </div>
                      <p className="text-xs font-medium truncate">{delivery.productName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {delivery.user.nombre} • {delivery.group.nombre}
                      </p>
                    </div>
                    {delivery.estado === 'PENDIENTE' && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteDelivery(delivery.id)}
                        className="text-xs h-6 ml-2"
                      >
                        OK
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay entregas recientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Deliveries by Group */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Entregas por Grupo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <div className="space-y-2 max-h-full overflow-y-auto">
              {data.deliveriesByGroup.length > 0 ? (
                data.deliveriesByGroup.slice(0, 4).map((group) => (
                  <div key={group.groupId} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium truncate">{group.groupName}</h4>
                      <Badge variant="outline" className="text-xs">
                        {group.totalDeliveries}
                      </Badge>
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
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No hay grupos activos
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveriesDashboard;
