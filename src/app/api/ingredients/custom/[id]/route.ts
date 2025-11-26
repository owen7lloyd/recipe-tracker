import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, ingredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const VALID_CATEGORIES = [
  'produce',
  'dairy',
  'meat',
  'seafood',
  'pantry',
  'frozen',
  'bakery',
  'other',
] as const;

type IngredientCategory = (typeof VALID_CATEGORIES)[number];

/**
 * PATCH /api/ingredients/custom/[id]
 * Update a custom ingredient (only the owner can update)
 * Body: { name?: string, defaultUnit?: string, category?: IngredientCategory }
 */
export async function PATCH(
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
      .then((results) => results[0]);

    if (!user?.householdId) {
      return NextResponse.json(
        { error: 'User must be part of a household' },
        { status: 400 }
      );
    }

    // Verify the ingredient exists and belongs to the household
    const ingredient = await db
      .select()
      .from(ingredients)
      .then((results) =>
        results.find((r) => r.id === id && r.householdId === user.householdId)
      );

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, category } = body;

    // Validate inputs
    if (name && (typeof name !== 'string' || name.trim() === '')) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate category if provided
    const validatedCategory =
      category && VALID_CATEGORIES.includes(category as IngredientCategory)
        ? (category as IngredientCategory)
        : ingredient.category;

    // If name is being changed, check for duplicates in household and default database
    if (name && name.toLowerCase() !== ingredient.name.toLowerCase()) {
      const defaultExists = await db
        .select()
        .from(ingredients)
        .then((results) =>
          results.find(
            (r) => r.name.toLowerCase() === name.toLowerCase() && !r.householdId
          )
        );

      if (defaultExists) {
        return NextResponse.json(
          { error: 'This ingredient already exists in the database' },
          { status: 409 }
        );
      }

      const existing = await db
        .select()
        .from(ingredients)
        .then((results) =>
          results.find(
            (r) =>
              r.name.toLowerCase() === name.toLowerCase() &&
              r.householdId === user.householdId
          )
        );

      if (existing) {
        return NextResponse.json(
          {
            error:
              'An ingredient with this name already exists in your household',
          },
          { status: 409 }
        );
      }
    }

    // Update the ingredient
    const [updated] = await db
      .update(ingredients)
      .set({
        name: name ? name.trim() : ingredient.name,
        category: validatedCategory,
      })
      .where(eq(ingredients.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating custom ingredient:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the ingredient' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ingredients/custom/[id]
 * Delete a custom ingredient (only household members can delete)
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
      .then((results) => results[0]);

    if (!user?.householdId) {
      return NextResponse.json(
        { error: 'User must be part of a household' },
        { status: 400 }
      );
    }

    // Verify the ingredient exists and belongs to the household
    const ingredient = await db
      .select()
      .from(ingredients)
      .then((results) =>
        results.find((r) => r.id === id && r.householdId === user.householdId)
      );

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Delete the ingredient
    await db.delete(ingredients).where(eq(ingredients.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom ingredient:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the ingredient' },
      { status: 500 }
    );
  }
}
