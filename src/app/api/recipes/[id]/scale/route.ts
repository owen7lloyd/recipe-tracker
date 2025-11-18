import { NextResponse } from 'next/server';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
} from '@/lib/recipe/helpers';
import { scaleRecipe } from '@/lib/recipe-scaling';
import { requireAuth, createErrorResponse } from '@/lib/api/utils';

/**
 * GET /api/recipes/:id/scale?servings=N
 *
 * Scale a recipe to a different number of servings
 *
 * Query Parameters:
 * - servings (required): The desired number of servings (must be >= 1)
 *
 * Returns:
 * - 200: Scaled recipe with updated ingredient quantities
 * - 400: Invalid servings parameter
 * - 401: Unauthorized (not logged in)
 * - 403: Forbidden (recipe doesn't belong to user's household)
 * - 404: Recipe not found
 * - 500: Server error
 *
 * Example:
 * GET /api/recipes/abc123/scale?servings=8
 *
 * Response:
 * {
 *   "id": "abc123",
 *   "title": "Chocolate Chip Cookies",
 *   "servings": 24,
 *   "currentServings": 48,
 *   "scaleFactor": 2,
 *   "ingredients": [
 *     {
 *       "ingredientName": "flour",
 *       "originalQuantity": "2",
 *       "scaledQuantity": 4,
 *       "displayQuantity": "4",
 *       "unit": "cups"
 *     },
 *     ...
 *   ],
 *   ...
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const userId = authResult;

    const { id } = await params;

    // Parse servings from query parameters
    const { searchParams } = new URL(request.url);
    const servingsParam = searchParams.get('servings');

    if (!servingsParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: servings' },
        { status: 400 }
      );
    }

    const servings = parseInt(servingsParam, 10);

    if (isNaN(servings) || servings < 1) {
      return NextResponse.json(
        { error: 'Invalid servings value. Must be a number >= 1' },
        { status: 400 }
      );
    }

    // Verify user has access to this recipe
    const hasAccess = await requireRecipeAccess(userId, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch recipe with ingredients
    const recipe = await getRecipeWithIngredients(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Scale the recipe
    const scaledRecipe = scaleRecipe(recipe, servings);

    return NextResponse.json(scaledRecipe);
  } catch (error) {
    return createErrorResponse(
      'An error occurred while scaling recipe',
      500,
      'Error scaling recipe:',
      error
    );
  }
}
