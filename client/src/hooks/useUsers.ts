import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: "USUARIO" | "ADMINISTRADOR";
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO" | "SUSPENDIDO" | "REACTIVADO";
  fechaRegistro: Date;
}

export const useUsers = () => {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [processingUser, setProcessingUser] = useState<number | null>(null);

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await apiClient.getAllUsers();
      if (response.success && response.data) {
        const usersWithDates = response.data.users.map((user: any) => ({
          ...user,
          fechaRegistro: new Date(user.fechaRegistro),
          ultimoAcceso: user.ultimoAcceso ? new Date(user.ultimoAcceso) : null,
          fechaAprobacion: user.fechaAprobacion
            ? new Date(user.fechaAprobacion)
            : null,
        }));
        console.log('🔄 useUsers - fetchAllUsers setting users:', usersWithDates.length, 'users');

        setAllUsers(usersWithDates);
      } else {
        setAllUsers([]);
      }
    } catch (error) {
      console.error("🔄 useUsers - Error cargando todos los usuarios:", error);
      setAllUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleSuspendUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId);
    const userData = allUsers.find(u => u.id === userId);



    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.suspendUser(userId);
      if (response.success) {
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "SUSPENDIDO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario suspendido",
          description: "El usuario ha sido suspendido y no podrá acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("useUsers - Error suspendiendo usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya no existe en el sistema. Los datos se actualizarán automáticamente."
        : error.message || "No se pudo suspender al usuario. Inténtalo de nuevo.";

      console.warn("🔄 useUsers - Desincronización detectada - forzando recarga completa de datos");
      fetchAllUsers();

      toast({
        title: "Datos desactualizados",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReactivateUser = async (userId: number) => {
    const userExists = allUsers.some(u => u.id === userId);

    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.reactivateUser(userId);
      if (response.success) {
        setAllUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, estado: "REACTIVADO", fechaAprobacion: new Date() }
              : user
          )
        );
        toast({
          title: "Usuario reactivado",
          description: "El usuario ha sido reactivado y ahora puede acceder al sistema.",
        });
      }
    } catch (error: any) {
      console.error("useUsers - Error reactivando usuario:", error);
      const errorMessage = error.message?.includes("ya procesado") || error.message?.includes("no encontrado")
        ? "Este usuario ya ha sido procesado anteriormente o no existe."
        : error.message || "No se pudo reactivar al usuario. Inténtalo de nuevo.";

      fetchAllUsers();

      toast({
        title: "Error al reactivar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  const handleDeleteUser = async (userId: number, reason: string) => {
    const userExists = allUsers.some(u => u.id === userId);

    if (!userExists) {
      toast({
        title: "Usuario no encontrado",
        description: "Este usuario ya no está disponible para procesamiento.",
        variant: "destructive",
      });
      fetchAllUsers();
      return;
    }

    setProcessingUser(userId);
    try {
      const response = await apiClient.deleteUser(userId, reason);
      if (response.success) {
        setAllUsers((prev) => prev.filter((user) => user.id !== userId));
        toast({
          title: "Usuario eliminado",
          description: "El usuario ha sido eliminado permanentemente del sistema.",
        });
      }
    } catch (error: any) {
      console.error("useUsers - Error eliminando usuario:", error);
      const errorMessage = error.message?.includes("no encontrado")
        ? "Este usuario ya no existe."
        : error.message || "No se pudo eliminar al usuario. Inténtalo de nuevo.";

      fetchAllUsers();

      toast({
        title: "Error al eliminar usuario",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingUser(null);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return {
    allUsers,
    usersLoading,
    processingUser,
    handleSuspendUser,
    handleReactivateUser,
    handleDeleteUser,
    refetch: fetchAllUsers,
  };
};
