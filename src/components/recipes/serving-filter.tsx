/**
 * Serving Filter Component
 * Allows users to filter recipes by achievable servings
 */

'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ServingFilterProps {
  onFilterChange: (minServings: number, maxServings: number) => void;
  onToggleReducedServings: (enabled: boolean) => void;
  showReducedServings?: boolean;
  minValue?: number;
  maxValue?: number;
}

export function ServingFilter({
  onFilterChange,
  onToggleReducedServings,
  showReducedServings = false,
  minValue = 0,
  maxValue = 12,
}: ServingFilterProps) {
  const [minServings, setMinServings] = useState(minValue);
  const [maxServings, setMaxServings] = useState(maxValue);
  const [includeReducedServings, setIncludeReducedServings] =
    useState(showReducedServings);

  const handleSliderChange = (values: [number, number]) => {
    setMinServings(values[0]);
    setMaxServings(values[1]);
    onFilterChange(values[0], values[1]);
  };

  const handleToggleReducedServings = (checked: boolean) => {
    setIncludeReducedServings(checked);
    onToggleReducedServings(checked);
  };

  return (
    <div className="space-y-6 rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
      <div>
        <h3 className="font-merriweather mb-4 text-lg font-bold text-[#2d5016]">
          Achievable Servings
        </h3>
        <Slider
          min={0}
          max={12}
          step={0.5}
          value={[minServings, maxServings]}
          onValueChange={handleSliderChange}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-[#6b6250]">
          <span>{minServings} servings minimum</span>
          <span>Up to {maxServings} servings</span>
        </div>
      </div>

      <div className="border-t-2 border-[#e8dcc8] pt-4">
        <div className="flex items-center space-x-3">
          <Switch
            id="reduced-servings"
            checked={includeReducedServings}
            onCheckedChange={handleToggleReducedServings}
          />
          <Label htmlFor="reduced-servings" className="cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#2d5016]">
                Include reduced servings
              </p>
              <p className="text-xs text-[#6b6250]">
                Show recipes you can make with fewer servings
              </p>
            </div>
          </Label>
        </div>
      </div>
    </div>
  );
}
