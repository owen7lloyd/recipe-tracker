/**
 * Recipe Matching Service
 *
 * Implements the "What Can I Cook?" feature that matches recipes with
 * current pantry inventory, considering ingredient substitutions and quantities.
 */

import { db } from '@/lib/db';
import {
  recipes,
  recipeIngredients,
  pantryItems,
  ingredients,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SubstitutionService } from '@/lib/substitution-service';

export interface IngredientMatch {
  recipeIngredientId: string;
  ingredientId: string;
  ingredientName: string;
  required: boolean;
  quantityNeeded: number | null;
  unitNeeded: string | null;
  matched: boolean;
  matchType: 'exact' | 'substitute' | 'missing';
  substitute?: {
    id: string;
    name: string;
    ratio: number;
    adjustedQuantity: number | null;
  };
}

export interface RecipeMatch {
  recipe: {
    id: string;
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
  };
  cookable: boolean;
  matchPercentage: number;
  ingredientMatches: IngredientMatch[];
  substitutionsUsed: Array<{
    original: string;
    substitute: string;
    ratio: number;
  }>;
  missingIngredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number | null;
    unit: string | null;
  }>;
  requiredCount: number;
  matchedCount: number;
}

export interface RecipeMatchWithServings extends RecipeMatch {
  achievableServings: number;
  canMakeFull: boolean;
  canMakeReduced: boolean;
  limitingIngredients: string[];
}

/**
 * Find all cookable recipes for a household
 *
 * @param householdId - The household ID to search recipes for
 * @param options - Optional filtering and sorting options
 * @returns Array of recipe matches sorted by match percentage
 */
