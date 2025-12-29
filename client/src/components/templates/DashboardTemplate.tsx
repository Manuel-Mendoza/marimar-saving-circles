import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { NavigationSidebar } from '@/components/molecules';
import { LoadingSpinner } from '@/components/atoms';

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
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner size="lg" text="Cargando contenido..." />
            </div>
          ) : (
            <div className="p-4 lg:p-6">{children}</div>
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
