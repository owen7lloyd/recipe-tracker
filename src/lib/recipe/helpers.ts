import { db } from '@/lib/db';
import {
  recipes,
  recipeIngredients,
  users,
  ingredients,
} from '@/lib/db/schema';
import { eq, and, or, ilike, inArray, desc, asc, sql } from 'drizzle-orm';

/**
 * Get user's household ID
 */
export async function getUserHouseholdId(
  userId: string
): Promise<string | null> {
  const user = await db
    .select({ householdId: users.householdId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user[0]?.householdId || null;
}

/**
 * Check if a recipe belongs to a user's household
 */
export async function requireRecipeAccess(
  userId: string,
  recipeId: string
): Promise<boolean> {
  const user = await db
    .select({ householdId: users.householdId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user[0]?.householdId) {
    return false;
  }

  const recipe = await db
    .select({ householdId: recipes.householdId })
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  return recipe[0]?.householdId === user[0].householdId;
}

/**
 * Get recipe with all ingredients
 */
export async function getRecipeWithIngredients(recipeId: string) {
  const recipe = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId))
    .limit(1);

  if (recipe.length === 0) {
    return null;
  }

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
      substitutionGroup: recipeIngredients.substitutionGroup,
    })
    .from(recipeIngredients)
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .where(eq(recipeIngredients.recipeId, recipeId));

  return {
    ...recipe[0],
    ingredients: ingredientsList,
  };
}

/**
 * Search recipes with filters
 */
export interface RecipeFilters {
  search?: string;
  category?: string;
  tags?: string[];
  ingredientIds?: string[];
  sortBy?: 'newest' | 'oldest' | 'rating' | 'prepTime';
  page?: number;
  limit?: number;
}

