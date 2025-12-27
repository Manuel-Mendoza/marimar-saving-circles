import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAvatar, StatusBadge, CurrencyDisplay } from '@/components/atoms';
import { cn } from '@/lib/utils';

interface UserCardProps {
  /** ID del usuario */
  id: number;
  /** Nombre del usuario */
  nombre: string;
  /** Apellido del usuario */
  apellido?: string;
  /** Cédula */
  cedula?: string;
  /** Correo electrónico */
  correoElectronico: string;
  /** Estado del usuario */
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO' | 'REACTIVADO';
  /** URL de imagen de perfil */
  imagenCedula?: string;
  /** Fecha de registro */
  fechaRegistro?: Date;
  /** Rol del usuario */
  tipo?: 'USUARIO' | 'ADMINISTRADOR';
  /** Información financiera opcional */
  balance?: {
    amount: number;
    currency: 'USD' | 'VES';
  };
  /** Mostrar acciones */
  showActions?: boolean;
  /** Función para editar */
  onEdit?: () => void;
  /** Función para eliminar */
  onDelete?: () => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante de la card */
  variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Componente Molecule para mostrar información completa de usuario
 * Combina UserAvatar, StatusBadge, CurrencyDisplay y otros atoms
 */
const UserCard: React.FC<UserCardProps> = ({
  id,
  nombre,
  apellido,
  cedula,
  correoElectronico,
  estado,
  imagenCedula,
  fechaRegistro,
  tipo,
  balance,
  showActions = false,
  onEdit,
  onDelete,
  className,
  variant = 'default',
}) => {
  const fullName = [nombre, apellido].filter(Boolean).join(' ');

  if (variant === 'compact') {
    return (
      <Card className={cn('p-3 hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-0">
          <div className="flex items-center space-x-3">
            <UserAvatar name={nombre} lastname={apellido} imageUrl={imagenCedula} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {correoElectronico}
              </p>
            </div>
            <StatusBadge status={estado} size="sm" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('p-6 hover:shadow-lg transition-shadow', className)}>
        <CardContent className="p-0">
          <div className="flex flex-col space-y-4">
            {/* Header con avatar y acciones */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <UserAvatar name={nombre} lastname={apellido} imageUrl={imagenCedula} size="lg" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fullName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{correoElectronico}</p>
                  {tipo && (
                    <Badge variant="outline" className="mt-1">
                      {tipo === 'ADMINISTRADOR' ? 'Administrador' : 'Usuario'}
                    </Badge>
                  )}
                </div>
              </div>
              {showActions && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Información detallada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estado:
                  </span>
                  <div className="mt-1">
                    <StatusBadge status={estado} />
                  </div>
                </div>
                {cedula && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Cédula:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">{cedula}</p>
                  </div>
                )}
                {fechaRegistro && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Registro:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {new Date(fechaRegistro).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
              </div>

              {balance && (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Balance:
                    </span>
                    <div className="mt-1">
                      <CurrencyDisplay
                        amount={balance.amount}
                        currency={balance.currency}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Variant default
  return (
    <Card className={cn('p-4 hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0">
        <div className="flex items-center space-x-4">
          <UserAvatar name={nombre} lastname={apellido} imageUrl={imagenCedula} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                {fullName}
              </h3>
              <StatusBadge status={estado} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{correoElectronico}</p>
            {cedula && (
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">Cédula: {cedula}</p>
            )}
            {tipo && tipo === 'ADMINISTRADOR' && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
