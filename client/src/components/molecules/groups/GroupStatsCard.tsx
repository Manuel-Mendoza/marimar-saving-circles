import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

/**
 * Molecule: Group Stats Card
 * Individual statistics card for group metrics
 */
interface GroupStatsCardProps {
  /** Card title */
  title: string;
  /** Card value */
  value: string | number;
  /** Icon component */
  icon: LucideIcon;
  /** Optional trend information */
  trend?: {
    value: number;
    label: string;
  };
  /** Optional color variant */
  variant?: 'default' | 'success' | 'warning' | 'danger';
  /** Optional custom className */
  className?: string;
}

export const GroupStatsCard: React.FC<GroupStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    danger: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
  };

  const iconStyles = {
    default: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    success: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400',
  };

  return (
    <Card className={`${variantStyles[variant]} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${iconStyles[variant]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {trend && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            <span
              className={trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : ''}
            >
              {trend.value > 0 ? '+' : ''}
              {trend.value}
            </span>{' '}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
