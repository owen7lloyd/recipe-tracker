/**
 * Ingredient density reference data
 * Densities are stored as grams per milliliter (ml)
 * Used to convert between volume and weight measurements
 *
 * Sources:
 * - USDA Food Data Central
 * - King Arthur Baking Company
 * - Common baking reference tables
 */

// Common ingredient densities (grams per milliliter)
export const INGREDIENT_DENSITIES: Record<string, number> = {
  // Flours
  'all-purpose flour': 0.125,
  'bread flour': 0.135,
  'cake flour': 0.11,
  'whole wheat flour': 0.12,
  flour: 0.125,

  // Sugars
  'granulated sugar': 0.8,
  'brown sugar': 0.85,
  'powdered sugar': 0.5,
  sugar: 0.8,

  // Liquids (approximately 1.0 for water-based)
  water: 1.0,
  milk: 1.03,
  buttermilk: 1.03,
  'heavy cream': 1.0,
  'sour cream': 1.0,
  yogurt: 1.0,
  oil: 0.92,
  'olive oil': 0.92,
  'vegetable oil': 0.92,
  butter: 0.96, // melted
  honey: 1.42,
  'maple syrup': 1.38,
  molasses: 1.45,
  vinegar: 1.0,
  'lemon juice': 1.0,
  egg: 1.03, // liquid eggs

  // Cocoa and chocolate
  'cocoa powder': 0.4,
  'baking cocoa': 0.4,
  'chocolate chips': 0.6,

  // Baking soda/powder
  'baking soda': 0.83,
  'baking powder': 0.9,
  yeast: 0.5,

  // Salt and spices
  salt: 1.2,
  'sea salt': 1.2,
  'black pepper': 0.6,
  cinnamon: 0.5,
  'vanilla extract': 0.98,

  // Nuts and seeds
  'peanut butter': 1.0,
  'almond butter': 1.0,
  'sesame seeds': 0.75,
  'pumpkin seeds': 0.7,

  // Common ingredients
  oats: 0.13,
  'rolled oats': 0.13,
  cornstarch: 0.6,
  'corn syrup': 1.38,
};

/**
 * Get density for an ingredient by name
 * Tries exact match first, then partial matches
 *
 * @param ingredientName - Name of the ingredient
 * @returns Density in g/ml, or null if not found
 */
export function getDensityForIngredient(
  ingredientName: string | null
): number | null {
  if (!ingredientName) return null;

  const normalized = ingredientName.toLowerCase().trim();

  // Try exact match first
  if (INGREDIENT_DENSITIES[normalized]) {
    return INGREDIENT_DENSITIES[normalized];
  }

  // Try to find a partial match
  for (const [key, density] of Object.entries(INGREDIENT_DENSITIES)) {
    if (
      normalized.includes(key) ||
      key.includes(normalized) ||
      normalized.startsWith(key)
    ) {
      return density;
    }
  }

  return null;
}

/**
 * Convert between volume and weight using ingredient density
 *
 * @param quantity - The quantity to convert
 * @param fromUnit - Unit to convert from (volume unit like ml, cup)
 * @param toUnit - Unit to convert to (weight unit like g, oz)
 * @param ingredientName - Name of ingredient (for density lookup)
 * @returns Converted quantity or null if conversion not possible
 */
export function convertVolumToWeight(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  ingredientName: string | null
): number | null {
  // Get density for this ingredient
  const density = getDensityForIngredient(ingredientName);
  if (density === null) {
    console.log(`[DENSITY] No density data available for "${ingredientName}"`);
    return null;
  }

  console.log(
    `[DENSITY] Using density ${density} g/ml for "${ingredientName}"`
  );

  // First convert volume to ml
  const volumeToMl = getVolumeToMlConversion(fromUnit);
  if (volumeToMl === null) {
    console.log(`[DENSITY] ${fromUnit} is not a volume unit`);
    return null;
  }

  const quantityInMl = quantity * volumeToMl;
  const quantityInGrams = quantityInMl * density;

  console.log(
    `[DENSITY] Conversion: ${quantity} ${fromUnit} → ${quantityInMl} ml → ${quantityInGrams} g`
  );

  // Now convert grams to target weight unit
  const gramsToTarget = getGramsToWeightConversion(toUnit);
  if (gramsToTarget === null) {
    console.log(`[DENSITY] ${toUnit} is not a weight unit`);
    return null;
  }

  const result = quantityInGrams * gramsToTarget;

  console.log(
    `[DENSITY] Final result: ${quantity} ${fromUnit} = ${result} ${toUnit}`
  );

  return result;
}

