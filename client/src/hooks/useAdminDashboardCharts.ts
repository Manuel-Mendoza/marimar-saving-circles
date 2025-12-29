import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface RevenueData {
  mes: string;
  ingresos: number;
}

interface UserGroupData {
  mes: string;
  usuarios: number;
  grupos: number;
}

/**
 * Hook: Admin Dashboard Charts
 * Fetches historical chart data for admin dashboard
 */
export const useAdminDashboardCharts = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [userGroupData, setUserGroupData] = useState<UserGroupData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getAdminDashboardCharts();

      if (response.success && response.data) {
        setRevenueData(response.data.revenueData);
        setUserGroupData(response.data.userGroupData);
      } else {
        throw new Error('Failed to fetch dashboard charts data');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard charts:', err);
      setError('Error al cargar los datos de las gráficas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartsData();
  }, []);

  const refreshCharts = () => {
    fetchChartsData();
  };

  return {
    revenueData,
    userGroupData,
    loading,
    error,
    refreshCharts,
  };
};
