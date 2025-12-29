import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/components/atoms';
import { GroupSearchFilter } from '@/components/molecules/groups';
import {
  GroupStatsGrid,
  GroupsTable,
  GroupActionDialogs,
  GroupDetailModal,
  DrawAnimation,
} from '@/components/organisms/groups';
import { DrawCompletionModal } from '@/components/organisms';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Grupo, GroupAdminDetails } from '@/lib/types';

/**
 * Page: Groups Management
 * Main page for admin group management with full CRUD operations
 */
interface GroupsManagementProps {
  /** Current user (admin) */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
}

export const GroupsManagement: React.FC<GroupsManagementProps> = ({ user }) => {
  // State management
  const [groups, setGroups] = useState<Grupo[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Grupo | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [groupDetails, setGroupDetails] = useState<GroupAdminDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Draw animation state
  const [showDrawAnimation, setShowDrawAnimation] = useState(false);
  const [currentDrawGroup, setCurrentDrawGroup] = useState<Grupo | null>(null);
  const [drawPositions, setDrawPositions] = useState<
    { position: number; userId: number; name: string }[]
  >([]);

  // Draw completion modal state
  const [showDrawCompletionModal, setShowDrawCompletionModal] = useState(false);

  const { toast } = useToast();

  // Load groups data
  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getGroups();

      if (response.success) {
        setGroups(response.data.groups);
        setFilteredGroups(response.data.groups);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los grupos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Filter groups based on search term and status filters
  useEffect(() => {
    let filtered = groups;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(group =>
        group.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilters.size > 0) {
      filtered = filtered.filter(group => statusFilters.has(group.estado));
    }

    setFilteredGroups(filtered);
  }, [groups, searchTerm, statusFilters]);

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

  // Handle group actions
  const handleViewGroup = async (group: Grupo) => {
    try {
      setLoadingDetails(true);
      setShowDetailModal(true);
      setGroupDetails(null); // Reset previous data

      const response = await api.getGroupAdminDetails(group.id);

      if (response.success) {
        setGroupDetails(response.data);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los detalles del grupo',
          variant: 'destructive',
        });
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error loading group details:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
      setShowDetailModal(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleEditGroup = (group: Grupo) => {
    setSelectedGroup(group);
    setShowEditDialog(true);
  };

  const handleStartDraw = async (group: Grupo) => {
    try {
      setActionLoading(group.id);
      const response = await api.startDraw(group.id);

      if (response.success) {
        // Set up the animation with the final positions
        setCurrentDrawGroup(group);
        setDrawPositions(response.data.finalPositions);
        setShowDrawAnimation(true);

        // Don't reload groups yet, wait for animation to complete
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo iniciar el sorteo',
          variant: 'destructive',
        });
        setActionLoading(null);
      }
    } catch (error) {
      console.error('Error starting draw:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
      setActionLoading(null);
    }
  };

  const handleAdvanceMonth = async (group: Grupo) => {
    console.log('🚀 Iniciando handleAdvanceMonth para grupo:', group.id);
    try {
      setActionLoading(group.id);
      console.log('📡 Llamando API advanceGroupMonth...');
      const response = await api.advanceGroupMonth(group.id);
      console.log('📡 Respuesta API:', response);

      if (response.success) {
        console.log('✅ Acción exitosa, mostrando toast...');
        toast({
          title: 'Éxito',
          description: response.data.completed
            ? 'Grupo completado exitosamente'
            : `Mes avanzado exitosamente. Turno ${response.data.newTurn} activado.`,
        });

        console.log('🔄 Refrescando datos...');

        // Refresh groups list more efficiently
        const refreshedGroupsResponse = await api.getGroups();
        if (refreshedGroupsResponse.success) {
          setGroups(refreshedGroupsResponse.data.groups);
          setFilteredGroups(refreshedGroupsResponse.data.groups);
          console.log('✅ Lista de grupos refrescada');
        }

        // Refresh modal details if it's open for this group
        if (groupDetails && groupDetails.group.id === group.id) {
          console.log('🔄 Refrescando detalles del grupo...');
          const updatedDetails = await api.getGroupAdminDetails(group.id);
          if (updatedDetails.success) {
            console.log('✅ Detalles del grupo refrescados');
            setGroupDetails(updatedDetails.data);
          } else {
            console.error('❌ Error refrescando detalles:', updatedDetails);
          }
        }
      } else {
        console.log('❌ Respuesta no exitosa:', response);
        toast({
          title: 'Error',
          description: 'No se pudo avanzar el mes del grupo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error en handleAdvanceMonth:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      console.log('🔚 Reseteando actionLoading a null');
      setActionLoading(null);
    }
  };

  const handleDeleteGroup = (group: Grupo) => {
    setSelectedGroup(group);
    setShowDeleteDialog(true);
  };

  // Handle create group
  const handleCreateGroup = async (groupData: { nombre: string; duracionMeses: number }) => {
    try {
      setActionLoading(-1); // Special loading state for create
      const response = await api.createGroup(groupData);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Grupo creado exitosamente',
        });
        await loadGroups(); // Reload groups
        setShowCreateDialog(false);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo crear el grupo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle update group
  const handleUpdateGroup = async (
    groupId: number,
    groupData: { nombre?: string; duracionMeses?: number; estado?: string }
  ) => {
    try {
      setActionLoading(groupId);
      const response = await api.updateGroup(groupId, groupData);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Grupo actualizado exitosamente',
        });
        await loadGroups(); // Reload groups
        setShowEditDialog(false);
        setSelectedGroup(null);
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo actualizar el grupo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating group:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete group
  const handleConfirmDelete = async (groupId: number, reason?: string) => {
    try {
      setActionLoading(groupId);
      const response = await api.deleteGroup(groupId);

      if (response.success) {
        toast({
          title: 'Éxito',
          description: 'Grupo eliminado exitosamente',
        });
        await loadGroups(); // Reload groups
        setShowDeleteDialog(false);
        setSelectedGroup(null);
        setDeleteReason('');
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el grupo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast({
        title: 'Error',
        description: 'Error interno del servidor',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle draw animation events
  const handleDrawAnimationClose = () => {
    setShowDrawAnimation(false);
    setCurrentDrawGroup(null);
    setDrawPositions([]);
    setActionLoading(null);
  };

  const handleDrawAnimationComplete = async () => {
    // Animation completed, but don't close automatically - let user close manually
    // Just reload groups data in background
    await loadGroups();
  };

  const handleDrawCompleted = () => {
    // Show completion modal when draw animation finishes
    setShowDrawCompletionModal(true);
  };

  // Calculate statistics
  const stats = {
    totalGroups: groups.length,
    incompleteGroups: groups.filter(g => g.estado === 'SIN_COMPLETAR').length,
    fullGroups: groups.filter(g => g.estado === 'LLENO').length,
    activeGroups: groups.filter(g => g.estado === 'EN_MARCHA').length,
    completedGroups: groups.filter(g => g.estado === 'COMPLETADO').length,
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Cargando grupos..." />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Grupos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administra todos los grupos de ahorro del sistema
        </p>
      </div>

      {/* Search and Filter */}
      <GroupSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilters={statusFilters}
        onStatusFilterChange={handleStatusFilterToggle}
        onClearFilters={clearFilters}
      />

      {/* Stats Grid */}
      <GroupStatsGrid stats={stats} />

      {/* Groups Table */}
      <GroupsTable
        groups={filteredGroups}
        title="Todos los Grupos"
        actionLoadingId={actionLoading}
        onViewGroup={handleViewGroup}
        onEditGroup={handleEditGroup}
        onStartDraw={handleStartDraw}
        onDeleteGroup={handleDeleteGroup}
      />

      {/* Action Dialogs */}
      <GroupActionDialogs
        showCreateDialog={showCreateDialog}
        showEditDialog={showEditDialog}
        showDeleteDialog={showDeleteDialog}
        selectedGroup={selectedGroup}
        isLoading={actionLoading !== null}
        deleteReason={deleteReason}
        onCreateDialogChange={setShowCreateDialog}
        onEditDialogChange={setShowEditDialog}
        onDeleteDialogChange={setShowDeleteDialog}
        onCreateGroup={handleCreateGroup}
        onUpdateGroup={handleUpdateGroup}
        onDeleteGroup={handleConfirmDelete}
        onDeleteReasonChange={setDeleteReason}
      />

      {/* Group Detail Modal */}
      <GroupDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setGroupDetails(null);
          setLoadingDetails(false);
        }}
        groupDetails={groupDetails}
        isLoading={loadingDetails}
        onAdvanceMonth={handleAdvanceMonth}
        actionLoading={actionLoading === groupDetails?.group.id}
      />

      {/* Draw Animation */}
      {showDrawAnimation && currentDrawGroup && (
        <DrawAnimation
          isActive={showDrawAnimation}
          groupId={currentDrawGroup.id}
          finalPositions={drawPositions}
          onClose={handleDrawAnimationClose}
          onComplete={handleDrawAnimationComplete}
          onDrawComplete={handleDrawCompleted}
          useInternalWebSocket={false}
        />
      )}

      {/* Draw Completion Modal */}
      <DrawCompletionModal
        isOpen={showDrawCompletionModal}
        onClose={() => setShowDrawCompletionModal(false)}
        groupId={currentDrawGroup?.id || 0}
      />
    </div>
  );
};
