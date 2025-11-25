/**
 * Ingredient density reference data
 * Densities are stored as grams per milliliter (ml)
 * Used to convert between volume and weight measurements
 *
 * Sources:
 * - USDA Food Data Central
 * - King Arthur Baking Company
 * - Common baking reference tables
 * - Cooking conversions tables
 */

// Category-based default densities for fallback
const CATEGORY_DENSITIES: Record<string, number> = {
  // Produce (vegetables/fruits) - mostly water ~0.9-1.0
  produce: 0.95,
  // Meats - slightly denser than water
  meat: 1.05,
  seafood: 1.03,
  // Dairy
  dairy: 1.02,
  // Pantry staples
  pantry: 0.75,
  // Frozen items
  frozen: 0.95,
  // Bakery
  bakery: 0.85,
  // Other
  other: 0.9,
};

// Common ingredient densities (grams per milliliter)
export const INGREDIENT_DENSITIES: Record<string, number> = {
  // ===== FLOURS =====
  'all-purpose flour': 0.125,
  'bread flour': 0.135,
  'cake flour': 0.11,
  'whole wheat flour': 0.12,
  'almond flour': 0.1,
  'chickpea flour': 0.11,
  'rice flour': 0.12,
  'oat flour': 0.1,
  'rye flour': 0.13,
  'spelt flour': 0.13,
  'buckwheat flour': 0.12,
  flour: 0.125,

  // ===== SUGARS & SWEETENERS =====
  'granulated sugar': 0.8,
  'brown sugar': 0.85,
  'powdered sugar': 0.5,
  'muscovado sugar': 0.85,
  'demerara sugar': 0.8,
  'caster sugar': 0.8,
  sugar: 0.8,
  'agave nectar': 1.4,
  'agave syrup': 1.4,

  // ===== LIQUIDS & OILS =====
  water: 1.0,
  milk: 1.03,
  'whole milk': 1.03,
  '2% milk': 1.02,
  'skim milk': 1.035,
  'almond milk': 1.0,
  'oat milk': 1.0,
  'coconut milk': 0.97,
  buttermilk: 1.03,
  'heavy cream': 1.0,
  'sour cream': 1.0,
  yogurt: 1.0,
  'greek yogurt': 1.05,
  oil: 0.92,
  'olive oil': 0.92,
  'vegetable oil': 0.92,
  'canola oil': 0.92,
  'coconut oil': 0.92,
  'sesame oil': 0.92,
  'avocado oil': 0.92,
  'peanut oil': 0.92,
  butter: 0.96,
  'browned butter': 0.96,
  honey: 1.42,
  'maple syrup': 1.38,
  molasses: 1.45,
  'blackstrap molasses': 1.45,
  'corn syrup': 1.38,
  'brown rice syrup': 1.35,
  vinegar: 1.0,
  'apple cider vinegar': 1.0,
  'balsamic vinegar': 1.05,
  'white vinegar': 1.0,
  'rice vinegar': 1.0,
  'wine vinegar': 1.0,
  'lemon juice': 1.0,
  'lime juice': 1.0,
  'orange juice': 1.04,
  'tomato juice': 1.04,
  egg: 1.03,
  'egg white': 1.03,
  'egg yolk': 1.08,

  // ===== COCOA & CHOCOLATE =====
  'cocoa powder': 0.4,
  'baking cocoa': 0.4,
  'dutch cocoa': 0.45,
  'chocolate chips': 0.6,
  'dark chocolate chips': 0.6,
  'white chocolate chips': 0.6,

  // ===== BAKING STAPLES =====
  'baking soda': 0.83,
  'baking powder': 0.9,
  yeast: 0.5,
  'active dry yeast': 0.5,
  'instant yeast': 0.5,
  cornstarch: 0.6,
  'arrowroot powder': 0.7,
  'tapioca starch': 0.6,
  'potato starch': 0.6,

  // ===== SALT & SEASONINGS =====
  salt: 1.2,
  'sea salt': 1.2,
  'kosher salt': 1.1,
  'table salt': 1.2,
  'black pepper': 0.6,
  'white pepper': 0.6,
  'cayenne pepper': 0.55,
  'chili powder': 0.65,
  paprika: 0.65,
  cinnamon: 0.5,
  'vanilla extract': 0.98,
  'almond extract': 0.99,
  'peppermint extract': 0.99,
  'lemon extract': 0.98,
  'garlic powder': 1.0,
  'onion powder': 1.0,
  'curry powder': 0.7,
  'ginger powder': 0.7,
  cumin: 0.7,
  turmeric: 0.7,
  cardamom: 0.75,
  nutmeg: 0.6,
  cloves: 1.0,
  allspice: 0.7,
  'anise seeds': 0.75,
  'caraway seeds': 0.65,
  'celery seeds': 0.75,
  'fennel seeds': 0.65,
  'mustard seeds': 0.9,
  'sesame seeds': 0.75,
  'poppy seeds': 0.9,
  basil: 0.3,
  oregano: 0.35,
  thyme: 0.35,
  rosemary: 0.35,
  mint: 0.2,
  parsley: 0.2,
  chives: 0.2,

  // ===== NUTS & NUT BUTTERS =====
  'peanut butter': 1.0,
  'almond butter': 1.0,
  'cashew butter': 1.0,
  tahini: 1.08,
  almonds: 0.6,
  peanuts: 0.6,
  cashews: 0.55,
  walnuts: 0.5,
  pecans: 0.5,
  'macadamia nuts': 0.55,
  'pine nuts': 0.6,
  hazelnuts: 0.5,
  'brazil nuts': 0.55,

  // ===== GRAINS & STARCHES =====
  oats: 0.13,
  'rolled oats': 0.13,
  'steel cut oats': 0.13,
  rice: 0.8,
  'brown rice': 0.8,
  'white rice': 0.8,
  'basmati rice': 0.8,
  'jasmine rice': 0.8,
  'arborio rice': 0.8,
  quinoa: 0.8,
  couscous: 0.6,
  polenta: 0.6,
  cornmeal: 0.65,
  barley: 0.75,
  'wheat berries': 0.8,
  lentils: 0.8,
  'dried pasta': 0.45,
  noodles: 0.45,
  'lasagna noodles': 0.45,
  spaghetti: 0.45,
  penne: 0.45,
  macaroni: 0.45,

  // ===== PRODUCE (FRESH) =====
  carrot: 0.95,
  onion: 0.95,
  garlic: 0.95,
  potato: 1.08,
  'sweet potato': 1.0,
  tomato: 0.95,
  broccoli: 0.92,
  cauliflower: 0.92,
  spinach: 0.92,
  lettuce: 0.92,
  kale: 0.92,
  cabbage: 0.95,
  'bell pepper': 0.92,
  cucumber: 0.95,
  zucchini: 0.95,
  apple: 0.92,
  banana: 0.95,
  blueberry: 0.97,
  strawberry: 0.92,
  raspberry: 0.92,
  lemon: 0.95,
  lime: 0.95,
  orange: 0.95,
  avocado: 0.92,
  celery: 0.95,
  asparagus: 0.92,
  'green beans': 0.92,
  mushroom: 0.92,
  eggplant: 0.92,
  pumpkin: 0.92,
  squash: 0.92,

  // ===== BEANS & LEGUMES =====
  chickpeas: 0.8,
  'black beans': 0.8,
  'kidney beans': 0.8,
  'pinto beans': 0.8,
  'white beans': 0.8,
  'split peas': 0.8,

  // ===== MEAT & SEAFOOD =====
  chicken: 1.05,
  beef: 1.05,
  pork: 1.05,
  lamb: 1.05,
  fish: 1.03,
  salmon: 1.03,
  tuna: 1.03,
  shrimp: 1.05,
  'ground meat': 1.05,
  sausage: 1.05,
  bacon: 1.05,

  // ===== DAIRY PRODUCTS =====
  cheese: 1.0,
  'cheddar cheese': 1.0,
  'mozzarella cheese': 1.0,
  'parmesan cheese': 1.05,
  'cream cheese': 1.05,
  ricotta: 1.05,
  'cottage cheese': 1.03,

  // ===== PREPARED ITEMS =====
  jam: 1.2,
  jelly: 1.2,
  pesto: 1.1,
  hummus: 1.05,
  'tomato sauce': 1.04,
  'soy sauce': 1.08,
  'worcestershire sauce': 1.05,
};