export async function findCookableRecipes(
  householdId: string,
  options?: {
    minMatchPercentage?: number;
    includeNearMatches?: boolean;
    sortBy?: 'match' | 'newest' | 'rating' | 'prepTime';
    includeReducedServings?: boolean;
  }
): Promise<RecipeMatch[] | RecipeMatchWithServings[]> {
  const {
    minMatchPercentage = 100,
    includeNearMatches = false,
    sortBy = 'match',
    includeReducedServings = false,
  } = options || {};

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DEBUG] findCookableRecipes called: includeReducedServings=${includeReducedServings}, includeNearMatches=${includeNearMatches}`
    );
  }

  // Fetch all household recipes with their ingredients
  const householdRecipes = await db
    .select({
      recipeId: recipes.id,
      recipeTitle: recipes.title,
      recipeDescription: recipes.description,
      recipeImageUrl: recipes.imageUrl,
      recipeSourceUrl: recipes.sourceUrl,
      recipeCategory: recipes.category,
      recipeTags: recipes.tags,
      recipePrepTimeMinutes: recipes.prepTimeMinutes,
      recipeCookTimeMinutes: recipes.cookTimeMinutes,
      recipeServings: recipes.servings,
      recipeRating: recipes.rating,
      recipeCreatedAt: recipes.createdAt,
      ingredientId: recipeIngredients.id,
      ingredientRefId: recipeIngredients.ingredientId,
      ingredientName: ingredients.name,
      quantity: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      optional: recipeIngredients.optional,
    })
    .from(recipes)
    .innerJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipes.householdId, householdId));

  // Fetch all pantry items for the household
  const pantry = await db
    .select({
      ingredientId: pantryItems.ingredientId,
      ingredientName: ingredients.name,
      quantity: pantryItems.quantity,
      unit: pantryItems.unit,
    })
    .from(pantryItems)
    .innerJoin(ingredients, eq(pantryItems.ingredientId, ingredients.id))
    .where(eq(pantryItems.householdId, householdId));

  // Group ingredients by recipe
  const recipeMap = new Map<string, typeof householdRecipes>();
  for (const row of householdRecipes) {
    const recipeId = row.recipeId;
    if (!recipeMap.has(recipeId)) {
      recipeMap.set(recipeId, []);
    }
    recipeMap.get(recipeId)!.push(row);
  }

  // Initialize substitution service
  const substitutionService = new SubstitutionService();

  // Check each recipe
  const matches: (RecipeMatch | RecipeMatchWithServings)[] = [];

  for (const [recipeId, recipeRows] of recipeMap.entries()) {
    const firstRow = recipeRows[0];
    const match = await checkRecipeMatch(
      {
        id: recipeId,
        title: firstRow.recipeTitle,
        description: firstRow.recipeDescription,
        imageUrl: firstRow.recipeImageUrl,
        sourceUrl: firstRow.recipeSourceUrl,
        category: firstRow.recipeCategory,
        tags: firstRow.recipeTags,
        prepTimeMinutes: firstRow.recipePrepTimeMinutes,
        cookTimeMinutes: firstRow.recipeCookTimeMinutes,
        servings: firstRow.recipeServings,
        rating: firstRow.recipeRating,
        createdAt: firstRow.recipeCreatedAt,
        ingredients: recipeRows.map((row) => ({
          id: row.ingredientId,
          ingredientId: row.ingredientRefId,
          name: row.ingredientName,
          quantity: row.quantity,
          unit: row.unit,
          optional: row.optional,
        })),
      },
      pantry,
      substitutionService
    );

    // If reduced servings is enabled, calculate achievable servings
    if (includeReducedServings) {
      const matchWithServings = await addServingsInfo(
        match,
        recipeRows,
        pantry,
        substitutionService
      );
      matches.push(matchWithServings);
    } else {
      matches.push(match);
    }
  }

  // Filter based on options
  let filteredMatches = matches;

  if (!includeNearMatches) {
    // Only show fully cookable recipes
    filteredMatches = matches.filter((m) => m.cookable);
  } else {
    // Show recipes that meet minimum match percentage
    filteredMatches = matches.filter(
      (m) => m.matchPercentage >= minMatchPercentage
    );
  }

  // Sort based on preference
  filteredMatches.sort((a, b) => {
    // If reduced servings is enabled, sort by achievable servings first
    if (includeReducedServings) {
      const aServings = (a as RecipeMatchWithServings).achievableServings || 0;
      const bServings = (b as RecipeMatchWithServings).achievableServings || 0;

      // Sort by achievable servings descending (most flexible first)
      if (aServings !== bServings) {
        return bServings - aServings;
      }
    }

    // Then apply other sorting preferences
    switch (sortBy) {
      case 'match':
        return b.matchPercentage - a.matchPercentage;
      case 'newest':
        return (
          new Date(b.recipe.id).getTime() - new Date(a.recipe.id).getTime()
        );
      case 'rating':
        return (b.recipe.rating || 0) - (a.recipe.rating || 0);
      case 'prepTime':
        return (
          (a.recipe.prepTimeMinutes || 999) - (b.recipe.prepTimeMinutes || 999)
        );
      default:
        return b.matchPercentage - a.matchPercentage;
    }
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DEBUG] findCookableRecipes returning ${filteredMatches.length} recipes`
    );
    filteredMatches.forEach((m) => {
      if (includeReducedServings && 'achievableServings' in m) {
        const mWithServings = m as RecipeMatchWithServings;
        console.log(
          `[DEBUG]   - ${m.recipe.title}: ${mWithServings.achievableServings} servings (canMakeFull=${mWithServings.canMakeFull}, canMakeReduced=${mWithServings.canMakeReduced})`
        );
      } else {
        console.log(
          `[DEBUG]   - ${m.recipe.title}: cookable=${m.cookable}, match=${m.matchPercentage}%`
        );
      }
    });
  }

  return filteredMatches;
}

/**
 * Check if a single recipe can be made with available pantry items
 */
