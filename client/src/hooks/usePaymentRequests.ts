import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import type { PaymentRequest } from '../../../shared/types';

export const usePaymentRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPendingCount = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAllPaymentRequests();
      if (response.success) {
        const pendingRequests = response.data.requests.filter((r: PaymentRequest) => r.estado === 'PENDIENTE');
        setPendingCount(pendingRequests.length);
      }
    } catch (error) {
      console.error('Error fetching payment requests count:', error);
      setPendingCount(0); // Reset on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();

    // Refresh count every 15 seconds for better responsiveness
    const interval = setInterval(fetchPendingCount, 15000);

    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  // Force refresh when called externally
  const refresh = useCallback(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  return {
    pendingCount,
    loading,
    refetch: refresh
  };
};