/**
 * Result from density lookup
 */
export interface DensityLookupResult {
  density: number;
  isExactMatch: boolean;
  isPartialMatch: boolean;
  isDefaultMatch: boolean;
  sourceKey?: string;
}

/**
 * Get density for an ingredient by name
 * Tries exact match first, then partial matches, then category defaults
 *
 * @param ingredientName - Name of the ingredient
 * @param category - Optional category for fallback density
 * @returns DensityLookupResult with density and match type, or null if no match and no category
 */
export function getDensityForIngredient(
  ingredientName: string | null,
  category?: string
): DensityLookupResult | null {
  if (!ingredientName) {
    if (category && CATEGORY_DENSITIES[category]) {
      return {
        density: CATEGORY_DENSITIES[category],
        isExactMatch: false,
        isPartialMatch: false,
        isDefaultMatch: true,
      };
    }
    return null;
  }

  const normalized = ingredientName.toLowerCase().trim();

  // Try exact match first
  if (INGREDIENT_DENSITIES[normalized]) {
    return {
      density: INGREDIENT_DENSITIES[normalized],
      isExactMatch: true,
      isPartialMatch: false,
      isDefaultMatch: false,
      sourceKey: normalized,
    };
  }

  // Try to find a partial match
  for (const [key, density] of Object.entries(INGREDIENT_DENSITIES)) {
    if (
      normalized.includes(key) ||
      key.includes(normalized) ||
      normalized.startsWith(key)
    ) {
      return {
        density,
        isExactMatch: false,
        isPartialMatch: true,
        isDefaultMatch: false,
        sourceKey: key,
      };
    }
  }

  // Fall back to category density if available
  if (category && CATEGORY_DENSITIES[category]) {
    return {
      density: CATEGORY_DENSITIES[category],
      isExactMatch: false,
      isPartialMatch: false,
      isDefaultMatch: true,
    };
  }

  // Final fallback to generic "other" density
  return {
    density: CATEGORY_DENSITIES['other'],
    isExactMatch: false,
    isPartialMatch: false,
    isDefaultMatch: true,
  };
}