async function checkRecipeMatch(
  recipe: {
    id: string;
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
    createdAt: Date | string;
    ingredients: Array<{
      id: string;
      ingredientId: string;
      name: string;
      quantity: string | null;
      unit: string | null;
      optional: boolean | null;
    }>;
  },
  pantry: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: string | null;
    unit: string | null;
  }>,
  substitutionService: SubstitutionService
): Promise<RecipeMatch> {
  const requiredIngredients = recipe.ingredients.filter((i) => !i.optional);
  const ingredientMatches: IngredientMatch[] = [];
  const substitutionsUsed: RecipeMatch['substitutionsUsed'] = [];
  const missingIngredients: RecipeMatch['missingIngredients'] = [];
  let matchedCount = 0;

  for (const recipeIng of requiredIngredients) {
    const quantityNeeded = recipeIng.quantity
      ? parseFloat(recipeIng.quantity)
      : null;

    // Check for exact match in pantry
    const exactMatch = pantry.find(
      (p) => p.ingredientId === recipeIng.ingredientId
    );

    if (exactMatch) {
      // Check if quantity is sufficient
      const pantryQty = exactMatch.quantity
        ? parseFloat(exactMatch.quantity)
        : null;
      const hasSufficientQty =
        quantityNeeded === null ||
        pantryQty === null ||
        pantryQty >= quantityNeeded;

      if (hasSufficientQty) {
        ingredientMatches.push({
          recipeIngredientId: recipeIng.id,
          ingredientId: recipeIng.ingredientId,
          ingredientName: recipeIng.name,
          required: true,
          quantityNeeded,
          unitNeeded: recipeIng.unit,
          matched: true,
          matchType: 'exact',
        });
        matchedCount++;
        continue;
      }
    }

    // Check for substitutes
    const substitutes = await substitutionService.getSubstitutes(
      recipeIng.ingredientId
    );

    let foundSubstitute = false;

    for (const sub of substitutes) {
      const pantryItem = pantry.find(
        (p) => p.ingredientId === sub.substitute.id
      );

      if (pantryItem) {
        const ratio = parseFloat(sub.ratio);
        const requiredQty = quantityNeeded ? quantityNeeded * ratio : null;
        const pantryQty = pantryItem.quantity
          ? parseFloat(pantryItem.quantity)
          : null;

        const hasSufficientQty =
          requiredQty === null ||
          pantryQty === null ||
          pantryQty >= requiredQty;

        if (hasSufficientQty) {
          ingredientMatches.push({
            recipeIngredientId: recipeIng.id,
            ingredientId: recipeIng.ingredientId,
            ingredientName: recipeIng.name,
            required: true,
            quantityNeeded,
            unitNeeded: recipeIng.unit,
            matched: true,
            matchType: 'substitute',
            substitute: {
              id: sub.substitute.id,
              name: sub.substitute.name,
              ratio,
              adjustedQuantity: requiredQty,
            },
          });

          substitutionsUsed.push({
            original: recipeIng.name,
            substitute: sub.substitute.name,
            ratio,
          });

          matchedCount++;
          foundSubstitute = true;
          break;
        }
      }
    }

    if (!foundSubstitute) {
      // Ingredient is missing
      ingredientMatches.push({
        recipeIngredientId: recipeIng.id,
        ingredientId: recipeIng.ingredientId,
        ingredientName: recipeIng.name,
        required: true,
        quantityNeeded,
        unitNeeded: recipeIng.unit,
        matched: false,
        matchType: 'missing',
      });

      missingIngredients.push({
        ingredientId: recipeIng.ingredientId,
        ingredientName: recipeIng.name,
        quantity: quantityNeeded,
        unit: recipeIng.unit,
      });
    }
  }

  const matchPercentage =
    requiredIngredients.length > 0
      ? Math.round((matchedCount / requiredIngredients.length) * 100)
      : 100;

  const cookable = missingIngredients.length === 0;

  return {
    recipe: {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      sourceUrl: recipe.sourceUrl,
      category: recipe.category,
      tags: recipe.tags,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      servings: recipe.servings,
      rating: recipe.rating,
    },
    cookable,
    matchPercentage,
    ingredientMatches,
    substitutionsUsed,
    missingIngredients,
    requiredCount: requiredIngredients.length,
    matchedCount,
  };
}

/**
 * Check if a specific recipe can be cooked with current pantry
 * (Useful for individual recipe detail pages)
 */
export async function checkSingleRecipe(
  recipeId: string,
  householdId: string
): Promise<RecipeMatch | null> {
  const matches = await findCookableRecipes(householdId, {
    includeNearMatches: true,
    minMatchPercentage: 0,
  });

  return matches.find((m) => m.recipe.id === recipeId) || null;
}

/**
 * Add serving information to a recipe match
 * Calculates achievable servings based on available pantry items
 */
