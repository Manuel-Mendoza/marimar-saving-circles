import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle, TrendingUp, Percent } from 'lucide-react';

interface DeliveryStatsGridProps {
  totalDeliveries: number;
  pendingDeliveries: number;
  completedDeliveries: number;
  monthlyDeliveries: number;
  completionRate: number;
}

export const DeliveryStatsGrid: React.FC<DeliveryStatsGridProps> = ({
  totalDeliveries,
  pendingDeliveries,
  completedDeliveries,
  monthlyDeliveries,
  completionRate,
}) => {
  const stats = [
    {
      title: 'Total Entregas',
      value: totalDeliveries.toString(),
      icon: Package,
      description: 'Entregas registradas',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Pendientes',
      value: pendingDeliveries.toString(),
      icon: Clock,
      description: 'Esperando procesamiento',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      title: 'Completadas',
      value: completedDeliveries.toString(),
      icon: CheckCircle,
      description: 'Entregas finalizadas',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Este Mes',
      value: monthlyDeliveries.toString(),
      icon: TrendingUp,
      description: 'Entregas del mes actual',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Tasa de Completación',
      value: `${completionRate.toFixed(1)}%`,
      icon: Percent,
      description: 'Porcentaje completado',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
