import React from 'react';
import { Users, Clock, CheckCircle, Ban } from 'lucide-react';
import UserStatsCard from '@/components/molecules/users/UserStatsCard';

interface UserStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  suspendedUsers: number;
}

/**
 * Componente Organism para mostrar estadísticas de usuarios
 * Combina múltiples UserStatsCard en un grid responsivo
 */
const UserStatsGrid: React.FC<UserStats> = ({
  totalUsers,
  pendingUsers,
  approvedUsers,
  suspendedUsers,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <UserStatsCard title="Total Usuarios" value={totalUsers} icon={Users} variant="default" />
      <UserStatsCard title="Pendientes" value={pendingUsers} icon={Clock} variant="warning" />
      <UserStatsCard title="Aprobados" value={approvedUsers} icon={CheckCircle} variant="success" />
      <UserStatsCard title="Suspendidos" value={suspendedUsers} icon={Ban} variant="danger" />
    </div>
  );
};

export default UserStatsGrid;
