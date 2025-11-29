'use client';

import { useState, useEffect } from 'react';
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
 * - Local state for smooth typing (no premature commits)
 * - Commits change on blur or Enter key press
 * - Reset button to restore original servings
 * - Visual indicator when recipe is scaled (scale factor badge)
 * - Configurable min/max limits
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
  const [inputValue, setInputValue] = useState(currentServings.toString());

  const isScaled = currentServings !== originalServings;
  const scaleFactor = currentServings / originalServings;

  // Sync local input value when currentServings changes (from parent)
  useEffect(() => {
    setInputValue(currentServings.toString());
  }, [currentServings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Parse and validate for immediate feedback
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minServings && numValue <= maxServings) {
      // Don't call onScaleChange here - wait for blur or enter
    }
  };

  const commitChange = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= minServings && numValue <= maxServings) {
      onScaleChange(numValue);
    } else {
      // Reset to current value if invalid
      setInputValue(currentServings.toString());
    }
  };

  const handleBlur = () => {
    commitChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitChange();
      e.currentTarget.blur();
    }
  };

  const handleReset = () => {
    if (!disabled) {
      onScaleChange(originalServings);
      setInputValue(originalServings.toString());
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Input
          type="number"
          min={minServings}
          max={maxServings}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-20 text-center text-lg font-bold"
          aria-label="Servings"
        />

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
