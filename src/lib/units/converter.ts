/**
 * Unit Conversion Library
 *
 * Provides conversion between different measurement units for cooking.
 * Supports volume, weight, and count units.
 */

// Base units for each measurement type
export type BaseUnit = 'ml' | 'g' | 'count';

// Unit type categories
export type UnitType = 'volume' | 'weight' | 'count' | 'packaging' | 'special';

// Conversion result
export interface ConversionResult {
  value: number;
  baseUnit: BaseUnit;
  convertible: boolean;
}

// Volume conversions to milliliters (ml)
const VOLUME_TO_ML: Record<string, number> = {
  // Imperial/US volume
  tsp: 4.92892,
  tbsp: 14.7868,
  'fl oz': 29.5735,
  cup: 236.588,
  pint: 473.176,
  quart: 946.353,
  gallon: 3785.41,
  // Metric volume
  ml: 1,
  liter: 1000,
};

// Weight conversions to grams (g)
const WEIGHT_TO_G: Record<string, number> = {
  // Imperial weight
  oz: 28.3495,
  lb: 453.592,
  // Metric weight
  g: 1,
  kg: 1000,
};

// Count-based units (cannot be converted to volume or weight)
const COUNT_UNITS = new Set([
  'whole',
  'piece',
  'slice',
  'clove',
  'head',
  'bunch',
  'sprig',
  'leaf',
  'stalk',
  'ear',
  'fillet',
  'link',
  'dozen',
]);

// Packaging units (cannot be converted)
const PACKAGING_UNITS = new Set([
  'can',
  'jar',
  'bottle',
  'bag',
  'box',
  'package',
  'container',
  'carton',
  'stick',
  'packet',
  'loaf',
  'sheet',
]);

// Special units (cannot be converted)
const SPECIAL_UNITS = new Set(['pinch', 'dash', 'drop', 'scoop', 'serving']);

/**
 * Get the type of a unit
 */
export function getUnitType(unit: string): UnitType {
  const normalizedUnit = unit.toLowerCase().trim();

  if (VOLUME_TO_ML[normalizedUnit] !== undefined) {
    return 'volume';
  }
  if (WEIGHT_TO_G[normalizedUnit] !== undefined) {
    return 'weight';
  }
  if (COUNT_UNITS.has(normalizedUnit)) {
    return 'count';
  }
  if (PACKAGING_UNITS.has(normalizedUnit)) {
    return 'packaging';
  }
  if (SPECIAL_UNITS.has(normalizedUnit)) {
    return 'special';
  }

  // Default to count for unknown units
  return 'count';
}

/**
 * Check if two units can be converted to each other
 */
export function canConvert(unit1: string, unit2: string): boolean {
  if (!unit1 || !unit2) {
    return false;
  }

  const type1 = getUnitType(unit1);
  const type2 = getUnitType(unit2);

  // Units must be of the same type to be convertible
  // Only volume and weight units are convertible within their type
  if (type1 !== type2) {
    return false;
  }

  // Only volume and weight can be converted
  return type1 === 'volume' || type1 === 'weight';
}

/**
 * Check if units are exactly the same (case-insensitive)
 */
export function unitsMatch(
  unit1: string | null,
  unit2: string | null
): boolean {
  if (!unit1 && !unit2) {
    return true;
  }
  if (!unit1 || !unit2) {
    return false;
  }
  return unit1.toLowerCase().trim() === unit2.toLowerCase().trim();
}

/**
 * Convert a quantity to its base unit (ml for volume, g for weight)
 */
export function convertToBaseUnit(
  quantity: number,
  unit: string
): ConversionResult | null {
  if (!unit) {
    return null;
  }

  const normalizedUnit = unit.toLowerCase().trim();
  const unitType = getUnitType(normalizedUnit);

  // Volume conversion
  if (unitType === 'volume') {
    const factor = VOLUME_TO_ML[normalizedUnit];
    if (factor !== undefined) {
      return {
        value: quantity * factor,
        baseUnit: 'ml',
        convertible: true,
      };
    }
  }

  // Weight conversion
  if (unitType === 'weight') {
    const factor = WEIGHT_TO_G[normalizedUnit];
    if (factor !== undefined) {
      return {
        value: quantity * factor,
        baseUnit: 'g',
        convertible: true,
      };
    }
  }

  // Count, packaging, and special units - not convertible to base
  if (
    unitType === 'count' ||
    unitType === 'packaging' ||
    unitType === 'special'
  ) {
    return {
      value: quantity,
      baseUnit: 'count',
      convertible: false,
    };
  }

  return null;
}

/**
 * Convert from base unit back to a target unit
 */
export function convertFromBaseUnit(
  quantity: number,
  baseUnit: BaseUnit,
  targetUnit: string
): number | null {
  if (!targetUnit) {
    return null;
  }

  const normalizedUnit = targetUnit.toLowerCase().trim();
  const unitType = getUnitType(normalizedUnit);

  // Volume conversion from ml
  if (baseUnit === 'ml' && unitType === 'volume') {
    const factor = VOLUME_TO_ML[normalizedUnit];
    if (factor !== undefined) {
      return quantity / factor;
    }
  }

  // Weight conversion from g
  if (baseUnit === 'g' && unitType === 'weight') {
    const factor = WEIGHT_TO_G[normalizedUnit];
    if (factor !== undefined) {
      return quantity / factor;
    }
  }

  // Count units - direct conversion
  if (baseUnit === 'count' && unitType === 'count') {
    return quantity;
  }

  return null;
}

/**
 * Convert a quantity from one unit to another
 * Returns null if conversion is not possible
 */
export function convertBetweenUnits(
  fromQuantity: number,
  fromUnit: string,
  toUnit: string
): number | null {
  // Handle null/undefined/empty units
  if (!fromUnit || !toUnit) {
    return null;
  }

  // If units are the same, no conversion needed
  if (unitsMatch(fromUnit, toUnit)) {
    return fromQuantity;
  }

  // Check if conversion is possible
  if (!canConvert(fromUnit, toUnit)) {
    return null;
  }

  // Convert to base unit
  const baseResult = convertToBaseUnit(fromQuantity, fromUnit);
  if (!baseResult || !baseResult.convertible) {
    return null;
  }

  // Convert from base unit to target
  return convertFromBaseUnit(baseResult.value, baseResult.baseUnit, toUnit);
}

/**
 * Get a human-readable description of why conversion failed
 */
export function getConversionError(
  fromUnit: string | null,
  toUnit: string | null
): string {
  if (!fromUnit || !toUnit) {
    return 'Missing unit information';
  }

  const type1 = getUnitType(fromUnit);
  const type2 = getUnitType(toUnit);

  if (type1 !== type2) {
    return `Cannot convert between ${type1} (${fromUnit}) and ${type2} (${toUnit})`;
  }

  if (type1 === 'count' || type1 === 'packaging' || type1 === 'special') {
    return `${fromUnit} and ${toUnit} are ${type1} units and can only be matched exactly`;
  }

  return 'Unknown conversion error';
}

/**
 * Utility to round a number to a reasonable precision for display
 */
export function roundForDisplay(value: number, precision: number = 2): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
