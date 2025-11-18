/**
 * Comprehensive list of cooking measurement units
 * Available for all pantry items regardless of ingredient type
 */

export const COOKING_UNITS = [
  // Volume - Small
  { value: 'tsp', label: 'Teaspoon (tsp)' },
  { value: 'tbsp', label: 'Tablespoon (tbsp)' },
  { value: 'fl oz', label: 'Fluid Ounce (fl oz)' },
  { value: 'cup', label: 'Cup' },
  { value: 'pint', label: 'Pint' },
  { value: 'quart', label: 'Quart' },
  { value: 'gallon', label: 'Gallon' },

  // Volume - Metric
  { value: 'ml', label: 'Milliliter (ml)' },
  { value: 'liter', label: 'Liter (L)' },

  // Weight - Imperial
  { value: 'oz', label: 'Ounce (oz)' },
  { value: 'lb', label: 'Pound (lb)' },

  // Weight - Metric
  { value: 'g', label: 'Gram (g)' },
  { value: 'kg', label: 'Kilogram (kg)' },

  // Count
  { value: 'whole', label: 'Whole' },
  { value: 'piece', label: 'Piece' },
  { value: 'slice', label: 'Slice' },
  { value: 'clove', label: 'Clove' },
  { value: 'head', label: 'Head' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'sprig', label: 'Sprig' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'stalk', label: 'Stalk' },
  { value: 'ear', label: 'Ear' },
  { value: 'fillet', label: 'Fillet' },
  { value: 'link', label: 'Link' },
  { value: 'dozen', label: 'Dozen' },

  // Packaging
  { value: 'can', label: 'Can' },
  { value: 'jar', label: 'Jar' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'bag', label: 'Bag' },
  { value: 'box', label: 'Box' },
  { value: 'package', label: 'Package' },
  { value: 'container', label: 'Container' },
  { value: 'carton', label: 'Carton' },

  // Baking
  { value: 'stick', label: 'Stick' },
  { value: 'packet', label: 'Packet' },
  { value: 'loaf', label: 'Loaf' },
  { value: 'sheet', label: 'Sheet' },

  // Special
  { value: 'pinch', label: 'Pinch' },
  { value: 'dash', label: 'Dash' },
  { value: 'drop', label: 'Drop' },
  { value: 'scoop', label: 'Scoop' },
  { value: 'serving', label: 'Serving' },
] as const;

export type CookingUnit = typeof COOKING_UNITS[number]['value'];
