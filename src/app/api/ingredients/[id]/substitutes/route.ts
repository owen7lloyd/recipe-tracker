import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { substitutionService } from '@/lib/substitution-service';

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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    console.error('Error fetching ingredient substitutes:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching substitutes' },
      { status: 500 }
    );
  }
}
