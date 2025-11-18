import { NextResponse } from 'next/server';
import { substitutionService } from '@/lib/substitution-service';
import { requireAuth, createErrorResponse } from '@/lib/api/utils';

/**
 * DELETE /api/substitutions/[id]
 * Delete a substitution (admin function)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Substitution ID is required' },
        { status: 400 }
      );
    }

    // Delete the substitution
    const deleted = await substitutionService.deleteSubstitution(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Substitution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Substitution deleted successfully',
      deleted,
    });
  } catch (error) {
    return createErrorResponse(
      'An error occurred while deleting the substitution',
      500,
      'Error deleting substitution:',
      error
    );
  }
}
