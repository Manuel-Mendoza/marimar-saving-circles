import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/atoms';
import { UserSearchFilter } from '@/components/molecules';
import { UserStatsGrid, UsersTable, UserActionDialogs } from '@/components/organisms';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  fechaRegistro: string;
  aprobadoPor?: number;
  fechaAprobacion?: string;
}

interface UsersManagementProps {
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ user }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'suspend' | 'reactivate' | 'delete'>('approve');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  // Load users data
  const loadUsers = async () => {
    try {
      setLoading(true);
      const [allUsersResponse, pendingUsersResponse] = await Promise.all([
        api.getAllUsers(),
        api.getPendingUsers(),
      ]);

      if (allUsersResponse.success) {
        setUsers(allUsersResponse.data.users);
      }

      if (pendingUsersResponse.success) {
        setPendingUsers(pendingUsersResponse.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search term and status filters
  const filterUsers = (userList: User[]) => {
    let filtered = userList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        user =>
          user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.cedula.includes(searchTerm) ||
          user.correoElectronico.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilters.size > 0) {
      filtered = filtered.filter(user => statusFilters.has(user.estado));
    }

    return filtered;
  };

  // Handle status filter toggle
  const handleStatusFilterToggle = (status: string, checked: boolean) => {
    const newFilters = new Set(statusFilters);
    if (checked) {
      newFilters.add(status);
    } else {
      newFilters.delete(status);
    }
    setStatusFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilters(new Set());
    setSearchTerm('');
  };

  // Handle user actions
  const handleUserAction = async (user: User, action: string) => {
    if (action === 'delete') {
      setSelectedUser(user);
      setActionType('delete');
      setShowDeleteDialog(true);
    } else {
      setSelectedUser(user);
      setActionType(action as any);
      setShowActionDialog(true);
    }
  };

  // Confirm user action
  const confirmUserAction = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      let response;

      switch (actionType) {
        case 'approve':
          response = await api.approveUser(selectedUser.id);
          break;
        case 'reject':
          response = await api.rejectUser(selectedUser.id, reason);
          break;
        case 'suspend':
          response = await api.suspendUser(selectedUser.id);
          break;
        case 'reactivate':
          response = await api.reactivateUser(selectedUser.id);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        toast({
          title: 'Éxito',
          description: `Usuario ${getActionText(actionType)} exitosamente`,
        });
        await loadUsers(); // Reload users
        setShowActionDialog(false);
        setReason('');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del usuario',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Confirm user deletion
  const confirmUserDelete = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      const response = await api.deleteUser(selectedUser.id, reason);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Usuario eliminado exitosamente',
        });
        await loadUsers(); // Reload users
        setShowDeleteDialog(false);
        setReason('');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get action text
  const getActionText = (action: string) => {
    switch (action) {
      case 'approve':
        return 'aprobado';
      case 'reject':
        return 'rechazado';
      case 'suspend':
        return 'suspendido';
      case 'reactivate':
        return 'reactivado';
      case 'delete':
        return 'eliminado';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando usuarios..." />
        </div>
      </div>
    );
  }

  const filteredUsers = filterUsers(users);
  const filteredPendingUsers = filterUsers(pendingUsers);

  const stats = {
    totalUsers: users.length,
    pendingUsers: pendingUsers.length,
    approvedUsers: users.filter(u => u.estado === 'APROBADO' || u.estado === 'REACTIVADO').length,
    suspendedUsers: users.filter(u => u.estado === 'SUSPENDIDO').length,
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra todos los usuarios del sistema
        </p>
      </div>

      {/* Search and Filter */}
      <UserSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilters={statusFilters}
        onStatusFilterChange={handleStatusFilterToggle}
        onClearFilters={clearFilters}
      />

      {/* Stats Grid */}
      <UserStatsGrid {...stats} />

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos los Usuarios ({filteredUsers.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pendientes de Aprobación ({filteredPendingUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UsersTable
            users={filteredUsers}
            title="Todos los Usuarios"
            actionLoadingId={actionLoading}
            onUserAction={handleUserAction}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <UsersTable
            users={filteredPendingUsers}
            title="Usuarios Pendientes de Aprobación"
            actionLoadingId={actionLoading}
            onUserAction={handleUserAction}
          />
        </TabsContent>
      </Tabs>

      {/* Action Dialogs */}
      <UserActionDialogs
        selectedUser={selectedUser}
        showActionDialog={showActionDialog}
        showDeleteDialog={showDeleteDialog}
        actionType={actionType}
        reason={reason}
        isLoading={actionLoading !== null}
        onActionDialogChange={setShowActionDialog}
        onDeleteDialogChange={setShowDeleteDialog}
        onReasonChange={setReason}
        onConfirmAction={confirmUserAction}
        onConfirmDelete={confirmUserDelete}
      />
    </div>
  );
};
