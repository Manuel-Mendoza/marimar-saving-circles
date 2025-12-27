import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Grupo } from '@/lib/types';
import { GroupStatusBadge } from './GroupStatusBadge';

/**
 * Atom: Group Card
 * Basic card component to display group information
 */
interface GroupCardProps {
  /** Group data */
  group: Grupo;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional custom className */
  className?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onClick,
  className = '',
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${onClick ? 'hover:border-blue-300' : ''} ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
              {group.nombre}
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Duración: {group.duracionMeses} meses
              </p>
              {group.participantes && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Participantes: {group.participantes}
                </p>
              )}
              {group.fechaInicio && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inicio: {new Date(group.fechaInicio).toLocaleDateString('es-ES')}
                </p>
              )}
              {group.turnoActual > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Turno actual: {group.turnoActual}
                </p>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <GroupStatusBadge status={group.estado} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
