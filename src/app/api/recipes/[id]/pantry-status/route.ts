import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecipeWithPantryStatus } from '@/lib/pantry-status';
import { requireRecipeAccess } from '@/lib/recipe/helpers';

// GET /api/recipes/:id/pantry-status - Get recipe with pantry availability status
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to household' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify user has access to this recipe
    const hasAccess = await requireRecipeAccess(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recipeWithStatus = await getRecipeWithPantryStatus(id, householdId);
    if (!recipeWithStatus) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json({
      recipe: recipeWithStatus,
      summary: {
        totalShortage: recipeWithStatus.totalShortage,
        missingCount: recipeWithStatus.missingCount,
        partialCount: recipeWithStatus.partialCount,
        availableCount: recipeWithStatus.availableCount,
        totalIngredients: recipeWithStatus.ingredients.length,
        canCook: recipeWithStatus.missingCount === 0,
      },
    });
  } catch (error) {
    console.error('Error fetching recipe pantry status:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching recipe pantry status' },
      { status: 500 }
    );
  }
}
