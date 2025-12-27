import React from 'react';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, UserCheck, Users, Package, BarChart3, DollarSign } from 'lucide-react';

type ActiveView =
  | 'dashboard'
  | 'approvals'
  | 'users'
  | 'groups'
  | 'products'
  | 'payment-requests'
  | 'reports';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  pendingUsersCount: number;
  pendingPaymentsCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  pendingUsersCount,
  pendingPaymentsCount = 0,
}) => {
  return (
    <SidebarComponent>
      <SidebarHeader className="p-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-sm text-gray-500">Marimar Saving Circles</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'approvals'}
              onClick={() => onViewChange('approvals')}
            >
              <UserCheck className="h-4 w-4" />
              Aprobaciones
              {pendingUsersCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {pendingUsersCount}
                </Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'users'}
              onClick={() => onViewChange('users')}
            >
              <Users className="h-4 w-4" />
              Usuarios
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'groups'}
              onClick={() => onViewChange('groups')}
            >
              <Users className="h-4 w-4" />
              Grupos
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'products'}
              onClick={() => onViewChange('products')}
            >
              <Package className="h-4 w-4" />
              Productos
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'payment-requests'}
              onClick={() => onViewChange('payment-requests')}
            >
              <DollarSign className="h-4 w-4" />
              Solicitudes de Pago
              {pendingPaymentsCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {pendingPaymentsCount}
                </Badge>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeView === 'reports'}
              onClick={() => onViewChange('reports')}
            >
              <BarChart3 className="h-4 w-4" />
              Reportes
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
