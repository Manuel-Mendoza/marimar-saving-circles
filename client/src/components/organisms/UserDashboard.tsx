import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationSidebar } from '@/components/molecules';
import { UserCard } from '@/components/molecules';
import { CurrencyDisplay } from '@/components/atoms';
import { useUserDashboard } from '@/hooks/useUserDashboard';
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
  User,
} from 'lucide-react';

interface UserDashboardStats {
  activeGroups: number;
  completedGroups: number;
  pendingPayments: number;
  productsAcquired: number;
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
  /** Mostrar sidebar */
  showSidebar?: boolean;
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
  isLoading: externalLoading = false,
  showSidebar = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Use real dashboard data hook
  const { data: dashboardData, loading: dashboardLoading, error } = useUserDashboard(user.id);

  const handleSidebarNavigate = (itemId: string) => {
    onNavigate?.(itemId);
  };

  // Helper function to ensure stats object has all required properties
  const ensureStatsComplete = (stats?: Partial<UserDashboardStats>): UserDashboardStats => ({
    activeGroups: stats?.activeGroups ?? 0,
    completedGroups: stats?.completedGroups ?? 0,
    pendingPayments: stats?.pendingPayments ?? 0,
    productsAcquired: stats?.productsAcquired ?? 0,
    recentActivity: stats?.recentActivity ?? [],
    nextPayment: stats?.nextPayment,
  });

  // Use real data from hook, fallback to props or defaults
  const currentStats = ensureStatsComplete(dashboardData?.stats ?? stats);

  // Rating system: 10/10 = green, 7/10 = yellow, 4/10 = red
  const getRatingColor = (rating: number) => {
    if (rating >= 10) return { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-700' };
    if (rating >= 7) return { bg: 'bg-yellow-100', icon: 'text-yellow-600', text: 'text-yellow-700' };
    if (rating >= 4) return { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-700' };
    return { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-700' }; // Default to red for very low ratings
  };

  const ratingValue = 10; // TODO: Replace with actual rating from backend
  const ratingColors = getRatingColor(ratingValue);

  const isLoading = externalLoading || dashboardLoading;

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
            <p className="text-gray-600 dark:text-gray-400 mb-4">Aún no tienes actividad</p>
            <Button onClick={onJoinGroup} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Unirte a un grupo
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === 'payment_made'
                      ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                      : activity.type === 'group_joined'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                  }`}
                >
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

  const DashboardContent = () => (
    <div className="space-y-4">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">¡Hola {user.nombre}! 👋</h2>
              <p className="text-blue-100">
                {currentStats.activeGroups === 0
                  ? '¿Listo para empezar a ahorrar? Únete a tu primer grupo.'
                  : `Tienes ${currentStats.activeGroups} grupo${currentStats.activeGroups !== 1 ? 's' : ''} activo${currentStats.activeGroups !== 1 ? 's' : ''}.`}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Grupos Activos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStats.activeGroups}
                </p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Puntuación
                </p>
                <p className={`text-2xl font-bold ${ratingColors.text}`}>
                  10/10
                </p>
              </div>
              <div className={`p-3 ${ratingColors.bg} ${ratingColors.icon} rounded-full`}>
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pagos Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStats.pendingPayments}
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${
                  currentStats.pendingPayments > 0
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                }`}
              >
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Productos Adquiridos
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {currentStats.productsAcquired}
                </p>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <ShoppingCart className="h-6 w-6" />
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
                    {currentStats.nextPayment.groupName} - Vence el{' '}
                    {currentStats.nextPayment.dueDate.toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CurrencyDisplay
                  amount={currentStats.nextPayment.amount}
                  currency={currentStats.nextPayment.currency}
                  size="md"
                />
                <Button onClick={() => onNavigate?.('payments')} size="sm">
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

        <div className="space-y-4">
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
              <UserCard {...user} correoElectronico="" variant="compact" showActions={false} />
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
  );

  if (isLoading) {
    if (showSidebar) {
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
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tu dashboard...</p>
          </div>
        </div>
      );
    }
  }

  if (showSidebar) {
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
          {/* Main Content */}
          <main className="flex-1 p-4">
            <DashboardContent />
          </main>
        </div>
      </div>
    );
  } else {
    return (
      <main className="flex-1 p-4">
        <DashboardContent />
      </main>
    );
  }
};

export default UserDashboard;
