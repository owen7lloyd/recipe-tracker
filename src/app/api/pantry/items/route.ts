import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pantryItems, users } from '@/lib/db/schema';
import { addPantryItemSchema } from '@/lib/validations/pantry';
import { eq, and } from 'drizzle-orm';
import { ZodError } from 'zod';

/**
 * POST /api/pantry/items
 * Add a new item to the pantry or update quantity if it already exists
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const validatedData = addPantryItemSchema.parse(body);

    // Check if item already exists in pantry
    const existing = await db
      .select()
      .from(pantryItems)
      .where(
        and(
          eq(pantryItems.householdId, householdId),
          eq(pantryItems.ingredientId, validatedData.ingredientId)
        )
      )
      .limit(1);

    // If item exists, update the quantity instead of creating duplicate
    if (existing.length > 0) {
      const [updated] = await db
        .update(pantryItems)
        .set({
          quantity: validatedData.quantity,
          unit: validatedData.unit,
          updatedAt: new Date(),
        })
        .where(eq(pantryItems.id, existing[0].id))
        .returning();

      return NextResponse.json({
        message: 'Pantry item updated',
        item: updated,
      });
    }

    // Create new pantry item
    const [newItem] = await db
      .insert(pantryItems)
      .values({
        householdId,
        ingredientId: validatedData.ingredientId,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        addedBy: session.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        message: 'Pantry item added',
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding pantry item:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding pantry item' },
      { status: 500 }
    );
  }
}
