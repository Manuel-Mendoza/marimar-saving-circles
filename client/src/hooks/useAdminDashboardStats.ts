import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalProducts: number;
  activeProducts: number;
  totalGroups: number;
  activeGroups: number;
  totalPayments: number;
  pendingPayments: number;
  monthlyRevenue: number;
}

interface StatsWithTrends extends AdminDashboardStats {
  trends: {
    totalUsers: { value: number; label: string };
    activeProducts: { value: number; label: string };
    activeGroups: { value: number; label: string };
  };
}

/**
 * Hook: Admin Dashboard Stats
 * Fetches all dashboard statistics in a single API call for better performance
 */
export const useAdminDashboardStats = () => {
  const [stats, setStats] = useState<StatsWithTrends>({
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalGroups: 0,
    activeGroups: 0,
    totalPayments: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    trends: {
      totalUsers: { value: 0, label: 'vs mes anterior' },
      activeProducts: { value: 0, label: 'vs mes anterior' },
      activeGroups: { value: 0, label: 'vs mes anterior' },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both stats and chart data in parallel
      const [statsResponse, chartsResponse] = await Promise.all([
        api.getAdminDashboardStats(),
        api.getAdminDashboardCharts(),
      ]);

      if (statsResponse.success && statsResponse.data?.stats) {
        const currentStats = statsResponse.data.stats;
        const trends = {
          totalUsers: { value: 0, label: 'vs mes anterior' },
          activeProducts: { value: 0, label: 'vs mes anterior' },
          activeGroups: { value: 0, label: 'vs mes anterior' },
        };

        // Calculate trends if chart data is available
        if (chartsResponse.success && chartsResponse.data) {
          const { userGroupData } = chartsResponse.data;

          if (userGroupData.length >= 2) {
            // Get last two months data
            const currentMonth = userGroupData[userGroupData.length - 1];
            const previousMonth = userGroupData[userGroupData.length - 2];

            // Calculate percentage change for users
            if (previousMonth.usuarios > 0) {
              const userChange =
                ((currentMonth.usuarios - previousMonth.usuarios) / previousMonth.usuarios) * 100;
              trends.totalUsers.value = Math.round(userChange);
            }

            // For products and groups, we use the same logic (assuming similar growth patterns)
            // In a real scenario, you'd have separate product/group historical data
            if (previousMonth.grupos > 0) {
              const groupChange =
                ((currentMonth.grupos - previousMonth.grupos) / previousMonth.grupos) * 100;
              trends.activeGroups.value = Math.round(groupChange);
            }

            // For products, use group data as approximation since we don't have separate product history
            trends.activeProducts.value = trends.activeGroups.value;
          }
        }

        setStats({
          ...currentStats,
          trends,
        });
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
      setError('Error al cargar las estadísticas del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};