export async function searchRecipes(
  householdId: string,
  filters: RecipeFilters = {}
) {
  const {
    search,
    category,
    tags,
    ingredientIds,
    sortBy = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [eq(recipes.householdId, householdId)];

  if (search) {
    conditions.push(
      or(
        ilike(recipes.title, `%${search}%`),
        ilike(recipes.description, `%${search}%`)
      )!
    );
  }

  if (category) {
    conditions.push(eq(recipes.category, category as any));
  }

  if (tags && tags.length > 0) {
    // Check if recipe tags array contains any of the filter tags
    conditions.push(
      sql`${recipes.tags} && ARRAY[${sql.join(
        tags.map((tag) => sql`${tag}`),
        sql`, `
      )}]::text[]`
    );
  }

  // If filtering by ingredients, we need a subquery
  let query = db
    .select({
      id: recipes.id,
      householdId: recipes.householdId,
      title: recipes.title,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      sourceUrl: recipes.sourceUrl,
      category: recipes.category,
      tags: recipes.tags,
      prepTimeMinutes: recipes.prepTimeMinutes,
      cookTimeMinutes: recipes.cookTimeMinutes,
      servings: recipes.servings,
      rating: recipes.rating,
      avgRating: recipes.avgRating,
      ratingCount: recipes.ratingCount,
      instructions: recipes.instructions,
      createdBy: recipes.createdBy,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
    })
    .from(recipes)
    .where(and(...conditions));

  // Apply sorting
  switch (sortBy) {
    case 'oldest':
      query = query.orderBy(asc(recipes.createdAt)) as any;
      break;
    case 'rating':
      query = query.orderBy(
        desc(recipes.avgRating),
        desc(recipes.createdAt)
      ) as any;
      break;
    case 'prepTime':
      query = query.orderBy(
        asc(recipes.prepTimeMinutes),
        desc(recipes.createdAt)
      ) as any;
      break;
    case 'newest':
    default:
      query = query.orderBy(desc(recipes.createdAt)) as any;
      break;
  }

  // Apply pagination
  query = query.limit(limit).offset(offset) as any;

  let results = await query;

  // Filter by ingredients if needed (post-query filtering)
  if (ingredientIds && ingredientIds.length > 0) {
    const recipeIds = results.map((r) => r.id);
    if (recipeIds.length > 0) {
      const recipesWithIngredients = await db
        .select({
          recipeId: recipeIngredients.recipeId,
          ingredientId: recipeIngredients.ingredientId,
        })
        .from(recipeIngredients)
        .where(
          and(
            inArray(recipeIngredients.recipeId, recipeIds),
            inArray(recipeIngredients.ingredientId, ingredientIds)
          )
        );

      // Get unique recipe IDs that have at least one of the filter ingredients
      const matchingRecipeIds = new Set(
        recipesWithIngredients.map((ri) => ri.recipeId)
      );
      results = results.filter((r) => matchingRecipeIds.has(r.id));
    }
  }

  // Get total count for pagination
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(recipes)
    .where(and(...conditions));

  const [{ count: total }] = await totalQuery;

  return {
    recipes: results,
    pagination: {
      page,
      limit,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
}

/**
 * Delete recipe (soft delete by removing from DB)
 */
export async function deleteRecipe(recipeId: string): Promise<boolean> {
  const result = await db
    .delete(recipes)
    .where(eq(recipes.id, recipeId))
    .returning();

  return result.length > 0;
}

/**
 * Search recipes by ingredients with advanced filtering
 */
export interface RecipeSearchOptions {
  matchMode?: 'any' | 'all'; // 'any' = OR, 'all' = AND
  excludeIngredients?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'rating' | 'cookTime' | 'prepTime';
}

export interface RecipeSearchResult {
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
  instructions: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  matchCount: number;
  totalIngredients: number;
  matchPercentage: number;
}

export async function searchRecipesByIngredients(
  householdId: string,
  ingredientIds: string[],
  options: RecipeSearchOptions = {}
): Promise<RecipeSearchResult[]> {
  const {
    matchMode = 'any',
    excludeIngredients = [],
    limit = 20,
    offset = 0,
    sortBy = 'relevance',
  } = options;

  // Return empty if no ingredients specified
  if (ingredientIds.length === 0) {
    return [];
  }

  // Build the base query with match count
  let query = db
    .select({
      id: recipes.id,
      householdId: recipes.householdId,
      title: recipes.title,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      sourceUrl: recipes.sourceUrl,
      category: recipes.category,
      tags: recipes.tags,
      prepTimeMinutes: recipes.prepTimeMinutes,
      cookTimeMinutes: recipes.cookTimeMinutes,
      servings: recipes.servings,
      rating: recipes.rating,
      instructions: recipes.instructions,
      createdBy: recipes.createdBy,
      createdAt: recipes.createdAt,
      updatedAt: recipes.updatedAt,
      matchCount: sql<number>`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END)`,
    })
    .from(recipes)
    .innerJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .where(
      and(
        eq(recipes.householdId, householdId),
        inArray(recipeIngredients.ingredientId, ingredientIds)
      )
    )
    .groupBy(recipes.id);

  // Filter by match mode
  if (matchMode === 'all') {
    // Only include recipes that have ALL specified ingredients
    query = query.having(
      sql`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END) >= ${ingredientIds.length}`
    ) as any;
  }

  // Apply sorting
  switch (sortBy) {
    case 'rating':
      query = query.orderBy(
        desc(recipes.rating),
        desc(sql`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END)`)
      ) as any;
      break;
    case 'cookTime':
      query = query.orderBy(
        asc(recipes.cookTimeMinutes),
        desc(sql`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END)`)
      ) as any;
      break;
    case 'prepTime':
      query = query.orderBy(
        asc(recipes.prepTimeMinutes),
        desc(sql`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END)`)
      ) as any;
      break;
    case 'relevance':
    default:
      // Sort by match count (most matches first)
      query = query.orderBy(
        desc(sql`COUNT(DISTINCT CASE WHEN ${recipeIngredients.ingredientId} = ANY(ARRAY[${sql.join(ingredientIds.map((id) => sql`${id}`), sql`, `)}]::uuid[]) THEN ${recipeIngredients.ingredientId} END)`)
      ) as any;
      break;
  }

  // Apply pagination
  query = query.limit(limit).offset(offset) as any;

  // Execute query
  const results = await query;

  // If excluding ingredients, filter those out
  let filteredResults = results;
  if (excludeIngredients.length > 0) {
    // Get recipes that contain excluded ingredients
    const recipesWithExcluded = await db
      .select({ recipeId: recipeIngredients.recipeId })
      .from(recipeIngredients)
      .where(
        and(
          inArray(
            recipeIngredients.recipeId,
            results.map((r) => r.id)
          ),
          inArray(recipeIngredients.ingredientId, excludeIngredients)
        )
      )
      .groupBy(recipeIngredients.recipeId);

    const excludedRecipeIds = new Set(
      recipesWithExcluded.map((r) => r.recipeId)
    );
    filteredResults = results.filter((r) => !excludedRecipeIds.has(r.id));
  }

  // Calculate total ingredients and match percentage for each recipe
  const withMatchPercentage = await Promise.all(
    filteredResults.map(async (result) => {
      const [totalCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, result.id));

      const totalIngredients = Number(totalCount?.count ?? 0);
      const matchCount = Number(result.matchCount ?? 0);
      const matchPercentage =
        totalIngredients > 0
          ? Math.round((matchCount / totalIngredients) * 100)
          : 0;

      return {
        ...result,
        matchCount,
        totalIngredients,
        matchPercentage,
      };
    })
  );

  return withMatchPercentage;
}
