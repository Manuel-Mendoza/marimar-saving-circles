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
  type: 'payment_made' | 'payment_approved' | 'payment_rejected' | 'group_joined' | 'draw_completed' | 'product_delivered';
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

      // Find next payment from actual pending contributions with proper chronological logic
      const nextPayment = pendingPayments > 0 ? (() => {
        // Sort contributions by period to find the next chronological pending contribution
        const sortedContributions = [...contributions].sort((a, b) => {
          // Extract month number from periodo (e.g., "Mes 1" -> 1, "Mes 10" -> 10)
          const aMatch = a.periodo.match(/Mes (\d+)/);
          const bMatch = b.periodo.match(/Mes (\d+)/);
          const aNum = aMatch ? parseInt(aMatch[1]) : 0;
          const bNum = bMatch ? parseInt(bMatch[1]) : 0;
          return aNum - bNum;
        });

        // Find the earliest pending contribution that comes after any confirmed contributions
        const confirmedMonths = new Set(
          contributions
            .filter(c => c.estado === 'CONFIRMADO')
            .map(c => {
              const match = c.periodo.match(/Mes (\d+)/);
              return match ? parseInt(match[1]) : 0;
            })
        );

        const nextPendingContribution = sortedContributions.find(c => {
          if (c.estado !== 'PENDIENTE') return false;
          const monthMatch = c.periodo.match(/Mes (\d+)/);
          const monthNum = monthMatch ? parseInt(monthMatch[1]) : 0;
          // Only consider it pending if all previous months are confirmed
          for (let i = 1; i < monthNum; i++) {
            if (!confirmedMonths.has(i)) return false;
          }
          return true;
        });

        if (nextPendingContribution) {
          const groupInfo = userGroups.find(ug => ug.groupId === nextPendingContribution.groupId);
          return {
            amount: nextPendingContribution.monto,
            currency: nextPendingContribution.moneda,
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
