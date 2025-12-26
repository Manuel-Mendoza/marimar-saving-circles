import { useState, useEffect } from 'react';
import api from '@/lib/api';

export const usePaymentRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = async () => {
    try {
      const response = await api.getAllPaymentRequests();
      if (response.success) {
        const pendingRequests = response.data.requests.filter((r: any) => r.estado === 'PENDIENTE');
        setPendingCount(pendingRequests.length);
      }
    } catch (error) {
      console.error('Error fetching payment requests count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    pendingCount,
    loading,
    refetch: fetchPendingCount
  };
};
