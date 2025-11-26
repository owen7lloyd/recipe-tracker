/**
 * Comprehensive list of cooking measurement units
 * Available for all pantry items regardless of ingredient type
 */

export const COOKING_UNITS = [
  // Volume - Small
  { value: 'tsp', label: 'Teaspoon (tsp)', category: 'volume' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)', category: 'volume' },
  { value: 'fl oz', label: 'Fluid Ounce (fl oz)', category: 'volume' },
  { value: 'cup', label: 'Cup', category: 'volume' },
  { value: 'pint', label: 'Pint', category: 'volume' },
  { value: 'quart', label: 'Quart', category: 'volume' },
  { value: 'gallon', label: 'Gallon', category: 'volume' },

  // Volume - Metric
  { value: 'ml', label: 'Milliliter (ml)', category: 'volume' },
  { value: 'liter', label: 'Liter (L)', category: 'volume' },

  // Weight - Imperial
  { value: 'oz', label: 'Ounce (oz)', category: 'weight' },
  { value: 'lb', label: 'Pound (lb)', category: 'weight' },

  // Weight - Metric
  { value: 'g', label: 'Gram (g)', category: 'weight' },
  { value: 'kg', label: 'Kilogram (kg)', category: 'weight' },

  // Count
  { value: 'whole', label: 'Whole', category: 'count' },
  { value: 'piece', label: 'Piece', category: 'count' },
  { value: 'slice', label: 'Slice', category: 'count' },
  { value: 'clove', label: 'Clove', category: 'count' },
  { value: 'head', label: 'Head', category: 'count' },
  { value: 'bunch', label: 'Bunch', category: 'count' },
  { value: 'sprig', label: 'Sprig', category: 'count' },
  { value: 'leaf', label: 'Leaf', category: 'count' },
  { value: 'stalk', label: 'Stalk', category: 'count' },
  { value: 'ear', label: 'Ear', category: 'count' },
  { value: 'fillet', label: 'Fillet', category: 'count' },
  { value: 'link', label: 'Link', category: 'count' },
  { value: 'dozen', label: 'Dozen', category: 'count' },

  // Packaging
  { value: 'can', label: 'Can', category: 'packaging' },
  { value: 'jar', label: 'Jar', category: 'packaging' },
  { value: 'bottle', label: 'Bottle', category: 'packaging' },
  { value: 'bag', label: 'Bag', category: 'packaging' },
  { value: 'box', label: 'Box', category: 'packaging' },
  { value: 'package', label: 'Package', category: 'packaging' },
  { value: 'container', label: 'Container', category: 'packaging' },
  { value: 'carton', label: 'Carton', category: 'packaging' },

  // Baking
  { value: 'stick', label: 'Stick', category: 'other' },
  { value: 'packet', label: 'Packet', category: 'other' },
  { value: 'loaf', label: 'Loaf', category: 'count' },
  { value: 'sheet', label: 'Sheet', category: 'count' },

  // Special
  { value: 'pinch', label: 'Pinch', category: 'other' },
  { value: 'dash', label: 'Dash', category: 'other' },
  { value: 'drop', label: 'Drop', category: 'other' },
  { value: 'scoop', label: 'Scoop', category: 'other' },
  { value: 'serving', label: 'Serving', category: 'other' },
] as const;

export type CookingUnit = (typeof COOKING_UNITS)[number]['value'];

/**
 * Smart unit suggestions based on ingredient category
 * Maps ingredient categories to their most relevant measurement units
 */
export const CATEGORY_UNIT_MAP: Record<string, string[]> = {
  // Produce: prefer count-based, then volume, then weight
  produce: ['whole', 'piece', 'bunch', 'head', 'cup', 'lb', 'oz', 'g', 'kg'],

  // Dairy: prefer volume for liquids, weight for cheese/butter
  dairy: ['cup', 'oz', 'lb', 'g', 'tbsp', 'tsp', 'ml', 'liter'],

  // Meat & Seafood: prefer weight units
  meat: ['lb', 'kg', 'oz', 'g', 'piece', 'fillet', 'whole'],
  seafood: ['lb', 'kg', 'oz', 'g', 'piece', 'fillet', 'whole'],

  // Pantry: prefer volume for dry goods, with weight as backup
  pantry: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'pinch'],

  // Frozen: prefer packaging and weight
  frozen: ['package', 'bag', 'box', 'oz', 'lb', 'g', 'kg', 'cup'],

  // Bakery: prefer count-based units
  bakery: ['whole', 'piece', 'slice', 'loaf', 'dozen', 'package'],

  // Other/default: show common units first
  other: ['cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'whole', 'piece'],
};

/**
 * Get suggested units for an ingredient category
 * Returns up to 7 most relevant units for the category
 */
export function getSuggestedUnits(category?: string) {
  if (!category || !CATEGORY_UNIT_MAP[category]) {
    category = 'other';
  }

  const suggestedValues = CATEGORY_UNIT_MAP[category];
  const suggested = suggestedValues
    .map((value) => COOKING_UNITS.find((u) => u.value === value))
    .filter((u): u is (typeof COOKING_UNITS)[number] => u !== undefined);

  return suggested;
}

/**
 * Get units organized by category for the expanded view
 */
export function getOrganizedUnits() {
  return {
    volume: COOKING_UNITS.filter((u) => u.category === 'volume'),
    weight: COOKING_UNITS.filter((u) => u.category === 'weight'),
    count: COOKING_UNITS.filter((u) => u.category === 'count'),
    packaging: COOKING_UNITS.filter((u) => u.category === 'packaging'),
    other: COOKING_UNITS.filter((u) => u.category === 'other'),
  };
}
