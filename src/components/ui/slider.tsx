/**
 * Custom Slider Component
 * A simple range slider for filtering by serving sizes
 */

import * as React from 'react';

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onValueChange: (values: [number, number]) => void;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ min, max, step, value, onValueChange, className = '' }, ref) => {
    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(parseFloat(e.target.value), value[1]);
      onValueChange([newMin, value[1]]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(parseFloat(e.target.value), value[0]);
      onValueChange([value[0], newMax]);
    };

    const getPercentage = (val: number) => {
      return ((val - min) / (max - min)) * 100;
    };

    const minPercentage = getPercentage(value[0]);
    const maxPercentage = getPercentage(value[1]);

    return (
      <div ref={ref} className={`w-full space-y-2 ${className}`}>
        <div className="relative h-2 w-full rounded-full bg-[#e8dcc8]">
          {/* Track highlight between min and max */}
          <div
            className="absolute h-full rounded-full bg-[#2d5016]"
            style={{
              left: `${minPercentage}%`,
              right: `${100 - maxPercentage}%`,
            }}
          />

          {/* Min input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[0]}
            onChange={handleMinChange}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#2d5016] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2d5016] [&::-webkit-slider-thumb]:shadow-md"
          />

          {/* Max input */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value[1]}
            onChange={handleMaxChange}
            className="pointer-events-none absolute inset-0 z-20 h-full w-full appearance-none bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[#2d5016] [&::-moz-range-thumb]:shadow-md [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2d5016] [&::-webkit-slider-thumb]:shadow-md"
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
