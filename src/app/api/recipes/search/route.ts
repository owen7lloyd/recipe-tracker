import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { searchRecipesByIngredients } from '@/lib/recipe/helpers';
import { z } from 'zod';

const searchQuerySchema = z.object({
  ingredients: z.string().min(1, 'At least one ingredient required'),
  matchMode: z.enum(['any', 'all']).optional().default('any'),
  exclude: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z
    .enum(['relevance', 'rating', 'cookTime', 'prepTime'])
    .optional()
    .default('relevance'),
});

/**
 * GET /api/recipes/search
 * Search recipes by ingredients with advanced filtering
 *
 * Query parameters:
 * - ingredients: Comma-separated list of ingredient IDs (required)
 * - matchMode: "any" (default) or "all"
 * - exclude: Comma-separated list of ingredient IDs to exclude
 * - limit: Number of results (default: 20, max: 100)
 * - offset: Pagination offset (default: 0)
 * - sortBy: "relevance" (default), "rating", "cookTime", "prepTime"
 */
export async function GET(request: Request) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Household authorization
    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to a household' },
        { status: 403 }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const params = {
      ingredients: url.searchParams.get('ingredients'),
      matchMode: url.searchParams.get('matchMode'),
      exclude: url.searchParams.get('exclude'),
      limit: url.searchParams.get('limit'),
      offset: url.searchParams.get('offset'),
      sortBy: url.searchParams.get('sortBy'),
    };

    const validationResult = searchQuerySchema.safeParse(params);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid query parameters',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { ingredients, matchMode, exclude, limit, offset, sortBy } =
      validationResult.data;

    // Parse ingredient IDs
    const ingredientIds = ingredients.split(',').filter(Boolean);

    if (ingredientIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one ingredient ID required' },
        { status: 400 }
      );
    }

    // Parse excluded ingredient IDs
    const excludeIngredients = exclude ? exclude.split(',').filter(Boolean) : [];

    // Perform search
    const results = await searchRecipesByIngredients(householdId, ingredientIds, {
      matchMode,
      excludeIngredients,
      limit,
      offset,
      sortBy,
    });

    return NextResponse.json(
      {
        results,
        count: results.length,
        limit,
        offset,
        hasMore: results.length === limit,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Recipe search error:', error);
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    );
  }
}
