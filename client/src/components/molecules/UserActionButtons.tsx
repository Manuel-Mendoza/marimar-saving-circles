import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButton {
  label: string;
  action: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  icon: LucideIcon;
}

interface UserActionButtonsProps {
  /** Lista de acciones disponibles */
  actions: ActionButton[];
  /** Usuario ID para tracking */
  userId: number;
  /** Loading state */
  isLoading?: boolean;
  /** Función callback para manejar acciones */
  onAction: (action: string) => void;
}

/**
 * Componente Molecule para botones de acción de usuario
 * Renderiza una lista de botones con iconos y diferentes variantes
 */
const UserActionButtons: React.FC<UserActionButtonsProps> = ({
  actions,
  userId,
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

export default UserActionButtons;
