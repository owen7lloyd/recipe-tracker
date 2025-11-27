'use client';

import { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { getSuggestedUnits, getOrganizedUnits } from '@/lib/constants/units';

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

  // Get IDs of suggested units to avoid duplicates
  const suggestedUnitValues = new Set(suggestedUnits.map((u) => u.value));

  // Filter out suggested units from organized categories
  const otherVolume = organizedUnits.volume.filter(
    (u) => !suggestedUnitValues.has(u.value)
  );
  const otherWeight = organizedUnits.weight.filter(
    (u) => !suggestedUnitValues.has(u.value)
  );
  const otherCount = organizedUnits.count.filter(
    (u) => !suggestedUnitValues.has(u.value)
  );
  const otherPackaging = organizedUnits.packaging.filter(
    (u) => !suggestedUnitValues.has(u.value)
  );
  const otherOther = organizedUnits.other.filter(
    (u) => !suggestedUnitValues.has(u.value)
  );

  // Determine if button should be disabled (locked state)
  const isButtonDisabled = !!(shouldShowAll && value && !isValueInSuggested);

  return (
    <div
      className={`flex overflow-hidden rounded-md border border-slate-200 dark:border-slate-800 ${className}`}
    >
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 flex-1 border-0 bg-white px-3 py-2 text-sm ring-offset-0 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
      >
        <option value="">Unit</option>

        {!shouldShowAll ? (
          <>
            {/* Suggested units based on ingredient category */}
            {suggestedUnits.length > 0 && (
              <optgroup label="Suggested">
                {suggestedUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}
          </>
        ) : (
          <>
            {/* Suggested units */}
            {suggestedUnits.length > 0 && (
              <optgroup label="Suggested">
                {suggestedUnits.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Volume units (not already in suggested) */}
            {otherVolume.length > 0 && (
              <optgroup label="Volume">
                {otherVolume.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Weight units (not already in suggested) */}
            {otherWeight.length > 0 && (
              <optgroup label="Weight">
                {otherWeight.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Count units (not already in suggested) */}
            {otherCount.length > 0 && (
              <optgroup label="Count">
                {otherCount.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Packaging units (not already in suggested) */}
            {otherPackaging.length > 0 && (
              <optgroup label="Packaging">
                {otherPackaging.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}

            {/* Other units (not already in suggested) */}
            {otherOther.length > 0 && (
              <optgroup label="Other">
                {otherOther.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </optgroup>
            )}
          </>
        )}
      </select>

      {/* Toggle button with icon */}
      {!disabled && (
        <button
          type="button"
          onClick={() => {
            // Only allow toggling if not locked
            if (!isButtonDisabled) {
              setShowAll(!showAll);
            }
          }}
          disabled={isButtonDisabled}
          title={
            isButtonDisabled
              ? 'Locked to all units (selected unit not in suggested list)'
              : shouldShowAll
                ? 'Show suggested units only'
                : 'Show all units'
          }
          className={`flex h-10 w-10 shrink-0 items-center justify-center border-l transition-colors ${
            isButtonDisabled
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {shouldShowAll ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
