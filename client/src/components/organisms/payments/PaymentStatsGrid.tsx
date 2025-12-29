import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/atoms';
import { CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentStats {
  /** Total de solicitudes de pago */
  totalRequests: number;
  /** Solicitudes pendientes */
  pendingRequests: number;
  /** Solicitudes confirmadas */
  confirmedRequests: number;
  /** Solicitudes rechazadas */
  rejectedRequests: number;
  /** Monto total confirmado */
  totalConfirmedAmount: number;
  /** Monto total pendiente */
  totalPendingAmount: number;
}

interface PaymentStatsGridProps {
  /** Estadísticas de pagos */
  stats: PaymentStats;
  /** Loading state */
  isLoading?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Organism: Grid de estadísticas para pagos
 * Muestra métricas clave sobre solicitudes de pago
 */
const PaymentStatsGrid: React.FC<PaymentStatsGridProps> = ({
  stats,
  isLoading = false,
  className,
}) => {
  const statCards = [
    {
      title: 'Total Solicitudes',
      value: stats.totalRequests,
      icon: CreditCard,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Pendientes',
      value: stats.pendingRequests,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900',
      highlight: stats.pendingRequests > 0,
    },
    {
      title: 'Confirmadas',
      value: stats.confirmedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Rechazadas',
      value: stats.rejectedRequests,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900',
    },
  ];

  const amountCards = [
    {
      title: 'Monto Confirmado',
      value: (
        <CurrencyDisplay amount={stats.totalConfirmedAmount} currency="USD" showSymbol={false} />
      ),
      subtitle: 'Total aprobado',
      color: 'text-green-600',
    },
    {
      title: 'Monto Pendiente',
      value: (
        <CurrencyDisplay amount={stats.totalPendingAmount} currency="USD" showSymbol={false} />
      ),
      subtitle: 'Esperando aprobación',
      color: 'text-yellow-600',
      highlight: stats.totalPendingAmount > 0,
    },
  ];

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Estadísticas de cantidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className={cn(stat.highlight && 'ring-2 ring-yellow-200 dark:ring-yellow-800')}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-full', stat.bgColor)}>
                    <Icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estadísticas de montos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {amountCards.map((stat, index) => (
          <Card
            key={index}
            className={cn(stat.highlight && 'ring-2 ring-yellow-200 dark:ring-yellow-800')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <div className={cn('text-3xl font-bold', stat.color)}>{stat.value}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">USD</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PaymentStatsGrid;
