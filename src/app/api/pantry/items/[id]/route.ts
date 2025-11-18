import { z } from 'zod';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pantryItems, users } from '@/lib/db/schema';
import { updatePantryItemSchema } from '@/lib/validations/pantry';
import { eq, and } from 'drizzle-orm';

/**
 * PUT /api/pantry/items/:id
 * Update a pantry item's quantity and unit
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get user's household
    const user = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]?.householdId) {
      return NextResponse.json(
        { error: 'User must be in a household' },
        { status: 400 }
      );
    }

    const householdId = user[0].householdId;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updatePantryItemSchema.parse(body);

    // Update pantry item (only if it belongs to user's household)
    const [updated] = await db
      .update(pantryItems)
      .set({
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        updatedAt: new Date(),
      })
      .where(
        and(eq(pantryItems.id, id), eq(pantryItems.householdId, householdId))
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Pantry item not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Pantry item updated',
      item: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating pantry item:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating pantry item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pantry/items/:id
 * Remove a pantry item
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

    // Get user's household
    const user = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user[0]?.householdId) {
      return NextResponse.json(
        { error: 'User must be in a household' },
        { status: 400 }
      );
    }

    const householdId = user[0].householdId;

    // Delete pantry item (only if it belongs to user's household)
    const [deleted] = await db
      .delete(pantryItems)
      .where(
        and(eq(pantryItems.id, id), eq(pantryItems.householdId, householdId))
      )
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Pantry item not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Pantry item deleted',
    });
  } catch (error) {
    console.error('Error deleting pantry item:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting pantry item' },
      { status: 500 }
    );
  }
}
