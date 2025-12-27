import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NavigationSidebar } from '@/components/molecules';
import { IconButton } from '@/components/atoms';
import { Menu, Bell, Search, Settings, User } from 'lucide-react';

interface MainLayoutProps {
  /** Contenido principal de la página */
  children: React.ReactNode;
  /** Usuario actual */
  user?: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO' | 'ADMINISTRADOR';
    imagenCedula?: string;
  };
  /** Título de la página */
  title?: string;
  /** Subtítulo de la página */
  subtitle?: string;
  /** Header personalizado */
  customHeader?: React.ReactNode;
  /** Sidebar personalizado */
  customSidebar?: React.ReactNode;
  /** Mostrar sidebar */
  showSidebar?: boolean;
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
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Template: Layout principal de la aplicación
 * Proporciona estructura base con header, sidebar y contenido
 */
const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  user,
  title,
  subtitle,
  customHeader,
  customSidebar,
  showSidebar = true,
  sidebarCollapsed: initialCollapsed = false,
  onToggleSidebar,
  onNavigate,
  onLogout,
  notificationsCount = 0,
  isLoading = false,
  className,
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

  const HeaderContent = () => {
    if (customHeader) {
      return customHeader;
    }

    return (
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showSidebar && (
              <IconButton
                icon={Menu}
                size="sm"
                variant="ghost"
                onClick={handleToggleSidebar}
                className="lg:hidden"
                tooltip="Toggle menu"
              />
            )}
            <div>
              {title && (
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Search */}
            <IconButton
              icon={Search}
              size="sm"
              variant="ghost"
              tooltip="Buscar"
              className="hidden sm:flex"
            />

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
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notificationsCount > 99 ? '99+' : notificationsCount}
                </span>
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
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={() => onNavigate?.('profile')}
              >
                <User className="h-4 w-4 mr-2" />
                {user?.nombre}
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  };

  return (
    <div className={cn('min-h-screen bg-gray-50 dark:bg-gray-900 flex', className)}>
      {/* Sidebar */}
      {showSidebar && (
        <aside className="hidden lg:block">
          {customSidebar || (
            <NavigationSidebar
              user={user}
              collapsed={sidebarCollapsed}
              onToggleCollapse={handleToggleSidebar}
              onNavigate={handleSidebarNavigate}
              onLogout={onLogout}
              notificationsCount={notificationsCount}
            />
          )}
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <HeaderContent />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-6">{children}</div>
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && !sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Mobile Sidebar */}
      {showSidebar && (
        <div
          className={cn(
            'fixed top-0 left-0 z-50 h-full lg:hidden transition-transform duration-300',
            sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
          )}
        >
          <NavigationSidebar
            user={user}
            collapsed={false}
            onNavigate={itemId => {
              handleSidebarNavigate(itemId);
              setSidebarCollapsed(true); // Close mobile sidebar after navigation
            }}
            onLogout={onLogout}
            notificationsCount={notificationsCount}
          />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
