/**
 * Unit conversion tables for recipe and pantry management
 * All conversions standardized to base units: ml (volume), g (weight), count (discrete items)
 */

export type UnitSystem =
  | 'volume_imperial'
  | 'volume_metric'
  | 'weight_imperial'
  | 'weight_metric'
  | 'count'
  | 'packaging'
  | 'special';

export interface UnitInfo {
  value: string;
  label: string;
  system: UnitSystem;
  toBaseUnit: number; // Conversion factor to base unit
  baseUnit: 'ml' | 'g' | 'count' | null;
}

/**
 * Unit metadata with conversion factors to base units
 * Base units:
 *   - Volume: ml (milliliters)
 *   - Weight: g (grams)
 *   - Count: 1 (no conversion)
 *   - Packaging/Special: null (no conversion possible)
 */
export const UNIT_CONVERSIONS: Record<string, UnitInfo> = {
  // ===== VOLUME - IMPERIAL (Base: ml) =====
  tsp: {
    value: 'tsp',
    label: 'Teaspoon',
    system: 'volume_imperial',
    toBaseUnit: 4.92892,
    baseUnit: 'ml',
  },
  tbsp: {
    value: 'tbsp',
    label: 'Tablespoon',
    system: 'volume_imperial',
    toBaseUnit: 14.7868,
    baseUnit: 'ml',
  },
  'fl oz': {
    value: 'fl oz',
    label: 'Fluid Ounce',
    system: 'volume_imperial',
    toBaseUnit: 29.5735,
    baseUnit: 'ml',
  },
  cup: {
    value: 'cup',
    label: 'Cup',
    system: 'volume_imperial',
    toBaseUnit: 236.588,
    baseUnit: 'ml',
  },
  pint: {
    value: 'pint',
    label: 'Pint',
    system: 'volume_imperial',
    toBaseUnit: 473.176,
    baseUnit: 'ml',
  },
  quart: {
    value: 'quart',
    label: 'Quart',
    system: 'volume_imperial',
    toBaseUnit: 946.353,
    baseUnit: 'ml',
  },
  gallon: {
    value: 'gallon',
    label: 'Gallon',
    system: 'volume_imperial',
    toBaseUnit: 3785.41,
    baseUnit: 'ml',
  },

  // ===== VOLUME - METRIC (Base: ml) =====
  ml: {
    value: 'ml',
    label: 'Milliliter',
    system: 'volume_metric',
    toBaseUnit: 1,
    baseUnit: 'ml',
  },
  liter: {
    value: 'liter',
    label: 'Liter',
    system: 'volume_metric',
    toBaseUnit: 1000,
    baseUnit: 'ml',
  },

  // ===== WEIGHT - IMPERIAL (Base: g) =====
  oz: {
    value: 'oz',
    label: 'Ounce',
    system: 'weight_imperial',
    toBaseUnit: 28.3495,
    baseUnit: 'g',
  },
  lb: {
    value: 'lb',
    label: 'Pound',
    system: 'weight_imperial',
    toBaseUnit: 453.592,
    baseUnit: 'g',
  },

  // ===== WEIGHT - METRIC (Base: g) =====
  g: {
    value: 'g',
    label: 'Gram',
    system: 'weight_metric',
    toBaseUnit: 1,
    baseUnit: 'g',
  },
  kg: {
    value: 'kg',
    label: 'Kilogram',
    system: 'weight_metric',
    toBaseUnit: 1000,
    baseUnit: 'g',
  },

  // ===== COUNT (discrete items, no conversion) =====
  whole: {
    value: 'whole',
    label: 'Whole',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  piece: {
    value: 'piece',
    label: 'Piece',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  slice: {
    value: 'slice',
    label: 'Slice',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  clove: {
    value: 'clove',
    label: 'Clove',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  head: {
    value: 'head',
    label: 'Head',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  bunch: {
    value: 'bunch',
    label: 'Bunch',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  sprig: {
    value: 'sprig',
    label: 'Sprig',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  leaf: {
    value: 'leaf',
    label: 'Leaf',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  stalk: {
    value: 'stalk',
    label: 'Stalk',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  ear: {
    value: 'ear',
    label: 'Ear',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  fillet: {
    value: 'fillet',
    label: 'Fillet',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  link: {
    value: 'link',
    label: 'Link',
    system: 'count',
    toBaseUnit: 1,
    baseUnit: null,
  },
  dozen: {
    value: 'dozen',
    label: 'Dozen',
    system: 'count',
    toBaseUnit: 12,
    baseUnit: null,
  },

  // ===== PACKAGING (no conversion) =====
  can: {
    value: 'can',
    label: 'Can',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  jar: {
    value: 'jar',
    label: 'Jar',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  bottle: {
    value: 'bottle',
    label: 'Bottle',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  bag: {
    value: 'bag',
    label: 'Bag',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  box: {
    value: 'box',
    label: 'Box',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  package: {
    value: 'package',
    label: 'Package',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  container: {
    value: 'container',
    label: 'Container',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  carton: {
    value: 'carton',
    label: 'Carton',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },

  // ===== BAKING (packaging-like, no conversion) =====
  stick: {
    value: 'stick',
    label: 'Stick',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  packet: {
    value: 'packet',
    label: 'Packet',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  loaf: {
    value: 'loaf',
    label: 'Loaf',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },
  sheet: {
    value: 'sheet',
    label: 'Sheet',
    system: 'packaging',
    toBaseUnit: 1,
    baseUnit: null,
  },

  // ===== SPECIAL MEASURES (no conversion) =====
  pinch: {
    value: 'pinch',
    label: 'Pinch',
    system: 'special',
    toBaseUnit: 1,
    baseUnit: null,
  },
  dash: {
    value: 'dash',
    label: 'Dash',
    system: 'special',
    toBaseUnit: 1,
    baseUnit: null,
  },
  drop: {
    value: 'drop',
    label: 'Drop',
    system: 'special',
    toBaseUnit: 1,
    baseUnit: null,
  },
  scoop: {
    value: 'scoop',
    label: 'Scoop',
    system: 'special',
    toBaseUnit: 1,
    baseUnit: null,
  },
  serving: {
    value: 'serving',
    label: 'Serving',
    system: 'special',
    toBaseUnit: 1,
    baseUnit: null,
  },
};

/**
 * Define which unit systems can be converted to each other
 * This allows cross-system conversions (e.g., ml to cups)
 */
export const CONVERTIBLE_BASE_UNITS: Record<string, string[]> = {
  ml: ['ml'],
  g: ['g'],
  count: ['count'],
};

/**
 * Common unit aliases for flexible user input
 */
export const UNIT_ALIASES: Record<string, string> = {
  // Volume aliases
  teaspoon: 'tsp',
  't: ': 'tsp',
  tablespoon: 'tbsp',
  'T: ': 'tbsp',
  'fluid ounce': 'fl oz',
  'fl. oz.': 'fl oz',
  // Weight aliases
  ounce: 'oz',
  pound: 'lb',
  lbs: 'lb',
  gram: 'g',
  grams: 'g',
  kilogram: 'kg',
  kg: 'kg',
  milliliter: 'ml',
  ml: 'ml',
  liter: 'liter',
  l: 'liter',
};
