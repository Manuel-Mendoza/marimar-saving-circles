// Tag utilities for consistent tag color mapping across the application

export const TAG_COLORS: Record<string, string> = {
  'electrodomésticos': 'bg-blue-100 text-blue-800 border-blue-200',
  'línea blanca': 'bg-cyan-100 text-cyan-800 border-cyan-200',
  'celulares': 'bg-green-100 text-green-800 border-green-200',
  'tv': 'bg-purple-100 text-purple-800 border-purple-200',
  'smart tv': 'bg-violet-100 text-violet-800 border-violet-200',
  'computadoras': 'bg-orange-100 text-orange-800 border-orange-200',
  'cocinas': 'bg-pink-100 text-pink-800 border-pink-200',
  'aires acondicionados': 'bg-teal-100 text-teal-800 border-teal-200',
  'motos': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bicicletas': 'bg-rose-100 text-rose-800 border-rose-200',
  'cama': 'bg-amber-100 text-amber-800 border-amber-200',
  'ortopédicos': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
};

/**
 * Get the color class for a given tag
 * @param tag - The tag name
 * @returns Tailwind CSS classes for the tag color
 */
export function getTagColor(tag: string): string {
  return TAG_COLORS[tag] || 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get all available tags
 * @returns Array of available tag names
 */
export function getAvailableTags(): string[] {
  return Object.keys(TAG_COLORS);
}

/**
 * Get tags grouped by category for better organization
 * @returns Object with categorized tags
 */
export function getTagsByCategory(): Record<string, string[]> {
  return {
    'Electrodomésticos': ['electrodomésticos', 'aires acondicionados'],
    'Línea Blanca': ['línea blanca'],
    'Electrónicos': ['celulares', 'tv', 'smart tv'],
    'Computación': ['computadoras'],
    'Hogar': ['cocinas', 'camas', 'ortopédicos'],
    'Vehículos': ['motos', 'bicicletas']
  };
}
