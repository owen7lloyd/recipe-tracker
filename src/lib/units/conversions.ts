/**
 * Unit conversion tables for cooking measurements
 * All conversions use a standardized base unit for each measurement system
 */

/**
 * Volume conversions - all converted to milliliters (ml) as base unit
 */
export const VOLUME_TO_ML: Record<string, number> = {
  // US/Imperial volume
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

/**
 * Weight conversions - all converted to grams (g) as base unit
 */
export const WEIGHT_TO_G: Record<string, number> = {
  // US/Imperial weight
  oz: 28.3495,
  lb: 453.592,

  // Metric weight
  g: 1,
  kg: 1000,
};

/**
 * Count units - these cannot be converted to other measurement systems
 */
export const COUNT_UNITS = new Set([
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

/**
 * Packaging units - these cannot be converted to other measurement systems
 */
export const PACKAGING_UNITS = new Set([
  'can',
  'jar',
  'bottle',
  'bag',
  'box',
  'package',
  'container',
  'carton',
]);

/**
 * Baking/specialty units - these cannot be converted to other measurement systems
 */
export const SPECIALTY_UNITS = new Set([
  'stick',
  'packet',
  'loaf',
  'sheet',
  'pinch',
  'dash',
  'drop',
  'scoop',
  'serving',
]);

/**
 * Determine the measurement system a unit belongs to
 */
export function getUnitSystem(
  unit: string
): 'volume' | 'weight' | 'count' | 'packaging' | 'specialty' | 'unknown' {
  if (VOLUME_TO_ML[unit]) return 'volume';
  if (WEIGHT_TO_G[unit]) return 'weight';
  if (COUNT_UNITS.has(unit)) return 'count';
  if (PACKAGING_UNITS.has(unit)) return 'packaging';
  if (SPECIALTY_UNITS.has(unit)) return 'specialty';
  return 'unknown';
}

/**
 * Check if two units are compatible (can be converted to each other)
 */
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const system1 = getUnitSystem(unit1);
  const system2 = getUnitSystem(unit2);
  return system1 !== 'unknown' && system1 === system2;
}
