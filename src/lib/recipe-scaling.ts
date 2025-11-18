/**
 * Recipe Scaling Library
 *
 * Provides utilities for scaling recipe ingredient quantities and formatting them
 * for display. This module is used by the recipe detail page for interactive scaling
 * and by the cook recipe feature (#11) for portion adjustments.
 *
 * Key Features:
 * - Scale recipe quantities proportionally
 * - Format decimals as readable fractions (1.5 → 1 ½)
 * - Handle non-numeric quantities ("to taste", "pinch", etc.)
 * - Preserve ranges and special notations
 */

export interface ScaledIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
  ingredientCategory: string | null;
  quantity: string | null;
  originalQuantity: string | null;
  scaledQuantity: number | null;
  displayQuantity: string | null;
  unit: string | null;
  notes: string | null;
  optional: boolean | null;
  substitutionGroup?: string | null;
}

export interface ScaledRecipe {
  id: string;
  householdId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
  currentServings: number;
  scaleFactor: number;
  rating?: number | null;
  instructions: string[];
  ingredients: ScaledIngredient[];
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Non-numeric phrases that should not be scaled
 */
const NON_NUMERIC_PHRASES = [
  'to taste',
  'pinch',
  'dash',
  'handful',
  'sprinkle',
  'garnish',
  'as needed',
  'for serving',
];

/**
 * Common fraction mappings for display
 */
const FRACTION_MAP = [
  { decimal: 0.125, display: '⅛', tolerance: 0.02 },
  { decimal: 0.25, display: '¼', tolerance: 0.03 },
  { decimal: 0.333, display: '⅓', tolerance: 0.04 },
  { decimal: 0.375, display: '⅜', tolerance: 0.02 },
  { decimal: 0.5, display: '½', tolerance: 0.03 },
  { decimal: 0.625, display: '⅝', tolerance: 0.02 },
  { decimal: 0.666, display: '⅔', tolerance: 0.04 },
  { decimal: 0.75, display: '¾', tolerance: 0.03 },
  { decimal: 0.875, display: '⅞', tolerance: 0.02 },
];

/**
 * Check if a text contains non-numeric phrases that shouldn't be scaled
 */
function isNonNumeric(text: string | null): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return NON_NUMERIC_PHRASES.some((phrase) => lowerText.includes(phrase));
}

/**
 * Format a decimal quantity as a readable string with fractions
 *
 * Examples:
 * - 0.5 → "½"
 * - 1.5 → "1 ½"
 * - 2.25 → "2 ¼"
 * - 2.33 → "2 ⅓"
 * - 1.67 → "1.67" (no close fraction match)
 */
export function formatQuantity(quantity: number): string {
  if (quantity === 0) return '0';

  const whole = Math.floor(quantity);
  const fractional = quantity - whole;

  // If there's a fractional part, try to find a matching fraction
  if (fractional > 0.01) {
    for (const frac of FRACTION_MAP) {
      if (Math.abs(fractional - frac.decimal) < frac.tolerance) {
        return whole > 0 ? `${whole} ${frac.display}` : frac.display;
      }
    }

    // No close fraction match, use decimal
    // Round to 2 decimal places and remove trailing zeros
    const rounded = (whole + fractional).toFixed(2).replace(/\.?0+$/, '');
    return rounded;
  }

  // No fractional part, just return the whole number
  return whole.toString();
}

/**
 * Parse a quantity string to a number
 * Handles decimal strings like "2.5", "1.25", etc.
 */
function parseQuantity(quantityStr: string | null): number | null {
  if (!quantityStr) return null;

  const parsed = parseFloat(quantityStr);
  return isNaN(parsed) ? null : parsed;
}

interface RecipeIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
  ingredientCategory: string | null;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  optional: boolean | null;
  substitutionGroup?: string | null;
}

interface RecipeInput {
  id: string;
  householdId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
  rating?: number | null;
  instructions: string[];
  ingredients: RecipeIngredient[];
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Scale a recipe to a new serving size
 *
 * @param recipe - The original recipe with ingredients
 * @param newServings - The desired number of servings
 * @returns A new recipe object with scaled quantities
 *
 * @example
 * const recipe = await getRecipeWithIngredients('recipe-id');
 * const scaled = scaleRecipe(recipe, 8); // Scale from 4 to 8 servings
 * console.log(scaled.scaleFactor); // 2
 * console.log(scaled.ingredients[0].displayQuantity); // "2" (was "1")
 */
export function scaleRecipe(
  recipe: RecipeInput,
  newServings: number
): ScaledRecipe {
  // Calculate scale factor
  const scaleFactor = newServings / recipe.servings;

  // Scale each ingredient
  const scaledIngredients: ScaledIngredient[] = recipe.ingredients.map(
    (ingredient) => {
      // Check if this is a non-numeric quantity (like "to taste")
      if (
        !ingredient.quantity ||
        isNonNumeric(ingredient.quantity) ||
        isNonNumeric(ingredient.notes)
      ) {
        return {
          ...ingredient,
          originalQuantity: ingredient.quantity,
          scaledQuantity: null,
          displayQuantity: ingredient.quantity,
        };
      }

      // Parse and scale the quantity
      const originalQty = parseQuantity(ingredient.quantity);

      if (originalQty === null) {
        // Couldn't parse quantity, return as-is
        return {
          ...ingredient,
          originalQuantity: ingredient.quantity,
          scaledQuantity: null,
          displayQuantity: ingredient.quantity,
        };
      }

      const scaledQty = originalQty * scaleFactor;
      const displayQty = formatQuantity(scaledQty);

      return {
        ...ingredient,
        originalQuantity: ingredient.quantity,
        scaledQuantity: scaledQty,
        displayQuantity: displayQty,
        quantity: scaledQty.toString(), // Update quantity for consistency
      };
    }
  );

  return {
    ...recipe,
    currentServings: newServings,
    scaleFactor,
    ingredients: scaledIngredients,
  };
}

/**
 * Check if a recipe is currently scaled (servings differ from original)
 */
export function isRecipeScaled(recipe: {
  servings: number;
  currentServings?: number;
}): boolean {
  return (
    recipe.currentServings !== undefined &&
    recipe.currentServings !== recipe.servings
  );
}

/**
 * Get a human-readable description of the scaling
 *
 * @example
 * getScalingDescription(4, 8) // "Scaled from 4 to 8 servings (2x)"
 * getScalingDescription(8, 4) // "Scaled from 8 to 4 servings (0.5x)"
 */
export function getScalingDescription(
  originalServings: number,
  currentServings: number
): string {
  const factor = currentServings / originalServings;
  return `Scaled from ${originalServings} to ${currentServings} servings (${factor}x)`;
}
