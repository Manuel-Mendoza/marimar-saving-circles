import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface ProductStatsCardProps {
  /** Título de la estadística */
  title: string;
  /** Valor numérico */
  value: number;
  /** Icono a mostrar */
  icon: LucideIcon;
  /** Variante de color */
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

/**
 * Componente Molecule para mostrar tarjetas de estadísticas de productos
 * Combina Card, icono y valores numéricos con estilos específicos
 */
const ProductStatsCard: React.FC<ProductStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
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
    <Card className={variantStyles[variant]}>
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${iconStyles[variant]} dark:bg-opacity-20`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStatsCard;
