import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavigationSidebar } from '@/components/molecules';

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