async function addServingsInfo(
  match: RecipeMatch,
  _recipeRows: Array<{
    recipeTitle: string;
    recipeDescription: string | null;
    recipeImageUrl: string | null;
    recipeSourceUrl: string | null;
    recipeCategory: string;
    recipeTags: string[] | null;
    recipePrepTimeMinutes: number | null;
    recipeCookTimeMinutes: number | null;
    recipeServings: number;
    recipeRating: number | null;
    recipeCreatedAt: Date | string;
    ingredientId: string;
    ingredientRefId: string;
    ingredientName: string;
    quantity: string | null;
    unit: string | null;
    optional: boolean | null;
  }>,
  pantry: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: string | null;
    unit: string | null;
  }>,
  _substitutionService: SubstitutionService
): Promise<RecipeMatchWithServings> {
  // Include ALL required ingredients with quantities for serving calculation
  // This allows us to calculate reduced servings even when some quantities are insufficient
  const requiredIngredients = match.ingredientMatches.filter(
    (m) => m.required && m.quantityNeeded !== null && m.quantityNeeded > 0
  );

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DEBUG] Recipe: ${match.recipe.title} (${match.recipe.servings} servings)`
    );
    console.log(
      `[DEBUG] Required ingredients with quantities: ${requiredIngredients.length}`
    );
    requiredIngredients.forEach((ing) => {
      console.log(
        `[DEBUG]   - ${ing.ingredientName}: ${ing.quantityNeeded} ${ing.unitNeeded}`
      );
    });
  }

  // Calculate max servings for each ingredient
  const servingLimitations: number[] = [];
  const limitationDetails: Array<{
    ingredientId: string;
    name: string;
    available: number | null;
    needed: number;
    maxServings: number;
  }> = [];

  for (const ingredient of requiredIngredients) {
    const pantryItem = pantry.find(
      (p) => p.ingredientId === ingredient.ingredientId
    );

    if (ingredient.quantityNeeded && ingredient.quantityNeeded > 0) {
      if (pantryItem && pantryItem.quantity) {
        const pantryQty = parseFloat(pantryItem.quantity);
        // Calculate max servings based on this ingredient
        // This works for both matched and partially matched ingredients
        const maxServings =
          (pantryQty / ingredient.quantityNeeded) * match.recipe.servings;
        servingLimitations.push(maxServings);
        limitationDetails.push({
          ingredientId: ingredient.ingredientId,
          name: ingredient.ingredientName,
          available: pantryQty,
          needed: ingredient.quantityNeeded,
          maxServings,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[DEBUG] Pantry has ${pantryQty}, need ${ingredient.quantityNeeded} -> ${maxServings} servings`
          );
        }
      } else {
        // Ingredient not in pantry at all, can't make any servings
        servingLimitations.push(0);
        limitationDetails.push({
          ingredientId: ingredient.ingredientId,
          name: ingredient.ingredientName,
          available: null,
          needed: ingredient.quantityNeeded,
          maxServings: 0,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[DEBUG] ${ingredient.ingredientName} NOT in pantry -> 0 servings`
          );
        }
      }
    } else {
      // No quantity specified, assume unlimited availability
      servingLimitations.push(match.recipe.servings);
    }
  }

  // Find the limiting ingredient (lowest achievable servings)
  const achievableServings =
    servingLimitations.length > 0
      ? Math.floor(Math.min(...servingLimitations) * 100) / 100
      : match.recipe.servings;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[DEBUG] Achievable servings: ${achievableServings} (min of [${servingLimitations.join(', ')}])`
    );
    console.log(`[DEBUG] Limitation details:`, limitationDetails);
  }

  const canMakeFull = achievableServings >= match.recipe.servings;
  const canMakeReduced =
    achievableServings > 0 && achievableServings < match.recipe.servings;

  // Find which ingredients are limiting
  const limitingIngredients: string[] = [];
  if (achievableServings < match.recipe.servings) {
    for (const ingredient of requiredIngredients) {
      if (ingredient.quantityNeeded && ingredient.quantityNeeded > 0) {
        const pantryItem = pantry.find(
          (p) => p.ingredientId === ingredient.ingredientId
        );
        if (pantryItem && pantryItem.quantity) {
          const pantryQty = parseFloat(pantryItem.quantity);
          const maxServings =
            (pantryQty / ingredient.quantityNeeded) * match.recipe.servings;
          // Check if this is one of the limiting ingredients
          if (Math.floor(maxServings * 100) / 100 === achievableServings) {
            limitingIngredients.push(ingredient.ingredientId);
          }
        } else if (!pantryItem) {
          // If ingredient is missing entirely and we can't make any servings, it's limiting
          if (achievableServings === 0) {
            limitingIngredients.push(ingredient.ingredientId);
          }
        }
      }
    }
  }

  return {
    ...match,
    achievableServings,
    canMakeFull,
    canMakeReduced,
    limitingIngredients,
  };
}
