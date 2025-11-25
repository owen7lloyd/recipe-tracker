'use client';

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
  // Get suggested units based on ingredient category
  const suggestedUnits = getSuggestedUnits(ingredientCategory);

  // Get organized units for the rest
  const organizedUnits = getOrganizedUnits();

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

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300 ${className}`}
    >
      <option value="">Unit</option>

      {/* Suggested units based on ingredient category */}
      {suggestedUnits.length > 0 && (
        <optgroup label="⭐ Suggested">
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
    </select>
  );
}