/**
 * Result from volume-to-weight conversion
 */
export interface ConversionResult {
  value: number;
  densityUsed: {
    density: number;
    isExactMatch: boolean;
    isPartialMatch: boolean;
    isDefaultMatch: boolean;
  };
}

/**
 * Convert between volume and weight using ingredient density
 *
 * @param quantity - The quantity to convert
 * @param fromUnit - Unit to convert from (volume unit like ml, cup)
 * @param toUnit - Unit to convert to (weight unit like g, oz)
 * @param ingredientName - Name of ingredient (for density lookup)
 * @param category - Optional category for fallback density
 * @returns ConversionResult with converted value and density info, or null if conversion not possible
 */
export function convertVolumToWeight(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  ingredientName: string | null,
  category?: string
): ConversionResult | null {
  // Get density for this ingredient
  const lookupResult = getDensityForIngredient(ingredientName, category);
  if (lookupResult === null) {
    return null;
  }

  const { density, isExactMatch, isPartialMatch, isDefaultMatch } =
    lookupResult;

  // First convert volume to ml
  const volumeToMl = getVolumeToMlConversion(fromUnit);
  if (volumeToMl === null) {
    return null;
  }

  const quantityInMl = quantity * volumeToMl;
  const quantityInGrams = quantityInMl * density;

  // Now convert grams to target weight unit
  const gramsToTarget = getGramsToWeightConversion(toUnit);
  if (gramsToTarget === null) {
    return null;
  }

  const result = quantityInGrams * gramsToTarget;

  return {
    value: result,
    densityUsed: {
      density,
      isExactMatch,
      isPartialMatch,
      isDefaultMatch,
    },
  };
}

/**
 * Convert between weight and volume using ingredient density
 *
 * @param quantity - The quantity to convert
 * @param fromUnit - Unit to convert from (weight unit like g, oz)
 * @param toUnit - Unit to convert to (volume unit like ml, cup)
 * @param ingredientName - Name of ingredient (for density lookup)
 * @param category - Optional category for fallback density
 * @returns ConversionResult with converted value and density info, or null if conversion not possible
 */
export function convertWeightToVolume(
  quantity: number,
  fromUnit: string,
  toUnit: string,
  ingredientName: string | null,
  category?: string
): ConversionResult | null {
  // Get density for this ingredient
  const lookupResult = getDensityForIngredient(ingredientName, category);
  if (lookupResult === null) {
    return null;
  }

  const { density, isExactMatch, isPartialMatch, isDefaultMatch } =
    lookupResult;

  // First convert weight to grams
  const weightToGrams = getWeightToGramsConversion(fromUnit);
  if (weightToGrams === null) {
    return null;
  }

  const quantityInGrams = quantity * weightToGrams;
  const quantityInMl = quantityInGrams / density;

  // Now convert ml to target volume unit
  const mlToTarget = getMlToVolumeConversion(toUnit);
  if (mlToTarget === null) {
    return null;
  }

  const result = quantityInMl * mlToTarget;

  return {
    value: result,
    densityUsed: {
      density,
      isExactMatch,
      isPartialMatch,
      isDefaultMatch,
    },
  };
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
