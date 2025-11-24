/**
 * Unit conversion utility for cooking measurements
 * Handles conversions between compatible units (e.g., cups to ml, oz to g)
 */

import {
  VOLUME_TO_ML,
  WEIGHT_TO_G,
  getUnitSystem,
  areUnitsCompatible,
} from './conversions';

export interface ConversionResult {
  value: number;
  baseUnit: 'ml' | 'g' | 'count';
  originalUnit: string;
}

/**
 * Convert a quantity from one unit to another
 * Returns the converted value, or null if conversion is not possible
 */
export function convertBetweenUnits(
  fromQuantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  // Return as-is if units are identical
  if (fromUnit === toUnit) {
    return fromQuantity;
  }

  // Check if units are compatible
  if (!areUnitsCompatible(fromUnit, toUnit)) {
    return null;
  }

  const system = getUnitSystem(fromUnit);

  if (system === 'volume') {
    return convertVolume(fromQuantity, fromUnit, toUnit);
  }

  if (system === 'weight') {
    return convertWeight(fromQuantity, fromUnit, toUnit);
  }

  // Count, packaging, and specialty units cannot be converted
  return null;
}

/**
 * Convert volume measurements (all converted via milliliters)
 */
function convertVolume(
  fromQuantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromFactor = VOLUME_TO_ML[fromUnit];
  const toFactor = VOLUME_TO_ML[toUnit];

  if (!fromFactor || !toFactor) {
    return null;
  }

  // Convert to ml, then to target unit
  const inMl = fromQuantity * fromFactor;
  return inMl / toFactor;
}

/**
 * Convert weight measurements (all converted via grams)
 */
function convertWeight(
  fromQuantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromFactor = WEIGHT_TO_G[fromUnit];
  const toFactor = WEIGHT_TO_G[toUnit];

  if (!fromFactor || !toFactor) {
    return null;
  }

  // Convert to grams, then to target unit
  const inGrams = fromQuantity * fromFactor;
  return inGrams / toFactor;
}

/**
 * Convert a quantity to its base unit for comparison
 * Used internally for operations that need normalized values
 */
export function convertToBaseUnit(
  quantity: number,
  unit: string
): ConversionResult | null {
  const system = getUnitSystem(unit);

  if (system === 'volume') {
    const factor = VOLUME_TO_ML[unit];
    if (!factor) return null;
    return {
      value: quantity * factor,
      baseUnit: 'ml',
      originalUnit: unit,
    };
  }

  if (system === 'weight') {
    const factor = WEIGHT_TO_G[unit];
    if (!factor) return null;
    return {
      value: quantity * factor,
      baseUnit: 'g',
      originalUnit: unit,
    };
  }

  // Count-based units cannot be converted to base units
  return null;
}

/**
 * Round a quantity to a reasonable precision
 * Used to avoid floating-point errors from conversions
 */
export function roundQuantity(
  quantity: number,
  decimalPlaces: number = 2
): number {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(quantity * factor) / factor;
}
