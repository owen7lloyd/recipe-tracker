/**
 * Serving Badge Component
 * Displays achievable servings information on recipe cards
 */

import { Badge } from '@/components/ui/badge';

interface ServingBadgeProps {
  achievableServings: number;
  defaultServings: number;
  canMakeFull: boolean;
  canMakeReduced: boolean;
  size?: 'sm' | 'md';
}

export function ServingBadge({
  achievableServings,
  defaultServings,
  canMakeFull,
  canMakeReduced,
  size = 'md',
}: ServingBadgeProps) {
  if (canMakeFull) {
    return (
      <Badge
        className={`bg-[#2d5016] text-white ${
          size === 'sm' ? 'px-2 py-1 text-xs' : ''
        }`}
      >
        Full Recipe ({defaultServings})
      </Badge>
    );
  }

  if (canMakeReduced) {
    return (
      <Badge
        className={`bg-[#d4a574] text-white ${
          size === 'sm' ? 'px-2 py-1 text-xs' : ''
        }`}
      >
        {achievableServings} servings
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className={size === 'sm' ? 'px-2 py-1 text-xs' : ''}
    >
      Not available
    </Badge>
  );
}
