import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationSidebar } from '@/components/molecules';
import { CurrencyDisplay, StatusBadge, IconButton, LoadingSpinner } from '@/components/atoms';
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
  UserPlus,
  ShoppingCart,
  Activity,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingApprovals: number;
  totalProducts: number;
  activeProducts: number;
  totalGroups: number;
  activeGroups: number;
  totalPayments: number;
  pendingPayments: number;
  monthlyRevenue: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'payment_approved' | 'group_created' | 'product_added';
  message: string;
  timestamp: Date;
  user?: string;
}

interface AdminDashboardProps {
  /** Usuario administrador actual */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'ADMINISTRADOR';
    imagenCedula?: string;
  };
  /** Estadísticas del dashboard */
  stats?: DashboardStats;
  /** Función para navegar */
  onNavigate?: (section: string) => void;
  /** Función para logout */
  onLogout?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Organism: Dashboard completo del administrador
 * Combina NavigationSidebar, estadísticas, y gestión de secciones
 */
const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  stats,
  onNavigate,
  onLogout,
  isLoading = false,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSidebarNavigate = (itemId: string) => {
    setActiveTab(itemId);
    onNavigate?.(itemId);
  };

  const defaultStats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    pendingApprovals: 0,
    totalProducts: 0,
    activeProducts: 0,
    totalGroups: 0,
    activeGroups: 0,
    totalPayments: 0,
    pendingPayments: 0,
    monthlyRevenue: 0,
    recentActivity: [],
  };

  const currentStats = stats || defaultStats;

  const StatCard: React.FC<{
    title: string;
    value: string | number | React.ReactNode;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    trend?: { value: number; label: string };
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }> = ({ title, value, icon: Icon, trend, variant = 'default' }) => {
    const variantStyles = {
      default: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
      success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
      warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
      danger: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    };

    return (
      <Card className={variantStyles[variant]}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {trend.value > 0 ? '+' : ''}
                  {trend.value}% {trend.label}
                </p>
              )}
            </div>
            <div
              className={`p-3 rounded-full ${
                variant === 'success'
                  ? 'bg-green-100 text-green-600'
                  : variant === 'warning'
                    ? 'bg-yellow-100 text-yellow-600'
                    : variant === 'danger'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
              } dark:bg-opacity-20`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ActivityFeed: React.FC<{ activities: ActivityItem[] }> = ({ activities }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay actividad reciente
          </p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-full ${
                    activity.type === 'user_registered'
                      ? 'bg-blue-100 text-blue-600'
                      : activity.type === 'payment_approved'
                        ? 'bg-green-100 text-green-600'
                        : activity.type === 'group_created'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {activity.type === 'user_registered' && <UserPlus className="h-4 w-4" />}
                  {activity.type === 'payment_approved' && <CheckCircle className="h-4 w-4" />}
                  {activity.type === 'group_created' && <BarChart3 className="h-4 w-4" />}
                  {activity.type === 'product_added' && <Package className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.timestamp.toLocaleString('es-ES')}
                  </p>
                </div>
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
          <LoadingSpinner size="lg" text="Cargando dashboard..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <NavigationSidebar
        user={user}
        activeItem={activeTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleSidebarNavigate}
        onLogout={onLogout}
        notificationsCount={currentStats.pendingApprovals}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard Administrador
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bienvenido de vuelta, {user.nombre}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('es-ES')}
              </Badge>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Resumen</TabsTrigger>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
              <TabsTrigger value="payments">Pagos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Usuarios"
                  value={currentStats.totalUsers}
                  icon={Users}
                  trend={{ value: 12, label: 'vs mes anterior' }}
                />
                <StatCard
                  title="Productos Activos"
                  value={currentStats.activeProducts}
                  icon={Package}
                  trend={{ value: 8, label: 'vs mes anterior' }}
                />
                <StatCard
                  title="Grupos Activos"
                  value={currentStats.activeGroups}
                  icon={BarChart3}
                  trend={{ value: 15, label: 'vs mes anterior' }}
                />
                <StatCard
                  title="Ingresos Mensuales"
                  value={<CurrencyDisplay amount={currentStats.monthlyRevenue} currency="USD" />}
                  icon={DollarSign}
                  variant="success"
                  trend={{ value: 23, label: 'vs mes anterior' }}
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Aprobaciones Pendientes"
                  value={currentStats.pendingApprovals}
                  icon={AlertCircle}
                  variant={currentStats.pendingApprovals > 0 ? 'warning' : 'default'}
                />
                <StatCard
                  title="Pagos Pendientes"
                  value={currentStats.pendingPayments}
                  icon={Clock}
                  variant={currentStats.pendingPayments > 0 ? 'danger' : 'default'}
                />
                <StatCard
                  title="Total Pagos"
                  value={currentStats.totalPayments}
                  icon={CreditCard}
                  trend={{ value: 18, label: 'vs mes anterior' }}
                />
              </div>

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
                        onClick={() => handleSidebarNavigate('users')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Gestionar Usuarios
                      </Button>
                      <Button
                        onClick={() => handleSidebarNavigate('products')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Gestionar Productos
                      </Button>
                      <Button
                        onClick={() => handleSidebarNavigate('payments')}
                        className="w-full justify-start"
                        variant="outline"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Revisar Pagos
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Placeholder para otras tabs - serán implementadas en organisms específicos */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Componente UsersManagement será implementado aquí
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Componente ProductsManagement será implementado aquí
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="groups" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Grupos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Componente GroupsManagement será implementado aquí
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Pagos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">
                    Componente PaymentRequests será implementado aquí
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
