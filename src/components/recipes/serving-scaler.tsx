'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ServingScalerProps {
  /** Original serving size from the recipe */
  originalServings: number;
  /** Current serving size (may be scaled) */
  currentServings: number;
  /** Callback when servings change */
  onScaleChange: (servings: number) => void;
  /** Optional: disable the controls */
  disabled?: boolean;
  /** Optional: minimum servings allowed (default: 1) */
  minServings?: number;
  /** Optional: maximum servings allowed (default: 100) */
  maxServings?: number;
}

/**
 * ServingScaler Component
 *
 * Number input control for adjusting recipe serving sizes.
 * Uses a native number input with spinner controls (scroll wheel support).
 *
 * Features:
 * - Direct numeric input with scroll wheel support
 * - Reset button to restore original servings
 * - Visual indicator when recipe is scaled (scale factor badge)
 * - Configurable min/max limits
 * - Real-time updates as user types
 *
 * @example
 * ```tsx
 * <ServingScaler
 *   originalServings={4}
 *   currentServings={8}
 *   onScaleChange={(servings) => handleScale(servings)}
 * />
 * ```
 */
export function ServingScaler({
  originalServings,
  currentServings,
  onScaleChange,
  disabled = false,
  minServings = 1,
  maxServings = 100,
}: ServingScalerProps) {
  const isScaled = currentServings !== originalServings;
  const scaleFactor = currentServings / originalServings;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value, 10);

    // Only update if valid number within bounds
    if (!isNaN(numValue) && numValue >= minServings && numValue <= maxServings) {
      onScaleChange(numValue);
    }
  };

  const handleReset = () => {
    if (!disabled) {
      onScaleChange(originalServings);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
            Servings
          </label>
          <Input
            type="number"
            min={minServings}
            max={maxServings}
            value={currentServings}
            onChange={handleChange}
            disabled={disabled}
            className="w-20 text-center text-lg font-bold"
            aria-label="Servings"
          />
        </div>

        {isScaled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="gap-1.5 self-end text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {isScaled && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {scaleFactor.toFixed(2)}x {scaleFactor > 1 ? 'larger' : 'smaller'}
          </Badge>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Original: {originalServings}{' '}
            {originalServings === 1 ? 'serving' : 'servings'}
          </span>
        </div>
      )}
    </div>
  );
}
