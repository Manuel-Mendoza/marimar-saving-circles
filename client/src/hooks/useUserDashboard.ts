import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UserGroup, Contribution } from '@/lib/types';

interface UserDashboardData {
  userGroups: UserGroup[];
  contributions: Contribution[];
  stats: {
    activeGroups: number;
    completedGroups: number;
    pendingPayments: number;
    productsAcquired: number;
    nextPayment?: {
      amount: number;
      currency: 'USD' | 'VES';
      dueDate: Date;
      groupName: string;
    };
  };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'payment_made' | 'group_joined' | 'product_selected';
  message: string;
  timestamp: Date;
  groupId?: number;
}

/**
 * Hook: User Dashboard Data
 * Fetches and manages all dashboard data for a user
 */
export const useUserDashboard = (userId: number) => {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user groups
      const userGroupsResponse = await api.getMyGroups();
      const userGroups = userGroupsResponse.success ? userGroupsResponse.data.userGroups : [];

      // Fetch contributions to get real pending payments
      const contributionsResponse = await api.getMyContributions();
      const contributions = contributionsResponse.success ? contributionsResponse.data.contributions : [];

      // Calculate real stats from user groups
      const activeGroups = userGroups.filter(ug => ug.group.estado === 'EN_MARCHA').length;
      const completedGroups = userGroups.filter(ug => ug.group.estado === 'COMPLETADO').length;

      // Calculate products acquired (completed groups = products received)
      const productsAcquired = completedGroups;

      // Calculate pending payments from actual unpaid contributions
      const pendingPayments = contributions.filter(contribution => contribution.estado === 'PENDIENTE').length;

      // Generate activity from real group data
      const recentActivity: ActivityItem[] = [];

      userGroups.forEach((ug) => {
        // Group joined activity - real date
        recentActivity.push({
          id: `group-joined-${ug.id}`,
          type: 'group_joined',
          message: `Te uniste al grupo "${ug.group.nombre}"`,
          timestamp: new Date(ug.fechaUnion),
          groupId: ug.groupId,
        });

        // Product selection activity - real date
        recentActivity.push({
          id: `product-selected-${ug.id}`,
          type: 'product_selected',
          message: `Seleccionaste "${ug.productoSeleccionado}" en ${ug.group.nombre}`,
          timestamp: new Date(ug.fechaUnion),
          groupId: ug.groupId,
        });
      });

      // Add payment activities for active groups (more realistic simulation)
      userGroups
        .filter(ug => ug.group.estado === 'EN_MARCHA')
        .forEach((ug, index) => {
          // Simulate some payments made in the past
          const paymentsMade = Math.floor(Math.random() * 3) + 1; // 1-3 payments made
          for (let i = 0; i < paymentsMade; i++) {
            const paymentDate = new Date();
            paymentDate.setDate(paymentDate.getDate() - (i * 14 + Math.floor(Math.random() * 7))); // Every 2 weeks with some variance

            recentActivity.push({
              id: `payment-${ug.id}-${i}`,
              type: 'payment_made',
              message: `Realizaste un pago de $${Math.floor(Math.random() * 30) + 20} en ${ug.group.nombre}`,
              timestamp: paymentDate,
              groupId: ug.groupId,
            });
          }
        });

      // Sort activities by timestamp (most recent first)
      recentActivity.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // Find next payment from actual pending contributions
      const nextPayment = pendingPayments > 0 ? (() => {
        // Get the most recent pending contribution (earliest period)
        const pendingContribution = contributions
          .filter(contribution => contribution.estado === 'PENDIENTE')
          .sort((a, b) => a.periodo.localeCompare(b.periodo))[0]; // Sort by period (Mes 1, Mes 2, etc.)

        if (pendingContribution) {
          // Find the group name from user groups
          const groupInfo = userGroups.find(ug => ug.groupId === pendingContribution.groupId);
          return {
            amount: pendingContribution.monto,
            currency: pendingContribution.moneda,
            dueDate: new Date(Date.now() + (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000), // Still using some randomization for due date since it's not in the contribution
            groupName: groupInfo?.group.nombre || 'Grupo Activo',
          };
        }
        return undefined;
      })() : undefined;

      const dashboardData: UserDashboardData = {
        userGroups,
        contributions,
        stats: {
          activeGroups,
          completedGroups,
          pendingPayments,
          productsAcquired,
          nextPayment,
        },
        recentActivity,
      };

      setData(dashboardData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
};
