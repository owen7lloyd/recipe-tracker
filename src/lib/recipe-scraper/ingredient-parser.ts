/**
 * Ingredient String Parser
 * Parses ingredient strings from recipes into structured data
 */

export interface ParsedIngredient {
  quantity?: number;
  unit?: string;
  name: string;
  notes?: string;
  original: string;
}

/**
 * Unicode fraction map
 */
const UNICODE_FRACTIONS: Record<string, string> = {
  '¼': '1/4',
  '½': '1/2',
  '¾': '3/4',
  '⅐': '1/7',
  '⅑': '1/9',
  '⅒': '1/10',
  '⅓': '1/3',
  '⅔': '2/3',
  '⅕': '1/5',
  '⅖': '2/5',
  '⅗': '3/5',
  '⅘': '4/5',
  '⅙': '1/6',
  '⅚': '5/6',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

/**
 * Convert unicode fractions to ASCII fractions
 */
function normalizeUnicodeFractions(str: string): string {
  let result = str;
  for (const [unicode, ascii] of Object.entries(UNICODE_FRACTIONS)) {
    result = result.replace(new RegExp(unicode, 'g'), ` ${ascii}`);
  }
  return result;
}

/**
 * Parse a quantity string that may include fractions
 * Examples: "2", "1/2", "1 1/2", "0.5", "2⅓"
 */
export function parseQuantity(quantityStr: string): number | null {
  if (!quantityStr || quantityStr.trim() === '') return null;

  // Normalize unicode fractions first
  const normalized = normalizeUnicodeFractions(quantityStr.trim());
  const str = normalized.trim();

  // Handle fractions like "1/2" or "1 1/2"
  if (str.includes('/')) {
    const parts = str.split(/\s+/);
    let total = 0;

    for (const part of parts) {
      if (part.includes('/')) {
        const [num, denom] = part.split('/').map(Number);
        if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
          total += num / denom;
        }
      } else {
        const num = parseFloat(part);
        if (!isNaN(num)) {
          total += num;
        }
      }
    }

    return total > 0 ? total : null;
  }

  // Handle decimal numbers
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Common cooking units
 */
const UNITS = [
  // Volume
  'cup',
  'cups',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'tbs',
  'teaspoon',
  'teaspoons',
  'tsp',
  'milliliter',
  'milliliters',
  'ml',
  'liter',
  'liters',
  'l',
  'fluid ounce',
  'fluid ounces',
  'fl oz',
  'pint',
  'pints',
  'quart',
  'quarts',
  'gallon',
  'gallons',
  // Weight
  'ounce',
  'ounces',
  'oz',
  'pound',
  'pounds',
  'lb',
  'lbs',
  'gram',
  'grams',
  'g',
  'kilogram',
  'kilograms',
  'kg',
  // Other
  'piece',
  'pieces',
  'slice',
  'slices',
  'clove',
  'cloves',
  'can',
  'cans',
  'package',
  'packages',
  'pkg',
  'pinch',
  'dash',
  'handful',
  'bunch',
];

/**
 * Normalize unit to a standard form
 */
export function normalizeUnit(unit: string): string {
  const normalized = unit.toLowerCase().trim();

  // Map common variations to standard units
  const unitMap: Record<string, string> = {
    tbsp: 'tablespoon',
    tbs: 'tablespoon',
    tablespoons: 'tablespoon',
    tsp: 'teaspoon',
    teaspoons: 'teaspoon',
    cups: 'cup',
    oz: 'ounce',
    ounces: 'ounce',
    'fl oz': 'fluid ounce',
    'fluid ounces': 'fluid ounce',
    lb: 'pound',
    lbs: 'pound',
    pounds: 'pound',
    g: 'gram',
    grams: 'gram',
    kg: 'kilogram',
    kilograms: 'kilogram',
    ml: 'milliliter',
    milliliters: 'milliliter',
    l: 'liter',
    liters: 'liter',
    pints: 'pint',
    quarts: 'quart',
    gallons: 'gallon',
    pieces: 'piece',
    slices: 'slice',
    cloves: 'clove',
    cans: 'can',
    packages: 'package',
    pkg: 'package',
  };

  return unitMap[normalized] || normalized;
}

/**
 * Parse an ingredient string into structured data
 * Examples:
 *   "2 cups all-purpose flour"
 *   "1/2 teaspoon salt"
 *   "1 pound ground beef, browned"
 *   "3-4 tomatoes, diced"
 *   "2 ⅓ cups mashed bananas"
 *   "Salt and pepper to taste"
 */
export function parseIngredient(ingredientString: string): ParsedIngredient {
  const original = ingredientString.trim();

  // Normalize unicode fractions in the entire string first
  const normalized = normalizeUnicodeFractions(original);

  let quantity: number | undefined = undefined;
  let unit: string | undefined = undefined;
  let name = '';
  let notes: string | undefined = undefined;

  // Split by comma to separate notes (e.g., "1 cup flour, sifted")
  const [mainPart, ...noteParts] = normalized.split(',').map((s) => s.trim());
  if (noteParts.length > 0) {
    notes = noteParts.join(', ');
  }

  // Regular expression to match quantity and unit
  // Matches patterns like: "2", "1/2", "1 1/2", "2.5"
  const quantityPattern = /^(\d+(?:\/\d+)?(?:\s+\d+\/\d+)?|\d+\.\d+)/;
  const match = mainPart.match(quantityPattern);

  if (match) {
    const quantityStr = match[1];
    quantity = parseQuantity(quantityStr) || undefined;

    // Remove quantity from string
    let remaining = mainPart.substring(match[0].length).trim();

    // Try to match a unit
    const lowerRemaining = remaining.toLowerCase();
    let matchedUnit: string | null = null;
    let matchedLength = 0;

    // Find the longest matching unit at the start
    for (const u of UNITS) {
      if (lowerRemaining.startsWith(u)) {
        if (u.length > matchedLength) {
          matchedUnit = u;
          matchedLength = u.length;
        }
      }
    }

    if (matchedUnit) {
      unit = normalizeUnit(matchedUnit);
      remaining = remaining.substring(matchedLength).trim();
    }

    name = remaining;
  } else {
    // No quantity found, treat entire main part as name
    name = mainPart;
  }

  // Clean up name - remove extra whitespace
  name = name.trim();

  return {
    quantity,
    unit,
    name,
    notes,
    original,
  };
}

/**
 * Parse multiple ingredient strings
 */
export function parseIngredients(
  ingredientStrings: string[]
): ParsedIngredient[] {
  return ingredientStrings.map(parseIngredient);
}
