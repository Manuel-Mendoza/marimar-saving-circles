import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar, IconButton } from '@/components/atoms';
import {
  Home,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  badge?: number;
  children?: NavigationItem[];
}

interface NavigationSidebarProps {
  /** Items del menú de navegación */
  navigationItems?: NavigationItem[];
  /** Usuario actual */
  user?: {
    id: number;
    nombre: string;
    apellido?: string;
    tipo: 'USUARIO' | 'ADMINISTRADOR';
    imagenCedula?: string;
  };
  /** Item activo actualmente */
  activeItem?: string;
  /** Sidebar colapsada */
  collapsed?: boolean;
  /** Función para cambiar estado de colapso */
  onToggleCollapse?: () => void;
  /** Función para navegación */
  onNavigate?: (itemId: string, href?: string) => void;
  /** Función para logout */
  onLogout?: () => void;
  /** Notificaciones pendientes */
  notificationsCount?: number;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente Molecule para sidebar de navegación
 * Combina UserAvatar, IconButton, Badge y otros atoms
 */
const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  navigationItems = [],
  user,
  activeItem,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  onLogout,
  notificationsCount = 0,
  className
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Items de navegación por defecto según el rol
  const defaultNavigationItems: NavigationItem[] = user?.tipo === 'ADMINISTRADOR' ? [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'users', label: 'Usuarios', icon: Users, href: '/dashboard/users', badge: 0 },
    { id: 'products', label: 'Productos', icon: Package, href: '/dashboard/products' },
    { id: 'groups', label: 'Grupos', icon: BarChart3, href: '/dashboard/groups' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, href: '/dashboard/payments' },
    { id: 'settings', label: 'Configuración', icon: Settings, href: '/dashboard/settings' }
  ] : [
    { id: 'dashboard', label: 'Mi Dashboard', icon: Home, href: '/dashboard' },
    { id: 'products', label: 'Productos', icon: Package, href: '/dashboard/products' },
    { id: 'groups', label: 'Mis Grupos', icon: BarChart3, href: '/dashboard/groups' },
    { id: 'payments', label: 'Mis Pagos', icon: CreditCard, href: '/dashboard/payments' },
    { id: 'profile', label: 'Perfil', icon: User, href: '/dashboard/profile' }
  ];

  const items = navigationItems.length > 0 ? navigationItems : defaultNavigationItems;

  const handleItemClick = (item: NavigationItem) => {
    if (item.children && item.children.length > 0) {
      // Toggle expanded state for parent items
      setExpandedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(item.id)) {
          newSet.delete(item.id);
        } else {
          newSet.add(item.id);
        }
        return newSet;
      });
    } else {
      // Navigate to item
      onNavigate?.(item.id, item.href);
    }
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <Button
          variant={isActive ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start h-10 px-3',
            collapsed && 'px-2',
            level > 0 && 'ml-4',
            isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
          )}
          onClick={() => handleItemClick(item)}
        >
          <item.icon className={cn('h-4 w-4', !collapsed && 'mr-3')} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {item.badge > 99 ? '99+' : item.badge}
                </Badge>
              )}
              {hasChildren && (
                <div className="ml-auto">
                  {isExpanded ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              )}
            </>
          )}
        </Button>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-2">
            {item.children.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header con toggle y logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SM</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">San Marimar</span>
          </div>
        )}
        <IconButton
          icon={collapsed ? Menu : X}
          size="sm"
          variant="ghost"
          onClick={onToggleCollapse}
          tooltip={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        />
      </div>

      {/* User info */}
      {user && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <UserAvatar
              name={user.nombre}
              lastname={user.apellido}
              imageUrl={user.imagenCedula}
              size={collapsed ? 'sm' : 'md'}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.nombre} {user.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.tipo.toLowerCase()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map(item => renderNavigationItem(item))}
      </nav>

      {/* Footer con notificaciones y logout */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        {/* Notificaciones */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-10 px-3',
            collapsed && 'px-2'
          )}
          onClick={() => onNavigate?.('notifications')}
        >
          <div className="relative">
            <Bell className="h-4 w-4" />
            {notificationsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {notificationsCount > 99 ? '99+' : notificationsCount}
              </Badge>
            )}
          </div>
          {!collapsed && <span className="ml-3">Notificaciones</span>}
        </Button>

        <Separator />

        {/* Logout */}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-10 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950',
            collapsed && 'px-2'
          )}
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-3">Cerrar sesión</span>}
        </Button>
      </div>
    </div>
  );
};

export default NavigationSidebar;
