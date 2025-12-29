import React from 'react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  /** Puntuación actual (1-5) */
  rating: number;
  /** Tamaño de las estrellas */
  size?: 'sm' | 'md' | 'lg';
  /** Si es interactivo para calificar */
  interactive?: boolean;
  /** Función callback cuando cambia la calificación */
  onRatingChange?: (rating: number) => void;
  /** Si mostrar el número de calificación */
  showNumber?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente Atom para mostrar y seleccionar calificaciones con estrellas
 */
const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onRatingChange,
  showNumber = false,
  className,
}) => {
  // Tamaños de estrellas
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Manejar clic en estrella
  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  // Renderizar estrellas
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => {
      const isActive = star <= rating;
      const isPartial = star === Math.ceil(rating) && rating % 1 !== 0;

      return (
        <button
          key={star}
          type="button"
          className={cn(
            'relative transition-colors duration-150',
            sizeClasses[size],
            interactive && 'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded',
            !interactive && 'cursor-default'
          )}
          onClick={() => handleStarClick(star)}
          disabled={!interactive}
        >
          {/* Estrella de fondo (gris) */}
          <svg
            className={cn(
              'absolute inset-0 transition-colors duration-150',
              isActive ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Estrella parcial (para calificaciones con decimales) */}
          {isPartial && (
            <svg
              className={cn(
                'absolute inset-0 text-gray-300 dark:text-gray-600 transition-colors duration-150',
                sizeClasses[size]
              )}
              fill="currentColor"
              viewBox="0 0 20 20"
              style={{
                clipPath: `inset(0 ${100 - ((rating % 1) * 100)}% 0 0)`,
              }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </button>
      );
    });
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {renderStars()}
      </div>

      {showNumber && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
