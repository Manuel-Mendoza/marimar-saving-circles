import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay, IconButton } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

interface ProductCardProps {
  /** ID del producto */
  id: number;
  /** Nombre del producto */
  nombre: string;
  /** Descripción */
  descripcion: string;
  /** Precio en USD */
  precioUsd: number;
  /** Precio en VES */
  precioVes: number;
  /** Duración en meses */
  tiempoDuracion: number;
  /** URL de imagen */
  imagen?: string;
  /** Tags/categorías */
  tags?: string[];
  /** Producto activo/disponible */
  activo: boolean;
  /** Mostrar botones de acción */
  showActions?: boolean;
  /** Función para agregar al carrito */
  onAddToCart?: () => void;
  /** Función para ver detalles */
  onViewDetails?: () => void;
  /** Función para agregar a favoritos */
  onToggleFavorite?: () => void;
  /** Está en favoritos */
  isFavorite?: boolean;
  /** Clases CSS adicionales */
  className?: string;
  /** Variante de la card */
  variant?: 'default' | 'compact' | 'featured';
}

/**
 * Componente Molecule para mostrar productos en listados
 * Combina CurrencyDisplay, IconButton y otros atoms
 */
const ProductCard: React.FC<ProductCardProps> = ({
  id,
  nombre,
  descripcion,
  precioUsd,
  precioVes,
  tiempoDuracion,
  imagen,
  tags = [],
  activo = true,
  showActions = true,
  onAddToCart,
  onViewDetails,
  onToggleFavorite,
  isFavorite = false,
  className,
  variant = 'default',
}) => {
  if (variant === 'compact') {
    return (
      <Card className={cn('p-3 hover:shadow-md transition-shadow', className)}>
        <CardContent className="p-0">
          <div className="flex items-center space-x-3">
            {imagen && (
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img src={imagen} alt={nombre} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {nombre}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{descripcion}</p>
              <div className="flex items-center justify-between mt-1">
                <CurrencyDisplay amount={precioUsd} currency="USD" size="sm" />
                <span className="text-xs text-gray-500">{tiempoDuracion} meses</span>
              </div>
            </div>
            {showActions && onAddToCart && (
              <IconButton
                icon={ShoppingCart}
                size="sm"
                onClick={onAddToCart}
                tooltip="Seleccionar producto"
                disabled={!activo}
              />
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={cn('overflow-hidden hover:shadow-xl transition-shadow', className)}>
        {/* Imagen destacada */}
        {imagen && (
          <div className="relative h-48 overflow-hidden">
            <img src={imagen} alt={nombre} className="w-full h-full object-cover" />
            {!activo && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary" className="text-white">
                  No disponible
                </Badge>
              </div>
            )}
            {tiempoDuracion <= 6 && (
              <Badge className="absolute top-2 left-2 bg-green-500 hover:bg-green-600">
                Oferta
              </Badge>
            )}
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {nombre}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {tiempoDuracion} meses
                </Badge>
                {tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            {showActions && onToggleFavorite && (
              <IconButton
                icon={Heart}
                size="sm"
                variant="ghost"
                onClick={onToggleFavorite}
                className={isFavorite ? 'text-red-500' : 'text-gray-400'}
                tooltip={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              />
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
            {descripcion}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Precio USD:
              </span>
              <CurrencyDisplay amount={precioUsd} currency="USD" size="md" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Precio VES:
              </span>
              <CurrencyDisplay amount={precioVes} currency="VES" size="md" />
            </div>
          </div>
        </CardContent>

        {showActions && (
          <CardFooter className="pt-0">
            <div className="flex space-x-2 w-full">
              {onViewDetails && (
                <Button variant="outline" size="sm" onClick={onViewDetails} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalles
                </Button>
              )}
              {onAddToCart && (
                <Button onClick={onAddToCart} size="sm" className="flex-1" disabled={!activo}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {activo ? 'Seleccionar' : 'No disponible'}
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    );
  }

  // Variant default
  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      {/* Imagen del producto */}
      {imagen && (
        <div className="relative h-32 overflow-hidden">
          <img src={imagen} alt={nombre} className="w-full h-full object-cover" />
          {!activo && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Badge variant="secondary">Inactivo</Badge>
            </div>
          )}
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
            {nombre}
          </h3>
          {showActions && onToggleFavorite && (
            <IconButton
              icon={Heart}
              size="xs"
              variant="ghost"
              onClick={onToggleFavorite}
              className={isFavorite ? 'text-red-500' : 'text-gray-400'}
              tooltip={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            />
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {tiempoDuracion} meses
          </Badge>
          {tags.slice(0, 1).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{descripcion}</p>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">USD:</span>
            <CurrencyDisplay amount={precioUsd} currency="USD" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">VES:</span>
            <CurrencyDisplay amount={precioVes} currency="VES" compact />
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0">
          <div className="flex space-x-2 w-full">
            {onViewDetails && (
              <IconButton
                icon={Eye}
                size="sm"
                variant="outline"
                onClick={onViewDetails}
                tooltip="Ver detalles"
                className="flex-1"
              />
            )}
            {onAddToCart && (
              <Button onClick={onAddToCart} size="sm" className="flex-1" disabled={!activo}>
                <ShoppingCart className="h-4 w-4 mr-1" />
                {activo ? 'Seleccionar' : 'Inactivo'}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
