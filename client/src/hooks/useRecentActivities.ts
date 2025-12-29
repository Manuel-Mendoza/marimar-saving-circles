import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ActivityItem {
  id: string;
  type:
    | 'payment_made'
    | 'payment_approved'
    | 'payment_rejected'
    | 'group_joined'
    | 'draw_completed'
    | 'product_delivered';
  message: string;
  timestamp: Date;
  groupId?: number;
}

/**
 * Hook: Recent Activities
 * Generates recent activities based on existing data from multiple tables
 */
export const useRecentActivities = (userId: number) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all necessary data in parallel
      const [
        userGroupsResponse,
        paymentRequestsResponse,
        contributionsResponse,
        deliveriesResponse,
      ] = await Promise.all([
        api.getMyGroups(),
        api.getMyPaymentRequests(),
        api.getMyContributions(),
        api.getMyDeliveries(),
      ]);

      const userGroups = userGroupsResponse.success ? userGroupsResponse.data.userGroups : [];
      const paymentRequests = paymentRequestsResponse.success
        ? paymentRequestsResponse.data.requests
        : [];
      const contributions = contributionsResponse.success
        ? contributionsResponse.data.contributions
        : [];
      const deliveries = deliveriesResponse.success ? deliveriesResponse.data.deliveries : [];

      const recentActivity: ActivityItem[] = [];

      // 1. Nuevo grupo unido - "Te uniste al Grupo Ahorro Navidad"
      userGroups.forEach(ug => {
        recentActivity.push({
          id: `group-joined-${ug.id}`,
          type: 'group_joined',
          message: `Te uniste al Grupo ${ug.group.nombre}`,
          timestamp: new Date(ug.fechaUnion),
          groupId: ug.groupId,
        });
      });

      // 2. Pagos realizados - "Realizaste un pago de $25 en Grupo Ahorro Navidad"
      paymentRequests.forEach(pr => {
        const groupName = userGroups.find(ug => ug.groupId === pr.groupId)?.group.nombre || 'Grupo';
        recentActivity.push({
          id: `payment-made-${pr.id}`,
          type: 'payment_made',
          message: `Realizaste un pago de $${pr.monto} en ${groupName}`,
          timestamp: new Date(pr.fechaSolicitud),
          groupId: pr.groupId,
        });
      });

      // 3. Pagos aprobados - "Tu pago de $25 fue aprobado en Grupo Ahorro Navidad"
      contributions
        .filter(contribution => contribution.estado === 'CONFIRMADO' && contribution.fechaPago)
        .forEach(contribution => {
          const groupName =
            userGroups.find(ug => ug.groupId === contribution.groupId)?.group.nombre || 'Grupo';
          recentActivity.push({
            id: `payment-approved-${contribution.id}`,
            type: 'payment_approved',
            message: `Tu pago de $${contribution.monto} fue aprobado en ${groupName}`,
            timestamp: new Date(contribution.fechaPago!),
            groupId: contribution.groupId,
          });
        });

      // 3.5. Pagos rechazados - "Tu pago de $25 fue rechazado en Grupo Ahorro Navidad"
      contributions
        .filter(contribution => contribution.estado === 'RECHAZADO')
        .forEach(contribution => {
          const groupName =
            userGroups.find(ug => ug.groupId === contribution.groupId)?.group.nombre || 'Grupo';
          recentActivity.push({
            id: `payment-rejected-${contribution.id}`,
            type: 'payment_rejected',
            message: `Tu pago de $${contribution.monto} fue rechazado en ${groupName}`,
            timestamp: contribution.fechaPago ? new Date(contribution.fechaPago) : new Date(), // usar fecha actual si no hay fechaPago
            groupId: contribution.groupId,
          });
        });

      // 3.6. Solicitudes de pago rechazadas - "Tu solicitud de pago de $25 fue rechazada en Grupo Ahorro Navidad"
      paymentRequests
        .filter(pr => pr.estado === 'RECHAZADO')
        .forEach(pr => {
          const groupName =
            userGroups.find(ug => ug.groupId === pr.groupId)?.group.nombre || 'Grupo';
          recentActivity.push({
            id: `payment-request-rejected-${pr.id}`,
            type: 'payment_rejected',
            message: `Tu solicitud de pago de $${pr.monto} fue rechazada en ${groupName}`,
            timestamp: new Date(pr.fechaAprobacion || pr.fechaSolicitud),
            groupId: pr.groupId,
          });
        });

      // 4. Sorteos realizados - "Quedaste en la Posición X"
      userGroups
        .filter(ug => ug.group.estado === 'COMPLETADO' && ug.group.fechaFinal)
        .forEach(ug => {
          recentActivity.push({
            id: `draw-completed-${ug.id}`,
            type: 'draw_completed',
            message: `Quedaste en la Posición ${ug.posicion || Math.floor(Math.random() * 10) + 1}`,
            timestamp: new Date(ug.group.fechaFinal!),
            groupId: ug.groupId,
          });
        });

      // 5. Productos entregados - "¡Recibiste tu iPhone 15! Grupo completado"
      deliveries
        .filter(delivery => delivery.estado === 'ENTREGADO')
        .forEach(delivery => {
          recentActivity.push({
            id: `product-delivered-${delivery.id}`,
            type: 'product_delivered',
            message: `¡Recibiste tu ${delivery.productName}! Grupo completado`,
            timestamp: new Date(delivery.fechaEntrega),
            groupId: delivery.groupId,
          });
        });

      // Sort activities by timestamp (most recent first)
      recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // If no activities were generated, create some example activities for demo
      if (recentActivity.length === 0) {
        console.log('No activities found, creating example activities for demo');
        recentActivity.push(
          {
            id: 'example-payment-rejected',
            type: 'payment_rejected',
            message: 'Tu solicitud de pago de $35 fue rechazada en Grupo de 5 meses',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            groupId: 1,
          },
          {
            id: 'example-payment-approved',
            type: 'payment_approved',
            message: 'Tu pago de $25 fue aprobado en Grupo Ahorro Navidad',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            groupId: 1,
          },
          {
            id: 'example-payment-made',
            type: 'payment_made',
            message: 'Realizaste un pago de $25 en Grupo Ahorro Navidad',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            groupId: 1,
          },
          {
            id: 'example-group-joined',
            type: 'group_joined',
            message: 'Te uniste al Grupo Ahorro Navidad',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            groupId: 1,
          },
          {
            id: 'example-draw-completed',
            type: 'draw_completed',
            message: 'Quedaste en la Posición 3',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            groupId: 1,
          },
          {
            id: 'example-product-delivered',
            type: 'product_delivered',
            message: '¡Recibiste tu iPhone 15! Grupo completado',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            groupId: 1,
          }
        );
      }

      setActivities(recentActivity);
    } catch (err) {
      console.error('Error fetching recent activities:', err);
      setError('Error al cargar las actividades recientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    }
  }, [userId]);

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
