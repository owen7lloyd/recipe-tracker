import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { substitutionService } from '@/lib/substitution-service';
import { z } from 'zod';

// Validation schema for creating substitutions
const createSubstitutionSchema = z.object({
  ingredientId: z.string().uuid(),
  substituteId: z.string().uuid(),
  ratio: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Ratio must be a decimal number'),
  notes: z.string().optional(),
});

/**
 * GET /api/substitutions
 * Get all substitutions (admin function)
 * Returns all ingredient substitution mappings
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all substitutions
    const substitutions = await substitutionService.getAllSubstitutions();

    return NextResponse.json({
      substitutions,
      count: substitutions.length,
    });
  } catch (error) {
    console.error('Error fetching substitutions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching substitutions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/substitutions
 * Create a new substitution (admin function)
 * Body: { ingredientId, substituteId, ratio, notes? }
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = createSubstitutionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { ingredientId, substituteId, ratio, notes } = validation.data;

    // Ensure ingredient and substitute are not the same
    if (ingredientId === substituteId) {
      return NextResponse.json(
        { error: 'Ingredient cannot be substituted with itself' },
        { status: 400 }
      );
    }

    // Create the substitution
    const newSubstitution = await substitutionService.addSubstitution(
      ingredientId,
      substituteId,
      ratio,
      notes
    );

    return NextResponse.json(newSubstitution, { status: 201 });
  } catch (error) {
    console.error('Error creating substitution:', error);

    // Handle unique constraint violation
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === '23505'
    ) {
      return NextResponse.json(
        { error: 'This substitution already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while creating the substitution' },
      { status: 500 }
    );
  }
}
