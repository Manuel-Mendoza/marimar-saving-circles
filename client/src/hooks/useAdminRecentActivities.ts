import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AdminActivityItem {
  id: string;
  type: 'user_registered' | 'payment_approved' | 'group_created' | 'product_added';
  message: string;
  timestamp: Date;
  user?: string;
}

/**
 * Hook: Admin Recent Activities
 * Generates recent system-wide activities for admin dashboard
 */
export const useAdminRecentActivities = () => {
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all necessary data in parallel
      const [usersResponse, paymentRequestsResponse, groupsResponse, productsResponse] =
        await Promise.all([
          api.getAllUsers(),
          api.getAllPaymentRequests(),
          api.getGroups(),
          api.getProducts(),
        ]);

      const users = usersResponse.success ? usersResponse.data.users : [];
      const paymentRequests = paymentRequestsResponse.success
        ? paymentRequestsResponse.data.requests
        : [];
      const groups = groupsResponse.success ? groupsResponse.data.groups : [];
      const products = productsResponse.success ? productsResponse.data.products : [];

      const recentActivity: AdminActivityItem[] = [];

      // 1. Usuarios registrados recientemente
      users
        .sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime())
        .slice(0, 10) // Últimos 10 usuarios
        .forEach(user => {
          recentActivity.push({
            id: `user-registered-${user.id}`,
            type: 'user_registered',
            message: `${user.nombre} ${user.apellido} se registró en el sistema`,
            timestamp: new Date(user.fechaRegistro),
            user: `${user.nombre} ${user.apellido}`,
          });
        });

      // 2. Pagos aprobados recientemente
      paymentRequests
        .filter(pr => pr.estado === 'CONFIRMADO')
        .sort(
          (a, b) =>
            new Date(b.fechaAprobacion || b.fechaSolicitud).getTime() -
            new Date(a.fechaAprobacion || a.fechaSolicitud).getTime()
        )
        .slice(0, 10) // Últimos 10 pagos aprobados
        .forEach(pr => {
          recentActivity.push({
            id: `payment-approved-${pr.id}`,
            type: 'payment_approved',
            message: `Pago de $${pr.monto} ${pr.moneda} aprobado para ${pr.user.nombre} ${pr.user.apellido}`,
            timestamp: new Date(pr.fechaAprobacion || pr.fechaSolicitud),
            user: `${pr.user.nombre} ${pr.user.apellido}`,
          });
        });

      // 3. Grupos creados recientemente
      groups
        .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()) // Asumiendo que ID mayor = más reciente
        .slice(0, 5) // Últimos 5 grupos
        .forEach(group => {
          recentActivity.push({
            id: `group-created-${group.id}`,
            type: 'group_created',
            message: `Nuevo grupo "${group.nombre}" creado (${group.duracionMeses} meses)`,
            timestamp: group.fechaInicio ? new Date(group.fechaInicio) : new Date(), // Usar fecha de creación si disponible
          });
        });

      // 4. Productos agregados recientemente (usando productos activos como aproximación)
      products
        .sort((a, b) => new Date(b.id || 0).getTime() - new Date(a.id || 0).getTime()) // Asumiendo que ID mayor = más reciente
        .slice(0, 3) // Últimos 3 productos
        .forEach(product => {
          recentActivity.push({
            id: `product-added-${product.id}`,
            type: 'product_added',
            message: `Nuevo producto "${product.nombre}" agregado ($${product.precioUsd} USD)`,
            timestamp: new Date(), // No hay fecha de creación, usar fecha actual
          });
        });

      // Sort all activities by timestamp (most recent first)
      recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Limit to 20 most recent activities
      const limitedActivities = recentActivity.slice(0, 20);

      setActivities(limitedActivities);
    } catch (err) {
      console.error('Error fetching admin recent activities:', err);
      setError('Error al cargar las actividades recientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const refreshActivities = () => {
    fetchActivities();
  };

  return {
    activities,
    loading,
    error,
    refreshActivities,
  };
};
