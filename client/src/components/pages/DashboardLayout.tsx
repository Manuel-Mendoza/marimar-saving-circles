import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { NavigationSidebar } from '@/components/molecules';
import { AdminDashboard, UserDashboard, UserProfile } from '@/components/organisms';
import {
  UsersManagement,
  ProductsManagement,
  GroupsManagement,
  PaymentsManagement,
  AdminSettings,
  RatingsManagement,
  DeliveriesManagement,
} from '@/components/pages';
import { UserGroupsManagement, UserProductsManagement } from '@/components/organisms';
import type { User } from '@/lib/types';

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Determinar el item activo basado en la ruta actual
  const getActiveItem = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'dashboard';
    if (path.includes('/dashboard/users')) return 'users';
    if (path.includes('/dashboard/ratings')) return 'ratings';
    if (path.includes('/dashboard/products')) return 'products';
    if (path.includes('/dashboard/groups')) return 'groups';
    if (path.includes('/dashboard/payments')) return 'payments';
    if (path.includes('/dashboard/deliveries')) return 'deliveries';
    if (path.includes('/dashboard/profile')) return 'profile';
    if (path.includes('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };

  const handleNavigate = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'users':
        navigate('/dashboard/users');
        break;
      case 'ratings':
        navigate('/dashboard/ratings');
        break;
      case 'products':
        navigate('/dashboard/products');
        break;
      case 'groups':
        navigate('/dashboard/groups');
        break;
      case 'payments':
        navigate('/dashboard/payments');
        break;
      case 'deliveries':
        navigate('/dashboard/deliveries');
        break;
      case 'profile':
        navigate('/dashboard/profile');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      case 'notifications':
        navigate('/dashboard/notifications');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <NavigationSidebar
        user={user}
        activeItem={getActiveItem()}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notificationsCount={0} // TODO: Conectar con estado real
      />

      <div className="flex-1 flex flex-col">
        <Routes>
          <Route
            index
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                <AdminDashboard
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user={user as any}
                  onNavigate={handleNavigate}
                  showSidebar={false}
                />
              ) : (
                <UserDashboard
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  user={user as any}
                  onNavigate={handleNavigate}
                  showSidebar={false}
                />
              )
            }
          />
          <Route
            path="users"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <UsersManagement user={user as any} />
              ) : (
                <div className="flex-1 p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      No tienes permisos para acceder a esta sección.
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="ratings"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <RatingsManagement user={user as any} />
              ) : (
                <div className="flex-1 p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      No tienes permisos para acceder a esta sección.
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="products"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <ProductsManagement user={user as any} />
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <UserProductsManagement user={user as any} />
              )
            }
          />
          <Route
            path="groups"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <GroupsManagement user={user as any} />
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <UserGroupsManagement user={user as any} />
              )
            }
          />
          <Route
            path="payments"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <PaymentsManagement user={user as any} />
              ) : (
                <div className="flex-1 p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      No tienes permisos para acceder a esta sección.
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="deliveries"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <DeliveriesManagement user={user as any} />
              ) : (
                <div className="flex-1 p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      No tienes permisos para acceder a esta sección.
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="profile"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            element={<UserProfile user={user as any} />}
          />
          <Route
            path="settings"
            element={
              user.tipo === 'ADMINISTRADOR' ? (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                <AdminSettings user={user as any} />
              ) : (
                <div className="flex-1 p-6">
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Acceso Denegado
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      No tienes permisos para acceder a esta sección.
                    </p>
                  </div>
                </div>
              )
            }
          />
          <Route
            path="notifications"
            element={
              <div className="flex-1 p-6">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Notificaciones
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Funcionalidad de notificaciones próximamente disponible.
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default DashboardLayout;
