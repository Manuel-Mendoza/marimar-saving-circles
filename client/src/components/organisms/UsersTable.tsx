import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserAvatar } from '@/components/atoms';
import StatusBadge from '@/components/atoms/StatusBadge';
import UserActionButtons from '@/components/molecules/UserActionButtons';
import {
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  Trash2,
} from 'lucide-react';

interface User {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  correoElectronico: string;
  tipo: 'USUARIO' | 'ADMINISTRADOR';
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  imagenCedula?: string;
  fechaRegistro: string;
  aprobadoPor?: number;
  fechaAprobacion?: string;
}

interface UsersTableProps {
  /** Lista de usuarios a mostrar */
  users: User[];
  /** Título de la tabla */
  title: string;
  /** Usuario actualmente cargando acción */
  actionLoadingId?: number;
  /** Función para manejar acciones de usuario */
  onUserAction: (user: User, action: string) => void;
}

/**
 * Componente Organism para mostrar tabla de usuarios
 * Combina tabla, filas de usuario y botones de acción
 */
const UsersTable: React.FC<UsersTableProps> = ({
  users,
  title,
  actionLoadingId,
  onUserAction,
}) => {
  // Get available actions for user
  const getAvailableActions = (user: User) => {
    const actions = [];

    if (user.estado === 'PENDIENTE') {
      actions.push(
        { label: 'Aprobar', action: 'approve', variant: 'default' as const, icon: CheckCircle },
        { label: 'Rechazar', action: 'reject', variant: 'destructive' as const, icon: XCircle }
      );
    } else if (user.estado === 'APROBADO' || user.estado === 'REACTIVADO') {
      actions.push({
        label: 'Suspender',
        action: 'suspend',
        variant: 'destructive' as const,
        icon: Ban,
      });
    } else if (user.estado === 'SUSPENDIDO') {
      actions.push(
        { label: 'Reactivar', action: 'reactivate', variant: 'default' as const, icon: RotateCcw },
        { label: 'Eliminar', action: 'delete', variant: 'destructive' as const, icon: Trash2 }
      );
    }

    return actions;
  };

  // Render user table row
  const renderUserRow = (user: User) => (
    <TableRow key={user.id}>
      <TableCell>
        <div className="flex items-center space-x-3">
          <UserAvatar
            name={user.nombre}
            lastname={user.apellido}
            imageUrl={user.imagenCedula}
            size="sm"
          />
          <div>
            <div className="font-medium">
              {user.nombre} {user.apellido}
            </div>
            <div className="text-sm text-gray-500">{user.correoElectronico}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>{user.cedula}</TableCell>
      <TableCell>{user.telefono}</TableCell>
      <TableCell>
        <StatusBadge status={user.estado} size="sm" />
      </TableCell>
      <TableCell>{new Date(user.fechaRegistro).toLocaleDateString('es-ES')}</TableCell>
      <TableCell>
        <UserActionButtons
          actions={getAvailableActions(user)}
          userId={user.id}
          isLoading={actionLoadingId === user.id}
          onAction={(action) => onUserAction(user, action)}
        />
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              users.map(renderUserRow)
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
