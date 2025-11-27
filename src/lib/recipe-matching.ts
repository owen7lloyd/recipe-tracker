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
    minServings?: number;
    maxServings?: number;
  }
): Promise<RecipeMatch[] | RecipeMatchWithServings[]> {
  const {
    minMatchPercentage = 100,
    includeNearMatches = false,
    sortBy = 'match',
    includeReducedServings = false,
    minServings,
    maxServings,
  } = options || {};

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

  // Apply serving filters if reduced servings is enabled
  if (includeReducedServings) {
    filteredMatches = filteredMatches.filter((m) => {
      const matchWithServings = m as RecipeMatchWithServings;
      const achievable = matchWithServings.achievableServings;

      if (minServings !== undefined && achievable < minServings) {
        return false;
      }
      if (maxServings !== undefined && achievable > maxServings) {
        return false;
      }
      return true;
    });
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
  const requiredIngredients = match.ingredientMatches.filter(
    (m) => m.matched && m.matchType !== 'missing'
  );

  // Calculate max servings for each ingredient
  const servingLimitations: number[] = [];

  for (const ingredient of requiredIngredients) {
    const pantryItem = pantry.find(
      (p) => p.ingredientId === ingredient.ingredientId
    );

    if (
      ingredient.quantityNeeded &&
      ingredient.quantityNeeded > 0 &&
      pantryItem
    ) {
      const pantryQty = pantryItem.quantity
        ? parseFloat(pantryItem.quantity)
        : null;

      if (pantryQty) {
        // Calculate max servings based on this ingredient
        const maxServings =
          (pantryQty / ingredient.quantityNeeded) * match.recipe.servings;
        servingLimitations.push(maxServings);
      }
    } else if (
      !ingredient.quantityNeeded ||
      ingredient.quantityNeeded === 0 ||
      !pantryItem
    ) {
      // No quantity specified or item not in pantry, assume unlimited
      servingLimitations.push(match.recipe.servings);
    }
  }

  // Find the limiting ingredient (lowest achievable servings)
  const achievableServings =
    servingLimitations.length > 0
      ? Math.floor(Math.min(...servingLimitations) * 100) / 100
      : match.recipe.servings;

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
        if (pantryItem) {
          const pantryQty = pantryItem.quantity
            ? parseFloat(pantryItem.quantity)
            : null;
          if (pantryQty) {
            const maxServings =
              (pantryQty / ingredient.quantityNeeded) * match.recipe.servings;
            if (Math.floor(maxServings * 100) / 100 === achievableServings) {
              limitingIngredients.push(ingredient.ingredientId);
            }
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
