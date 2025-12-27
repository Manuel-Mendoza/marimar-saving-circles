import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { getAvailableTags, getTagColor } from '@/lib/tagUtils';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagToggle,
  onClearFilters,
}) => {
  const availableTags = getAvailableTags();

  const hasActiveFilters = searchTerm.trim() || selectedTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Tag Filters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">Filtrar por categorías:</h3>
          {selectedTags.length > 0 && (
            <span className="text-sm text-gray-500">{selectedTags.length} seleccionadas</span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                className={`cursor-pointer transition-all hover:shadow-sm border ${
                  isSelected
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                    : `${getTagColor(tag)} hover:opacity-80`
                }`}
                onClick={() => onTagToggle(tag)}
              >
                {tag}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>

        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Filtros activos:</span>
            {selectedTags.map(tag => (
              <Badge
                key={`active-${tag}`}
                className={`flex items-center gap-1 border ${getTagColor(tag)}`}
              >
                {tag}
                <button
                  onClick={() => onTagToggle(tag)}
                  className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductFilters;
