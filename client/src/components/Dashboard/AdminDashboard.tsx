
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppState } from '@/contexts/AppStateContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Package, CheckCircle, Clock, UserCheck, UserX, AlertCircle, Eye } from 'lucide-react';

interface PendingUser {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  imagenCedula?: string;
  fechaRegistro: Date;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { grupos, productos } = useAppState();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingUser, setProcessingUser] = useState<number | null>(null);

  // Cargar usuarios pendientes
  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      // TODO: Implementar llamada a API real
      // const response = await apiClient.getPendingUsers();
      // setPendingUsers(response.data.users);

      // Mock data por ahora
      setPendingUsers([
        {
          id: 2,
          nombre: 'María',
          apellido: 'González',
          cedula: '12345678',
          telefono: '+58424123456',
          correoElectronico: 'maria@example.com',
          tipo: 'USUARIO',
          estado: 'PENDIENTE',
          fechaRegistro: new Date('2025-12-20')
        },
        {
          id: 3,
          nombre: 'Carlos',
          apellido: 'Rodríguez',
          cedula: '87654321',
          telefono: '+58424567890',
          correoElectronico: 'carlos@example.com',
          tipo: 'USUARIO',
          estado: 'PENDIENTE',
          fechaRegistro: new Date('2025-12-21')
        }
      ]);
    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: number) => {
    setProcessingUser(userId);
    try {
      // TODO: Implementar llamada a API real
      // await apiClient.approveUser(userId, 'approve');

      // Mock update
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      console.log(`Usuario ${userId} aprobado`);
    } catch (error) {
      console.error('Error aprobando usuario:', error);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRejectUser = async (userId: number) => {
    setProcessingUser(userId);
    try {
      // TODO: Implementar llamada a API real
      // await apiClient.approveUser(userId, 'reject');

      // Mock update
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      console.log(`Usuario ${userId} rechazado`);
    } catch (error) {
      console.error('Error rechazando usuario:', error);
    } finally {
      setProcessingUser(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Panel de Administración
          </h1>
          <p className="text-gray-600 mt-1">
            Gestión de usuarios y sistema de ahorro colaborativo
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Esperando aprobación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupos Activos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{grupos.length}</div>
            <p className="text-xs text-muted-foreground">
              Grupos de ahorro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productos.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregas Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <p className="text-xs text-muted-foreground">
              Productos entregados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios Pendientes de Aprobación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Usuarios Pendientes de Aprobación
          </CardTitle>
          <CardDescription>
            Revisar y aprobar solicitudes de registro de nuevos usuarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando usuarios pendientes...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No hay usuarios pendientes de aprobación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg bg-orange-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{pendingUser.nombre} {pendingUser.apellido}</h3>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Cédula:</strong> {pendingUser.cedula}</p>
                        <p><strong>Teléfono:</strong> {pendingUser.telefono}</p>
                      </div>
                      <div>
                        <p><strong>Email:</strong> {pendingUser.correoElectronico}</p>
                        <p><strong>Registro:</strong> {pendingUser.fechaRegistro.toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingUser.imagenCedula && (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Cédula
                      </Button>
                    )}
                    <Button
                      onClick={() => handleApproveUser(pendingUser.id)}
                      disabled={processingUser === pendingUser.id}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      {processingUser === pendingUser.id ? 'Procesando...' : 'Aprobar'}
                    </Button>
                    <Button
                      onClick={() => handleRejectUser(pendingUser.id)}
                      disabled={processingUser === pendingUser.id}
                      variant="destructive"
                      size="sm"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grupos Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Grupos Activos</CardTitle>
          <CardDescription>
            Grupos de ahorro colaborativo en funcionamiento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grupos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No hay grupos activos
            </p>
          ) : (
            <div className="space-y-4">
              {grupos.map((grupo) => (
                <div key={grupo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{grupo.nombre}</h3>
                    <p className="text-sm text-gray-600">
                      Duración: {grupo.duracionMeses} meses
                    </p>
                    <p className="text-sm text-gray-600">
                      Mes actual: {grupo.turnoActual}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={grupo.estado === 'EN_MARCHA' ? 'default' : 'secondary'}>
                      {grupo.estado.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
