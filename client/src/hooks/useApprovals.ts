import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { User } from '../../../shared/types';

export const useApprovals = () => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState<number | null>(null);

  const fetchPendingUsers = async () => {
    try {
      const response = await apiClient.getPendingUsers();
      if (response.success && response.data) {
        const usersWithDates = response.data.users.map((user: User) => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
        }));
        setPendingUsers(usersWithDates);
      }
    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    const userExists = pendingUsers.some(u => u.id === userId);
    if (!userExists) {
      toast({
        title: 'Usuario no encontrado',
        description: 'Este usuario ya no está disponible para procesamiento.',
        variant: 'destructive',
      });
      fetchPendingUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.approveUser(userId);
      if (response.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        toast({
          title: 'Usuario aprobado',
          description: 'El usuario ha sido aprobado exitosamente y ahora puede acceder al sistema.',
        });
      }
    } catch (error) {
      console.error('Error aprobando usuario:', error);
      const errorMessage =
        (error as Error).message?.includes('ya procesado') ||
        (error as Error).message?.includes('no encontrado')
          ? 'Este usuario ya ha sido procesado anteriormente o no existe.'
          : (error as Error).message || 'No se pudo aprobar al usuario. Inténtalo de nuevo.';

      fetchPendingUsers();

      toast({
        title: 'Error al aprobar usuario',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRejectUser = async (userId: number, reason: string) => {
    const userExists = pendingUsers.some(u => u.id === userId);
    if (!userExists) {
      toast({
        title: 'Usuario no encontrado',
        description: 'Este usuario ya no está disponible para procesamiento.',
        variant: 'destructive',
      });
      fetchPendingUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.rejectUser(userId, reason);
      if (response.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        toast({
          title: 'Usuario rechazado',
          description: 'El usuario ha sido rechazado y no podrá acceder al sistema.',
        });
      }
    } catch (error) {
      console.error('Error rechazando usuario:', error);
      const errorMessage =
        (error as Error).message?.includes('ya procesado') ||
        (error as Error).message?.includes('no encontrado')
          ? 'Este usuario ya ha sido procesado anteriormente o no existe.'
          : (error as Error).message || 'No se pudo rechazar al usuario. Inténtalo de nuevo.';

      fetchPendingUsers();

      toast({
        title: 'Error al rechazar usuario',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setProcessingUser(null);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  return {
    pendingUsers,
    loading,
    processingUser,
    handleApproveUser,
    handleRejectUser,
    refetch: fetchPendingUsers,
  };
};
