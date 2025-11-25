/**
 * Unit conversion utilities for recipe and pantry management
 * Handles conversions between different measurement systems
 */

import { UNIT_CONVERSIONS, UNIT_ALIASES } from './conversions';
import {
  convertVolumToWeight,
  convertWeightToVolume,
  isVolumeUnit,
  isWeightUnit,
} from './density-conversions';

export interface UnitConversionResult {
  success: boolean;
  value: number | null;
  error?: string;
  densityUsed?: {
    density: number;
    isExactMatch: boolean;
    isPartialMatch: boolean;
    isDefaultMatch: boolean;
  };
}

// Re-export density conversion types and functions
export {
  getDensityForIngredient,
  convertVolumToWeight,
  convertWeightToVolume,
  isVolumeUnit,
  isWeightUnit,
  INGREDIENT_DENSITIES,
  type DensityLookupResult,
  type ConversionResult as DensityConversionResult,
} from './density-conversions';

/**
 * Normalize a unit string by:
 * 1. Trimming whitespace
 * 2. Converting to lowercase
 * 3. Applying known aliases
 * 4. Returning the canonical unit name
 */
export function normalizeUnit(unit: string): string {
  if (!unit) return '';

  const trimmed = unit.toLowerCase().trim();

  // Check for exact match first
  if (UNIT_CONVERSIONS[trimmed]) {
    return trimmed;
  }

  // Check aliases
  if (UNIT_ALIASES[trimmed]) {
    return UNIT_ALIASES[trimmed];
  }

  // Return as-is if no match found (might be valid unknown unit)
  return trimmed;
}

/**
 * Check if two units can be converted to each other
 * Units can be converted if:
 * 1. They are the same unit
 * 2. They both convert to the same base unit (e.g., both volume)
 *
 * @param unit1 - First unit
 * @param unit2 - Second unit
 * @returns true if conversion is possible, false otherwise
 */
export function canConvert(
  unit1: string | null,
  unit2: string | null
): boolean {
  // If either unit is null, cannot convert
  if (!unit1 || !unit2) {
    console.log(`[CANCONVERT] Null units: unit1=${unit1}, unit2=${unit2}`);
    return false;
  }

  const normalized1 = normalizeUnit(unit1);
  const normalized2 = normalizeUnit(unit2);

  console.log(
    `[CANCONVERT] Checking: ${unit1} (${normalized1}) ↔ ${unit2} (${normalized2})`
  );

  // Same unit - trivial conversion
  if (normalized1 === normalized2) {
    console.log(`[CANCONVERT] Units are identical, can convert: true`);
    return true;
  }

  const info1 = UNIT_CONVERSIONS[normalized1];
  const info2 = UNIT_CONVERSIONS[normalized2];

  console.log(`[CANCONVERT] Unit lookup:`, {
    unit1: normalized1,
    found1: !!info1,
    baseUnit1: info1?.baseUnit,
    unit2: normalized2,
    found2: !!info2,
    baseUnit2: info2?.baseUnit,
  });

  // Either unit not recognized
  if (!info1 || !info2) {
    console.log(
      `[CANCONVERT] Unit not found in conversions: info1=${!!info1}, info2=${!!info2}`
    );
    return false;
  }

  // Cannot convert if no base unit (packaging, special measures)
  if (info1.baseUnit === null || info2.baseUnit === null) {
    console.log(
      `[CANCONVERT] Non-convertible units (no base): ${info1.baseUnit} vs ${info2.baseUnit}`
    );
    return false;
  }

  // Can convert if they have the same base unit (both ml, both g, both count)
  const canConvertResult = info1.baseUnit === info2.baseUnit;
  console.log(
    `[CANCONVERT] Base units match: ${info1.baseUnit} === ${info2.baseUnit} = ${canConvertResult}`
  );

  return canConvertResult;
}

/**
 * Convert a quantity from one unit to another
 * Returns the converted value or null if conversion is not possible
 *
 * Supports:
 * - Direct conversions (same base unit: ml→cup, g→kg, etc.)
 * - Density-based conversions (volume→weight: cup→g for flour, ml→oz for oil, etc.)
 *
 * Example:
 *   convertBetweenUnits(1, 'cup', 'ml') => 236.588
 *   convertBetweenUnits(2, 'lb', 'g') => 907.184
 *   convertBetweenUnits(2, 'cup', 'g', 'flour') => 250 (uses flour density)
 *   convertBetweenUnits(1, 'cup', 'lb') => null (no density data for unknown ingredient)
 *
 * @param quantity - The amount to convert
 * @param fromUnit - Unit to convert from
 * @param toUnit - Unit to convert to
 * @param ingredientName - Optional: ingredient name for density-based conversions
 * @returns Converted quantity or null if conversion not possible
 */
