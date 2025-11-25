import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipeNotes, recipes } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import {
  createRecipeNoteSchema,
  getRecipeNotesQuerySchema,
} from '@/lib/validations/recipe-note';

// GET /api/recipes/[id]/notes - Get all notes for a recipe
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: recipeId } = await params;

    // Check if recipe exists and user has access
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (recipe.householdId !== session.user.householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = getRecipeNotesQuerySchema.parse(queryParams);

    // Build query conditions
    const conditions = [eq(recipeNotes.recipeId, recipeId)];

    if (validatedQuery.stepNumber !== undefined) {
      conditions.push(eq(recipeNotes.stepNumber, validatedQuery.stepNumber));
    }

    if (validatedQuery.sessionId) {
      conditions.push(eq(recipeNotes.sessionId, validatedQuery.sessionId));
    }

    // Fetch notes
    const notes = await db
      .select()
      .from(recipeNotes)
      .where(and(...conditions))
      .orderBy(desc(recipeNotes.createdAt))
      .limit(validatedQuery.limit || 50);

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error fetching recipe notes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/recipes/[id]/notes - Create a new note for a recipe
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: recipeId } = await params;

    // Check if recipe exists and user has access
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(eq(recipes.id, recipeId))
      .limit(1);

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (recipe.householdId !== session.user.householdId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createRecipeNoteSchema.parse(body);

    // Create note
    const [note] = await db
      .insert(recipeNotes)
      .values({
        userId: session.user.id,
        recipeId,
        noteText: validatedData.noteText,
        stepNumber: validatedData.stepNumber ?? null,
        sessionId: validatedData.sessionId ?? null,
      })
      .returning();

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating recipe note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
