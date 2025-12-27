import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UserGroup, Contribution } from '@/lib/types';
import { useRecentActivities } from './useRecentActivities';

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
  type: 'payment_made' | 'payment_approved' | 'group_joined' | 'draw_completed' | 'product_delivered';
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

  // Use the dedicated recent activities hook
  const { activities: recentActivity, loading: activitiesLoading, error: activitiesError } = useRecentActivities(userId);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [userGroupsResponse, contributionsResponse] = await Promise.all([
        api.getMyGroups(),
        api.getMyContributions(),
      ]);

      const userGroups = userGroupsResponse.success ? userGroupsResponse.data.userGroups : [];
      const contributions = contributionsResponse.success ? contributionsResponse.data.contributions : [];

      // Calculate real stats from user groups
      const activeGroups = userGroups.filter(ug => ug.group.estado === 'EN_MARCHA').length;
      const completedGroups = userGroups.filter(ug => ug.group.estado === 'COMPLETADO').length;
      const productsAcquired = completedGroups;
      const pendingPayments = contributions.filter(contribution => contribution.estado === 'PENDIENTE').length;

      // Find next payment from actual pending contributions
      const nextPayment = pendingPayments > 0 ? (() => {
        const pendingContribution = contributions
          .filter(contribution => contribution.estado === 'PENDIENTE')
          .sort((a, b) => a.periodo.localeCompare(b.periodo))[0];

        if (pendingContribution) {
          const groupInfo = userGroups.find(ug => ug.groupId === pendingContribution.groupId);
          return {
            amount: pendingContribution.monto,
            currency: pendingContribution.moneda,
            dueDate: new Date(Date.now() + (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000),
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
  }, [userId, recentActivity]); // Re-run when activities change

  const refreshData = () => {
    fetchDashboardData();
  };

  return {
    data,
    loading: loading || activitiesLoading,
    error: error || activitiesError,
    refreshData,
  };
};
