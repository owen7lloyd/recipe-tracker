import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipeNotes } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { updateRecipeNoteSchema } from '@/lib/validations/recipe-note';

// PATCH /api/notes/[id] - Update a recipe note
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: noteId } = await params;

    // Check if note exists and belongs to user
    const [existingNote] = await db
      .select()
      .from(recipeNotes)
      .where(and(eq(recipeNotes.id, noteId), eq(recipeNotes.userId, session.user.id)))
      .limit(1);

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found or you do not have permission to edit it' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateRecipeNoteSchema.parse(body);

    // Update note
    const [updatedNote] = await db
      .update(recipeNotes)
      .set({
        noteText: validatedData.noteText,
        updatedAt: new Date(),
      })
      .where(eq(recipeNotes.id, noteId))
      .returning();

    return NextResponse.json({ note: updatedNote }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating recipe note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notes/[id] - Delete a recipe note
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: noteId } = await params;

    // Check if note exists and belongs to user
    const [existingNote] = await db
      .select()
      .from(recipeNotes)
      .where(and(eq(recipeNotes.id, noteId), eq(recipeNotes.userId, session.user.id)))
      .limit(1);

    if (!existingNote) {
      return NextResponse.json(
        { error: 'Note not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    // Delete note
    await db.delete(recipeNotes).where(eq(recipeNotes.id, noteId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting recipe note:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
