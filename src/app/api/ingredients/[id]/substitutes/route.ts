import { NextResponse } from 'next/server';
import { substitutionService } from '@/lib/substitution-service';
import { requireAuth, createErrorResponse } from '@/lib/api/utils';

/**
 * GET /api/ingredients/[id]/substitutes
 * Get all substitutes for a specific ingredient
 * Returns bidirectional substitutions with ratios
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Ingredient ID is required' },
        { status: 400 }
      );
    }

    // Get substitutes using the service
    const substitutes = await substitutionService.getSubstitutes(id);

    return NextResponse.json({
      ingredientId: id,
      substitutes,
      count: substitutes.length,
    });
  } catch (error) {
    return createErrorResponse(
      'An error occurred while fetching substitutes',
      500,
      'Error fetching ingredient substitutes:',
      error
    );
  }
}
