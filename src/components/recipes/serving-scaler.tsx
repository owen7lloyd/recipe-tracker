'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, RotateCcw } from 'lucide-react';
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
 * Interactive stepper control for adjusting recipe serving sizes.
 * Displays current servings with +/- buttons and a reset option when scaled.
 *
 * Features:
 * - Increment/decrement serving size
 * - Reset to original servings
 * - Visual indicator when recipe is scaled
 * - Configurable min/max limits
 * - Keyboard accessible
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
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentServings.toString());

  const isScaled = currentServings !== originalServings;
  const scaleFactor = currentServings / originalServings;

  const handleDecrease = () => {
    if (currentServings > minServings && !disabled) {
      onScaleChange(currentServings - 1);
      setEditValue((currentServings - 1).toString());
    }
  };

  const handleIncrease = () => {
    if (currentServings < maxServings && !disabled) {
      onScaleChange(currentServings + 1);
      setEditValue((currentServings + 1).toString());
    }
  };

  const handleReset = () => {
    if (!disabled) {
      onScaleChange(originalServings);
      setEditValue(originalServings.toString());
      setIsEditing(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);

    // Attempt to parse and apply if valid
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= minServings && numValue <= maxServings) {
      onScaleChange(numValue);
    }
  };

  const handleEditBlur = () => {
    const numValue = parseInt(editValue, 10);
    if (isNaN(numValue) || numValue < minServings || numValue > maxServings) {
      // Reset to current value if invalid
      setEditValue(currentServings.toString());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleDecrease}
            disabled={disabled || currentServings <= minServings}
            aria-label="Decrease servings"
            className="h-9 w-9"
          >
            <Minus className="h-4 w-4" />
          </Button>

          {isEditing ? (
            <Input
              type="number"
              min={minServings}
              max={maxServings}
              value={editValue}
              onChange={handleEditChange}
              onBlur={handleEditBlur}
              autoFocus
              disabled={disabled}
              className="h-10 w-20 text-center text-lg font-bold"
            />
          ) : (
            <div
              className="flex min-w-[120px] flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setIsEditing(true)}
            >
              <span className="text-2xl font-bold tabular-nums">
                {currentServings}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {currentServings === 1 ? 'serving' : 'servings'}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={handleIncrease}
            disabled={disabled || currentServings >= maxServings}
            aria-label="Increase servings"
            className="h-9 w-9"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {isScaled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={disabled}
            className="gap-1.5 text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to {originalServings}
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
