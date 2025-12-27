import React from 'react';
import { GroupStatsCard } from '@/components/molecules/groups';
import { Users, UserCheck, Play, CheckCircle } from 'lucide-react';

/**
 * Organism: Group Statistics Grid
 * Grid layout displaying group statistics cards
 */
interface GroupStats {
  totalGroups: number;
  incompleteGroups: number;
  fullGroups: number;
  activeGroups: number;
  completedGroups: number;
}

interface GroupStatsGridProps {
  /** Statistics data */
  stats: GroupStats;
}

export const GroupStatsGrid: React.FC<GroupStatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-4">
      <GroupStatsCard
        title="Total Grupos"
        value={stats.totalGroups}
        icon={Users}
        variant="default"
      />

      <GroupStatsCard
        title="Sin Completar"
        value={stats.incompleteGroups}
        icon={Users}
        variant="warning"
      />

      <GroupStatsCard
        title="Completos"
        value={stats.fullGroups}
        icon={UserCheck}
        variant="success"
      />

      <GroupStatsCard title="En Marcha" value={stats.activeGroups} icon={Play} variant="default" />

      <GroupStatsCard
        title="Completados"
        value={stats.completedGroups}
        icon={CheckCircle}
        variant="success"
      />
    </div>
  );
};
