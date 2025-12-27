import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  /** Nombre del usuario */
  name?: string;
  /** Apellido del usuario */
  lastname?: string;
  /** URL de la imagen de perfil */
  imageUrl?: string;
  /** Tamaño del avatar */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Clases CSS adicionales */
  className?: string;
  /** Mostrar borde */
  showBorder?: boolean;
  /** Estado online/offline */
  status?: 'online' | 'offline' | 'away';
}

/**
 * Componente Atom para mostrar avatar de usuario
 * Muestra imagen o iniciales del nombre
 */
const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  lastname,
  imageUrl,
  size = 'md',
  className,
  showBorder = false,
  status,
}) => {
  // Generar iniciales del nombre
  const getInitials = (): string => {
    if (!name && !lastname) return '?';

    const firstInitial = name?.charAt(0).toUpperCase() || '';
    const lastInitial = lastname?.charAt(0).toUpperCase() || '';

    return firstInitial + lastInitial || firstInitial || lastInitial;
  };

  // Obtener clases de tamaño
  const getSizeClasses = (sizeType: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };
    return sizes[sizeType];
  };

  // Obtener clases de estado
  const getStatusClasses = (): string => {
    if (!status) return '';

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
    };

    return `relative after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-white dark:after:border-gray-800 after:${statusColors[status]}`;
  };

  const initials = getInitials();
  const sizeClasses = getSizeClasses(size);
  const statusClasses = getStatusClasses();

  return (
    <div className={cn('relative inline-block', statusClasses)}>
      <Avatar
        className={cn(
          sizeClasses,
          showBorder && 'ring-2 ring-gray-200 dark:ring-gray-700',
          className
        )}
      >
        {imageUrl && (
          <AvatarImage src={imageUrl} alt={`${name} ${lastname}`} className="object-cover" />
        )}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserAvatar;
