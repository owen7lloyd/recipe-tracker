'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  COOKING_UNITS,
  getSuggestedUnits,
  getOrganizedUnits,
} from '@/lib/constants/units';

interface SmartUnitSelectorProps {
  value: string;
  onChange: (value: string) => void;
  ingredientCategory?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function SmartUnitSelector({
  value,
  onChange,
  ingredientCategory,
  disabled,
  id,
  className = '',
}: SmartUnitSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  // Get suggested units based on ingredient category
  const suggestedUnits = getSuggestedUnits(ingredientCategory);

  // Get organized units for expanded view
  const organizedUnits = getOrganizedUnits();

  // Check if the current value is in the suggested units
  const isValueInSuggested = suggestedUnits.some((u) => u.value === value);

  // If value exists but isn't in suggested units, show all by default
  const shouldShowAll = showAll || (value && !isValueInSuggested);

  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 ${className}`}
      >
        <option value="">Unit</option>

        {!shouldShowAll ? (
          <>
            {/* Suggested units based on ingredient category */}
            <optgroup label="Suggested Units">
              {suggestedUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>
          </>
        ) : (
          <>
            {/* Suggested units */}
            <optgroup label="Suggested Units">
              {suggestedUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>

            {/* Volume units */}
            <optgroup label="Volume">
              {organizedUnits.volume.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>

            {/* Weight units */}
            <optgroup label="Weight">
              {organizedUnits.weight.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>

            {/* Count units */}
            <optgroup label="Count">
              {organizedUnits.count.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>

            {/* Packaging units */}
            <optgroup label="Packaging">
              {organizedUnits.packaging.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>

            {/* Other units */}
            <optgroup label="Other">
              {organizedUnits.other.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </optgroup>
          </>
        )}
      </select>

      {/* Toggle button to show all/fewer units */}
      {!disabled && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="mt-1 flex w-full items-center justify-center gap-1 rounded-md px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {shouldShowAll ? (
            <>
              <ChevronUp className="h-3 w-3" />
              <span>Show fewer units</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              <span>Show all units</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