/**
 * Convert between weight and volume using ingredient density
 *
 * @param quantity - The quantity to convert
 * @param fromUnit - Unit to convert from (weight unit like g, oz)
 * @param toUnit - Unit to convert to (volume unit like ml, cup)
 * @param ingredientName - Name of ingredient (for density lookup)
 * @returns Converted quantity or null if conversion not possible
 */
export function convertWeightToVolume(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  ingredientName: string | null
): number | null {
  // Get density for this ingredient
  const density = getDensityForIngredient(ingredientName);
  if (density === null) {
    console.log(`[DENSITY] No density data available for "${ingredientName}"`);
    return null;
  }

  console.log(
    `[DENSITY] Using density ${density} g/ml for "${ingredientName}"`
  );

  // First convert weight to grams
  const weightToGrams = getWeightToGramsConversion(fromUnit);
  if (weightToGrams === null) {
    console.log(`[DENSITY] ${fromUnit} is not a weight unit`);
    return null;
  }

  const quantityInGrams = quantity * weightToGrams;
  const quantityInMl = quantityInGrams / density;

  console.log(
    `[DENSITY] Conversion: ${quantity} ${fromUnit} → ${quantityInGrams} g → ${quantityInMl} ml`
  );

  // Now convert ml to target volume unit
  const mlToTarget = getMlToVolumeConversion(toUnit);
  if (mlToTarget === null) {
    console.log(`[DENSITY] ${toUnit} is not a volume unit`);
    return null;
  }

  const result = quantityInMl * mlToTarget;

  console.log(
    `[DENSITY] Final result: ${quantity} ${fromUnit} = ${result} ${toUnit}`
  );

  return result;
}

/**
 * Get conversion factor from volume unit to ml
 */
function getVolumeToMlConversion(unit: string): number | null {
  const conversions: Record<string, number> = {
    tsp: 4.92892,
    tbsp: 14.7868,
    'fl oz': 29.5735,
    cup: 236.588,
    pint: 473.176,
    quart: 946.353,
    gallon: 3785.41,
    ml: 1,
    liter: 1000,
  };

  return conversions[unit] || null;
}

/**
 * Get conversion factor from ml to volume unit
 */
function getMlToVolumeConversion(unit: string): number | null {
  const toMl = getVolumeToMlConversion(unit);
  return toMl ? 1 / toMl : null;
}

/**
 * Get conversion factor from weight unit to grams
 */
function getWeightToGramsConversion(unit: string): number | null {
  const conversions: Record<string, number> = {
    oz: 28.3495,
    lb: 453.592,
    g: 1,
    kg: 1000,
  };

  return conversions[unit] || null;
}

/**
 * Get conversion factor from grams to weight unit
 */
function getGramsToWeightConversion(unit: string): number | null {
  const toGrams = getWeightToGramsConversion(unit);
  return toGrams ? 1 / toGrams : null;
}

/**
 * Check if a unit is a volume unit
 */
export function isVolumeUnit(unit: string): boolean {
  const volumeUnits = [
    'tsp',
    'tbsp',
    'fl oz',
    'cup',
    'pint',
    'quart',
    'gallon',
    'ml',
    'liter',
  ];
  return volumeUnits.includes(unit);
}

/**
 * Check if a unit is a weight unit
 */
export function isWeightUnit(unit: string): boolean {
  const weightUnits = ['oz', 'lb', 'g', 'kg'];
  return weightUnits.includes(unit);
}
