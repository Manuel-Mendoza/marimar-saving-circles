import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NavigationSidebar } from '@/components/molecules';
import { CurrencyDisplay, LoadingSpinner } from '@/components/atoms';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, Bar, BarChart, XAxis, YAxis } from 'recharts';
import {
  Users,
  Package,
  CreditCard,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  UserPlus,
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
  /** Mostrar sidebar */
  showSidebar?: boolean;
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
  showSidebar = true,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarNavigate = (itemId: string) => {
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
        <CardContent className="p-4">
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

  const DashboardContent = () => (
    <div className="space-y-4">
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

      {/* Activity Feed and Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityFeed activities={currentStats.recentActivity} />
        </div>
        <div className="space-y-4 row-span-2">
          {/* Quick Actions */}
          <Card className='h-full'>
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

        {/* Analytics Charts - 2 Charts */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Chart - Ingresos Mensuales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Ingresos Mensuales</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  ingresos: {
                    label: 'Ingresos',
                    color: 'hsl(var(--chart-1))',
                  },
                }}
                className="h-[240px]"
              >
                <LineChart
                  data={[
                    { mes: 'Ene', ingresos: 2500 },
                    { mes: 'Feb', ingresos: 2800 },
                    { mes: 'Mar', ingresos: 3200 },
                    { mes: 'Abr', ingresos: 2900 },
                    { mes: 'May', ingresos: 3500 },
                    { mes: 'Jun', ingresos: 3800 },
                    { mes: 'Jul', ingresos: 4200 },
                    { mes: 'Ago', ingresos: 3900 },
                    { mes: 'Sep', ingresos: 4500 },
                    { mes: 'Oct', ingresos: 4800 },
                    { mes: 'Nov', ingresos: 5200 },
                    { mes: 'Dic', ingresos: 5500 },
                  ]}
                >
                  <XAxis
                    dataKey="mes"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `$${value}`}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: 'var(--color-ingresos)', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke="var(--color-ingresos)"
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-ingresos)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'var(--color-ingresos)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Activity Chart - Nuevos Usuarios y Grupos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Nuevos Usuarios y Grupos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  usuarios: {
                    label: 'Nuevos Usuarios',
                    color: 'hsl(var(--chart-2))',
                  },
                  grupos: {
                    label: 'Nuevos Grupos',
                    color: 'hsl(var(--chart-3))',
                  },
                }}
                className="h-[240px]"
              >
                <BarChart
                  data={[
                    { mes: 'Ene', usuarios: 45, grupos: 22 },
                    { mes: 'Feb', usuarios: 52, grupos: 22 },
                    { mes: 'Mar', usuarios: 61, grupos: 22 },
                    { mes: 'Abr', usuarios: 58, grupos: 18 },
                    { mes: 'May', usuarios: 67, grupos: 22 },
                    { mes: 'Jun', usuarios: 73, grupos: 22 },
                    { mes: 'Jul', usuarios: 79, grupos: 22 },
                    { mes: 'Ago', usuarios: 85, grupos: 22 },
                    { mes: 'Sep', usuarios: 91, grupos: 24 },
                    { mes: 'Oct', usuarios: 96, grupos: 25 },
                    { mes: 'Nov', usuarios: 102, grupos: 25 },
                    { mes: 'Dic', usuarios: 108, grupos: 25 },
                  ]}
                >
                  <XAxis
                    dataKey="mes"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar
                    dataKey="usuarios"
                    fill="var(--color-usuarios)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="grupos"
                    fill="var(--color-grupos)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
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
            <LoadingSpinner size="lg" text="Cargando dashboard..." />
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" text="Cargando dashboard..." />
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
          notificationsCount={currentStats.pendingApprovals}
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

export default AdminDashboard;
