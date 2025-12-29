import React, { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '@/components/atoms';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, CheckCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGroupWebSocket } from '@/hooks/useGroupWebSocket';
import api from '@/lib/api';
import { Grupo, UserGroup } from '@/lib/types';
import { UserGroupDetailsModal } from './UserGroupDetailsModal';
import { GroupProductSelectionModal } from './GroupProductSelectionModal';
import { DrawAnimation } from './groups/DrawAnimation';
import { DrawCompletionModal } from './DrawCompletionModal';

/**
 * Page: User Groups Management
 * Shows user's groups and available groups to join
 */
interface UserGroupsManagementProps {
  /** Current user */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO';
    imagenCedula?: string;
  };
}

export const UserGroupsManagement: React.FC<UserGroupsManagementProps> = ({ user }) => {
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [availableGroups, setAvailableGroups] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserGroup, setSelectedUserGroup] = useState<UserGroup | null>(null);
  const [showProductSelectionModal, setShowProductSelectionModal] = useState(false);
  const [selectedGroupForJoin, setSelectedGroupForJoin] = useState<Grupo | null>(null);

  // WebSocket for real-time draw notifications
  const { activeDraw, clearActiveDraw } = useGroupWebSocket(myGroups);

  // Draw completion modal state
  const [showDrawCompletionModal, setShowDrawCompletionModal] = useState(false);
  const [currentDrawGroupId, setCurrentDrawGroupId] = useState<number>(0);

  const { toast } = useToast();

  // Load user's groups and available groups
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load user's groups
      const userGroupsResponse = await api.getMyGroups();
      if (userGroupsResponse.success) {
        setMyGroups(userGroupsResponse.data.userGroups);
      }

      // Load available groups (SIN_COMPLETAR and LLENO states, excluding user's current groups)
      const allGroupsResponse = await api.getGroups();
      if (allGroupsResponse.success) {
        // First get user's current groups to exclude them
        const userGroupsResponse = await api.getMyGroups();
        const userGroupIds = userGroupsResponse.success
          ? userGroupsResponse.data.userGroups.map((ug: UserGroup) => ug.groupId)
          : [];

        const available = allGroupsResponse.data.groups.filter(
          (group: Grupo) =>
            (group.estado === 'SIN_COMPLETAR' || group.estado === 'LLENO') &&
            !userGroupIds.includes(group.id)
        );
        setAvailableGroups(available);
      }
    } catch (error) {
      console.error('Error loading groups data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los grupos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle showing product selection modal for joining a group
  const handleJoinGroup = (group: Grupo) => {
    setSelectedGroupForJoin(group);
    setShowProductSelectionModal(true);
  };

  // Handle successful joining of group
  const handleGroupJoined = () => {
    // Reload data to show updated state
    loadData();
  };

  // Handle viewing group details
  const handleViewGroupDetails = (userGroup: UserGroup) => {
    setSelectedUserGroup(userGroup);
    setShowDetailsModal(true);
  };

  // Handle draw completion
  const handleDrawCompleted = () => {
    // Show completion modal when draw animation finishes
    if (activeDraw) {
      setCurrentDrawGroupId(activeDraw.groupId);
      setShowDrawCompletionModal(true);
    }
  };

  // Get status badge for groups
  const getStatusBadge = (estado: string) => {
    const statusConfig = {
      SIN_COMPLETAR: { label: 'Formándose', variant: 'secondary' as const, icon: Clock },
      LLENO: { label: 'Completo', variant: 'default' as const, icon: Users },
      EN_MARCHA: { label: 'Activo', variant: 'default' as const, icon: CheckCircle },
      COMPLETADO: { label: 'Finalizado', variant: 'outline' as const, icon: CheckCircle },
    };

    const config =
      statusConfig[estado as keyof typeof statusConfig] || statusConfig['SIN_COMPLETAR'];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Mis Grupos</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tus grupos de ahorro y descubre nuevos grupos disponibles
        </p>
      </div>

      <Tabs defaultValue="my-groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups">Mis Grupos</TabsTrigger>
          <TabsTrigger value="available-groups">Grupos Por Empezar</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myGroups.length > 0 ? (
              myGroups.map(userGroup => (
                <Card
                  key={userGroup.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewGroupDetails(userGroup)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{userGroup.group.nombre}</CardTitle>
                      {getStatusBadge(userGroup.group.estado)}
                    </div>
                    <CardDescription>
                      Grupo de {userGroup.group.duracionMeses} meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tu posición:</span>
                        <span className="font-medium">{userGroup.posicion || 'Pendiente'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Producto:</span>
                        <span className="font-medium">{userGroup.productoSeleccionado}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Moneda:</span>
                        <span className="font-medium">{userGroup.monedaPago}</span>
                      </div>
                      {userGroup.group.fechaInicio && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Fecha inicio:</span>
                          <span className="font-medium">
                            {new Date(userGroup.group.fechaInicio).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tienes grupos activos
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Únete a un grupo para comenzar a ahorrar
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="available-groups" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableGroups.length > 0 ? (
              availableGroups.map(group => (
                <Card key={group.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{group.nombre}</CardTitle>
                      {getStatusBadge(group.estado)}
                    </div>
                    <CardDescription>Grupo de {group.duracionMeses} meses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Participantes:</span>
                        <span className="font-medium">
                          {group.participantes || 0}/{group.duracionMeses}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                        <span className="font-medium">
                          {group.estado === 'SIN_COMPLETAR' ? 'Formándose' : 'Completo'}
                        </span>
                      </div>
                      <Button onClick={() => handleJoinGroup(group)} className="w-full" size="sm">
                        Unirse al Grupo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay grupos disponibles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Los nuevos grupos se crean periódicamente. Revisa más tarde.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Group Details Modal */}
      <UserGroupDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUserGroup(null);
        }}
        userGroup={selectedUserGroup}
        user={user}
      />

      {/* Product Selection Modal */}
      <GroupProductSelectionModal
        isOpen={showProductSelectionModal}
        onClose={() => {
          setShowProductSelectionModal(false);
          setSelectedGroupForJoin(null);
        }}
        group={selectedGroupForJoin}
        user={user}
        onJoined={handleGroupJoined}
      />

      {/* Draw Animation for Real-time Lottery */}
      {activeDraw && (
        <DrawAnimation
          isActive={!!activeDraw}
          groupId={activeDraw.groupId}
          finalPositions={activeDraw.animationSequence || activeDraw.finalPositions}
          onClose={clearActiveDraw}
          onComplete={() => {
            // Animation completed, but don't close automatically - let user close manually
            // Just reload data in background
            loadData();
          }}
          onDrawComplete={handleDrawCompleted}
          useInternalWebSocket={false}
        />
      )}

      {/* Draw Completion Modal */}
      <DrawCompletionModal
        isOpen={showDrawCompletionModal}
        onClose={() => setShowDrawCompletionModal(false)}
        groupId={currentDrawGroupId}
      />
    </div>
  );
};
