import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavigationSidebar } from '@/components/molecules';
import { IconButton, LoadingSpinner } from '@/components/atoms';
import { Menu, Bell, Settings, User, Home } from 'lucide-react';

interface DashboardTemplateProps {
  /** Contenido principal de la página */
  children: React.ReactNode;
  /** Usuario actual */
  user: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO' | 'ADMINISTRADOR';
    imagenCedula?: string;
  };
  /** Título de la página */
  title: string;
  /** Subtítulo de la página */
  subtitle?: string;
  /** Breadcrumb items */
  breadcrumb?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  /** Acciones del header */
  headerActions?: React.ReactNode;
  /** Sidebar inicialmente colapsada */
  sidebarCollapsed?: boolean;
  /** Función para toggle sidebar */
  onToggleSidebar?: (collapsed: boolean) => void;
  /** Función para navegación */
  onNavigate?: (section: string) => void;
  /** Función para logout */
  onLogout?: () => void;
  /** Notificaciones pendientes */
  notificationsCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Mostrar breadcrumb */
  showBreadcrumb?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Template: Layout específico para páginas del dashboard
 * Incluye NavigationSidebar integrado y estructura optimizada para dashboard
 */
const DashboardTemplate: React.FC<DashboardTemplateProps> = ({
  children,
  user,
  title,
  subtitle,
  breadcrumb = [],
  headerActions,
  sidebarCollapsed: initialCollapsed = false,
  onToggleSidebar,
  onNavigate,
  onLogout,
  notificationsCount = 0,
  isLoading = false,
  showBreadcrumb = true,
  className
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(initialCollapsed);

  const handleToggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    onToggleSidebar?.(newCollapsed);
  };

  const handleSidebarNavigate = (itemId: string) => {
    onNavigate?.(itemId);
  };

  const Breadcrumb = () => {
    if (!showBreadcrumb || breadcrumb.length === 0) return null;

    return (
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate?.('dashboard')}
          className="p-0 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Home className="h-4 w-4 mr-1" />
          Dashboard
        </Button>
        {breadcrumb.map((item, index) => (
          <React.Fragment key={index}>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            {item.current ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => item.href && onNavigate?.(item.href)}
                className="p-0 h-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {item.label}
              </Button>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 flex', className)}>
      {/* Sidebar */}
      <NavigationSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        onNavigate={handleSidebarNavigate}
        onLogout={onLogout}
        notificationsCount={notificationsCount}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <IconButton
                icon={Menu}
                size="sm"
                variant="ghost"
                onClick={handleToggleSidebar}
                className="lg:hidden"
                tooltip="Toggle menu"
              />
              <div>
                <Breadcrumb />
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Header Actions */}
              {headerActions}

              {/* Notifications */}
              <div className="relative">
                <IconButton
                  icon={Bell}
                  size="sm"
                  variant="ghost"
                  tooltip="Notificaciones"
                  onClick={() => onNavigate?.('notifications')}
                />
                {notificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {notificationsCount > 99 ? '99+' : notificationsCount}
                  </Badge>
                )}
              </div>

              {/* Settings */}
              <IconButton
                icon={Settings}
                size="sm"
                variant="ghost"
                tooltip="Configuración"
                onClick={() => onNavigate?.('settings')}
                className="hidden sm:flex"
              />

              {/* User Menu */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={() => onNavigate?.('profile')}
              >
                <User className="h-4 w-4 mr-2" />
                {user.nombre}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" text="Cargando contenido..." />
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showBreadcrumb && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        'fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300',
        sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
      )}>
        <NavigationSidebar
          user={user}
          collapsed={false}
          onNavigate={(itemId) => {
            handleSidebarNavigate(itemId);
            setSidebarCollapsed(true);
          }}
          onLogout={onLogout}
          notificationsCount={notificationsCount}
        />
      </div>
    </div>
  );
};

export default DashboardTemplate;
