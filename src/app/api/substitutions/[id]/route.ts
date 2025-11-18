import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { substitutionService } from '@/lib/substitution-service';

/**
 * DELETE /api/substitutions/[id]
 * Delete a substitution (admin function)
 */
export async function DELETE(
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
    console.error('Error deleting substitution:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the substitution' },
      { status: 500 }
    );
  }
}
