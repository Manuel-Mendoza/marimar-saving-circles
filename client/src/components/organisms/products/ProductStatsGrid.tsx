import React from 'react';
import { Package, DollarSign, Clock, Archive } from 'lucide-react';
import ProductStatsCard from '@/components/molecules/products/ProductStatsCard';

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  averagePrice: number;
}

/**
 * Componente Organism para mostrar estadísticas de productos
 * Combina múltiples ProductStatsCard en un grid responsivo
 */
const ProductStatsGrid: React.FC<ProductStats> = ({
  totalProducts,
  activeProducts,
  inactiveProducts,
  averagePrice,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <ProductStatsCard
        title="Total Productos"
        value={totalProducts}
        icon={Package}
        variant="default"
      />
      <ProductStatsCard
        title="Productos Activos"
        value={activeProducts}
        icon={DollarSign}
        variant="success"
      />
      <ProductStatsCard
        title="Productos Inactivos"
        value={inactiveProducts}
        icon={Archive}
        variant="warning"
      />
      <ProductStatsCard
        title="Precio Promedio"
        value={Math.round(averagePrice)}
        icon={Clock}
        variant="default"
      />
    </div>
  );
};

export default ProductStatsGrid;
