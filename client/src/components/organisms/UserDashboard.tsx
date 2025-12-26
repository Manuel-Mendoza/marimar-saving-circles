import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationSidebar } from '@/components/molecules';
import { UserCard } from '@/components/molecules';
import { CurrencyDisplay, StatusBadge, IconButton } from '@/components/atoms';
import {
  Users,
  Package,
  CreditCard,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  Plus,
  Eye,
  User
} from 'lucide-react';

interface UserDashboardStats {
  activeGroups: number;
  completedGroups: number;
  pendingPayments: number;
  totalInvested: number;
  nextPayment?: {
    amount: number;
    currency: 'USD' | 'VES';
    dueDate: Date;
    groupName: string;
  };
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'payment_made' | 'group_joined' | 'product_selected';
  message: string;
  timestamp: Date;
  groupId?: number;
}

interface UserDashboardProps {
  /** Usuario actual */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO';
    imagenCedula?: string;
    estado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO';
  };
  /** Estadísticas del usuario */
  stats?: UserDashboardStats;
  /** Función para navegar */
  onNavigate?: (section: string) => void;
  /** Función para logout */
  onLogout?: () => void;
  /** Función para unirse a grupo */
  onJoinGroup?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Organism: Dashboard del usuario regular
 * Vista principal del usuario con sus grupos, pagos y actividad
 */
const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  stats,
  onNavigate,
  onLogout,
  onJoinGroup,
  isLoading = false
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarNavigate = (itemId: string) => {
    onNavigate?.(itemId);
  };

  const defaultStats: UserDashboardStats = {
    activeGroups: 0,
    completedGroups: 0,
    pendingPayments: 0,
    totalInvested: 0,
    recentActivity: []
  };

  const currentStats = stats || defaultStats;

  const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aún no tienes actividad
            </p>
            <Button onClick={onJoinGroup} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Unirte a un grupo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  activity.type === 'payment_made' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                  activity.type === 'group_joined' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                }`}>
                  {activity.type === 'payment_made' && <CheckCircle className="h-4 w-4" />}
                  {activity.type === 'group_joined' && <Users className="h-4 w-4" />}
                  {activity.type === 'product_selected' && <Package className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp.toLocaleString('es-ES')}
                  </p>
                </div>
                {activity.groupId && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate?.(`group-${activity.groupId}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        <NavigationSidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onLogout={onLogout}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <NavigationSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleSidebarNavigate}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Mi Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bienvenido, {user.nombre}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusBadge status={user.estado} />
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('es-ES')}
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="space-y-6">
            {/* Welcome Section */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      ¡Hola {user.nombre}! 👋
                    </h2>
                    <p className="text-blue-100">
                      {currentStats.activeGroups === 0
                        ? '¿Listo para empezar a ahorrar? Únete a tu primer grupo.'
                        : `Tienes ${currentStats.activeGroups} grupo${currentStats.activeGroups !== 1 ? 's' : ''} activo${currentStats.activeGroups !== 1 ? 's' : ''}.`
                      }
                    </p>
                  </div>
                  {currentStats.activeGroups === 0 && (
                    <Button
                      onClick={onJoinGroup}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Unirme a un grupo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grupos Activos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentStats.activeGroups}</p>
                    </div>
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Grupos Completados</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentStats.completedGroups}</p>
                    </div>
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagos Pendientes</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentStats.pendingPayments}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      currentStats.pendingPayments > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invertido</p>
                      <CurrencyDisplay
                        amount={currentStats.totalInvested}
                        currency="USD"
                        size="lg"
                        className="text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Payment Alert */}
            {currentStats.nextPayment && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Próximo pago pendiente
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {currentStats.nextPayment.groupName} - Vence el {currentStats.nextPayment.dueDate.toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CurrencyDisplay
                        amount={currentStats.nextPayment.amount}
                        currency={currentStats.nextPayment.currency}
                        size="md"
                      />
                      <Button
                        onClick={() => onNavigate?.('payments')}
                        size="sm"
                      >
                        Pagar ahora
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityFeed activities={currentStats.recentActivity} />
              </div>

              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={onJoinGroup}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Unirme a un grupo
                    </Button>
                    <Button
                      onClick={() => onNavigate?.('products')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Ver productos
                    </Button>
                    <Button
                      onClick={() => onNavigate?.('payments')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Mis pagos
                    </Button>
                  </CardContent>
                </Card>

                {/* User Profile Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Mi Perfil</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UserCard
                      {...user}
                      variant="compact"
                      showActions={false}
                    />
                    <Button
                      onClick={() => onNavigate?.('profile')}
                      className="w-full mt-3"
                      variant="outline"
                      size="sm"
                    >
                      Ver perfil completo
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