export function convertBetweenUnits(
  quantity: number,
  fromUnit: string | null,
  toUnit: string | null,
  ingredientName: string | null = null
): number | null {
  // Validate inputs
  if (quantity < 0 || !isFinite(quantity)) {
    console.log(`[CONVERT] Invalid quantity: ${quantity}`);
    return null;
  }

  if (!fromUnit || !toUnit) {
    console.log(
      `[CONVERT] Missing units: fromUnit=${fromUnit}, toUnit=${toUnit}`
    );
    return null;
  }

  console.log(
    `[CONVERT] Starting conversion: ${quantity} ${fromUnit} → ${toUnit}`
  );

  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);

  console.log(
    `[CONVERT] Normalized units: ${fromUnit} → ${normalizedFrom}, ${toUnit} → ${normalizedTo}`
  );

  // Same unit - no conversion needed
  if (normalizedFrom === normalizedTo) {
    console.log(
      `[CONVERT] Units are identical, returning quantity as-is: ${quantity}`
    );
    return quantity;
  }

  const fromInfo = UNIT_CONVERSIONS[normalizedFrom];
  const toInfo = UNIT_CONVERSIONS[normalizedTo];

  console.log(`[CONVERT] Unit info:`, {
    from: {
      normalized: normalizedFrom,
      found: !!fromInfo,
      baseUnit: fromInfo?.baseUnit,
      toBaseUnit: fromInfo?.toBaseUnit,
    },
    to: {
      normalized: normalizedTo,
      found: !!toInfo,
      baseUnit: toInfo?.baseUnit,
      toBaseUnit: toInfo?.toBaseUnit,
    },
  });

  // Either unit not recognized
  if (!fromInfo || !toInfo) {
    console.log(
      `[CONVERT] Unit not recognized: fromInfo=${!!fromInfo}, toInfo=${!!toInfo}`
    );
    return null;
  }

  // Cannot convert if no base unit
  if (fromInfo.baseUnit === null || toInfo.baseUnit === null) {
    console.log(
      `[CONVERT] Cannot convert non-convertible units (no base unit): from=${fromInfo.baseUnit}, to=${toInfo.baseUnit}`
    );
    return null;
  }

  // Cannot convert if base units don't match - try density-based conversion
  if (fromInfo.baseUnit !== toInfo.baseUnit) {
    console.log(
      `[CONVERT] Base units don't match: ${fromInfo.baseUnit} vs ${toInfo.baseUnit}`
    );

    // Try density-based conversion if ingredient name provided
    if (ingredientName) {
      console.log(
        `[CONVERT] Attempting density-based conversion for "${ingredientName}"`
      );

      // Check if converting from volume to weight
      if (isVolumeUnit(normalizedFrom) && isWeightUnit(normalizedTo)) {
        console.log(`[CONVERT] Volume → Weight conversion`);
        const result = convertVolumToWeight(
          quantity,
          normalizedFrom,
          normalizedTo,
          ingredientName
        );
        if (result !== null) {
          console.log(
            `[CONVERT] Density conversion successful: ${quantity} ${normalizedFrom} = ${result.value} ${normalizedTo}`
          );
          return Math.round(result.value * 100000) / 100000;
        }
      }

      // Check if converting from weight to volume
      if (isWeightUnit(normalizedFrom) && isVolumeUnit(normalizedTo)) {
        console.log(`[CONVERT] Weight → Volume conversion`);
        const result = convertWeightToVolume(
          quantity,
          normalizedFrom,
          normalizedTo,
          ingredientName
        );
        if (result !== null) {
          console.log(
            `[CONVERT] Density conversion successful: ${quantity} ${normalizedFrom} = ${result.value} ${normalizedTo}`
          );
          return Math.round(result.value * 100000) / 100000;
        }
      }

      console.log(
        `[CONVERT] Density-based conversion failed or not applicable`
      );
    }

    console.log(
      `[CONVERT] Cannot convert incompatible units without ingredient data`
    );
    return null;
  }

  // Convert via base unit
  // fromQuantity * (fromUnit -> baseUnit) / (toUnit -> baseUnit)
  const valueInBaseUnit = quantity * fromInfo.toBaseUnit;
  const convertedValue = valueInBaseUnit / toInfo.toBaseUnit;

  console.log(`[CONVERT] Conversion math:`, {
    quantity,
    fromUnit: normalizedFrom,
    toBaseUnit: fromInfo.toBaseUnit,
    valueInBaseUnit,
    toUnit: normalizedTo,
    toConversionFactor: toInfo.toBaseUnit,
    convertedValue,
  });

  // Round to reasonable precision (avoid floating point errors)
  const result = Math.round(convertedValue * 100000) / 100000;

  console.log(
    `[CONVERT] Final result: ${quantity} ${normalizedFrom} = ${result} ${normalizedTo}`
  );

  return result;
}

/**
 * Get information about a unit
 * Returns null if unit not recognized
 */
export function getUnitInfo(unit: string | null) {
  if (!unit) return null;

  const normalized = normalizeUnit(unit);
  return UNIT_CONVERSIONS[normalized] || null;
}

/**
 * Check if a unit is recognized by the system
 */
export function isKnownUnit(unit: string | null): boolean {
  if (!unit) return false;

  const normalized = normalizeUnit(unit);
  return !!UNIT_CONVERSIONS[normalized];
}

/**
 * Get the base unit for a given unit (e.g., 'ml' for 'cup')
 * Returns null if unit is not convertible
 */
export function getBaseUnit(unit: string | null): string | null {
  const info = getUnitInfo(unit);
  return info?.baseUnit || null;
}

/**
 * Check if two units are in the same measurement system
 * (both volume, both weight, both count, etc.)
 */
export function isSameSystem(
  unit1: string | null,
  unit2: string | null
): boolean {
  if (!unit1 || !unit2) return false;

  const info1 = getUnitInfo(unit1);
  const info2 = getUnitInfo(unit2);

  if (!info1 || !info2) return false;

  return info1.system === info2.system;
}
