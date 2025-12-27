import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ProductActionButton {
  label: string;
  action: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon: LucideIcon;
}

interface ProductActionButtonsProps {
  /** Lista de acciones disponibles */
  actions: ProductActionButton[];
  /** Producto ID para tracking */
  productId: number;
  /** Loading state */
  isLoading?: boolean;
  /** Función callback para manejar acciones */
  onAction: (action: string) => void;
}

/**
 * Componente Molecule para botones de acción de producto
 * Renderiza una lista de botones con iconos y diferentes variantes
 */
const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
  actions,
  productId,
  isLoading = false,
  onAction,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {actions.map(action => (
        <Button
          key={action.action}
          variant={action.variant}
          size="sm"
          onClick={() => onAction(action.action)}
          disabled={isLoading}
        >
          <action.icon className="w-4 h-4 mr-1" />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

export default ProductActionButtons;
