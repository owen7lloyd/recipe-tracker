import { db } from '@/lib/db';
import {
  recipeIngredients,
  ingredients,
  pantryItems,
  recipes,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type IngredientStatus = 'available' | 'partial' | 'missing';

export interface IngredientWithPantryStatus {
  id: string;
  ingredientId: string;
  ingredientName: string;
  ingredientCategory: string;
  quantity: string | null;
  unit: string | null;
  notes: string | null;
  optional: boolean;
  needed: number;
  available: number;
  status: IngredientStatus;
  shortage: number;
}

export interface RecipeWithPantryStatus {
  id: string;
  householdId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  category: string;
  tags: string[] | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number;
  rating: number | null;
  avgRating: string | null;
  ratingCount: number | null;
  instructions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: IngredientWithPantryStatus[];
  totalShortage: number;
  missingCount: number;
  partialCount: number;
  availableCount: number;
}

/**
 * Determine ingredient status based on needed vs available quantity
 */
function determineStatus(needed: number, available: number): IngredientStatus {
  if (available === 0) {
    return 'missing';
  }
  if (available < needed) {
    return 'partial';
  }
  return 'available';
}

/**
 * Calculate shortage amount (0 if available >= needed)
 */
function calculateShortage(needed: number, available: number): number {
  return Math.max(0, needed - available);
}

/**
 * Get recipe with pantry status for all ingredients
 */
export async function getRecipeWithPantryStatus(
  recipeId: string,
  householdId: string
): Promise<RecipeWithPantryStatus | null> {
  // Fetch the recipe
  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.householdId, householdId)))
    .limit(1);

  if (!recipe) {
    return null;
  }

  // Fetch recipe ingredients with pantry data
  const ingredientsList = await db
    .select({
      id: recipeIngredients.id,
      ingredientId: recipeIngredients.ingredientId,
      ingredientName: ingredients.name,
      ingredientCategory: ingredients.category,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      notes: recipeIngredients.notes,
      optional: recipeIngredients.optional,
      pantryQuantity: pantryItems.quantity,
      pantryUnit: pantryItems.unit,
    })
    .from(recipeIngredients)
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .leftJoin(
      pantryItems,
      and(
        eq(pantryItems.ingredientId, recipeIngredients.ingredientId),
        eq(pantryItems.householdId, householdId)
      )
    )
    .where(eq(recipeIngredients.recipeId, recipeId));

  // Calculate status for each ingredient
  const ingredientsWithStatus: IngredientWithPantryStatus[] =
    ingredientsList.map((ing) => {
      // Parse quantities as numbers (handle null/undefined)
      const needed = ing.quantity ? parseFloat(ing.quantity) : 0;
      const available = ing.pantryQuantity ? parseFloat(ing.pantryQuantity) : 0;

      // Determine status
      const status = determineStatus(needed, available);
      const shortage = calculateShortage(needed, available);

      return {
        id: ing.id,
        ingredientId: ing.ingredientId,
        ingredientName: ing.ingredientName || 'Unknown',
        ingredientCategory: ing.ingredientCategory || 'other',
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes,
        optional: ing.optional || false,
        needed,
        available,
        status,
        shortage,
      };
    });

  // Calculate summary statistics
  const totalShortage = ingredientsWithStatus.reduce(
    (sum, ing) => sum + ing.shortage,
    0
  );
  const missingCount = ingredientsWithStatus.filter(
    (ing) => ing.status === 'missing'
  ).length;
  const partialCount = ingredientsWithStatus.filter(
    (ing) => ing.status === 'partial'
  ).length;
  const availableCount = ingredientsWithStatus.filter(
    (ing) => ing.status === 'available'
  ).length;

  return {
    ...recipe,
    ingredients: ingredientsWithStatus,
    totalShortage,
    missingCount,
    partialCount,
    availableCount,
  };
}

/**
 * Get pantry availability summary for multiple recipes
 */
export async function getRecipesPantryAvailability(
  recipeIds: string[],
  householdId: string
): Promise<
  Map<
    string,
    {
      availableCount: number;
      partialCount: number;
      missingCount: number;
      totalIngredients: number;
      canCook: boolean;
    }
  >
> {
  if (recipeIds.length === 0) {
    return new Map();
  }

  const results = new Map<
    string,
    {
      availableCount: number;
      partialCount: number;
      missingCount: number;
      totalIngredients: number;
      canCook: boolean;
    }
  >();

  // For each recipe, calculate availability
  for (const recipeId of recipeIds) {
    const recipeWithStatus = await getRecipeWithPantryStatus(
      recipeId,
      householdId
    );

    if (recipeWithStatus) {
      results.set(recipeId, {
        availableCount: recipeWithStatus.availableCount,
        partialCount: recipeWithStatus.partialCount,
        missingCount: recipeWithStatus.missingCount,
        totalIngredients: recipeWithStatus.ingredients.length,
        canCook: recipeWithStatus.missingCount === 0,
      });
    }
  }

  return results;
}
