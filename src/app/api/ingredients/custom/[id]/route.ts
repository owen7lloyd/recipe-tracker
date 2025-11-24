import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customIngredients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Verify the ingredient exists and belongs to the user
    const ingredient = await db
      .select()
      .from(customIngredients)
      .where(
        and(
          eq(customIngredients.id, id),
          eq(customIngredients.userId, session.user.id)
        )
      )
      .then((results) => results[0]);

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, defaultUnit, category } = body;

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

    // If name is being changed, check for duplicates
    if (name && name.toLowerCase() !== ingredient.name.toLowerCase()) {
      const existing = await db
        .select()
        .from(customIngredients)
        .where(eq(customIngredients.userId, session.user.id))
        .then((results) =>
          results.find((r) => r.name.toLowerCase() === name.toLowerCase())
        );

      if (existing) {
        return NextResponse.json(
          { error: 'An ingredient with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the ingredient
    const [updated] = await db
      .update(customIngredients)
      .set({
        name: name ? name.trim() : ingredient.name,
        defaultUnit:
          defaultUnit !== undefined ? defaultUnit : ingredient.defaultUnit,
        category: validatedCategory,
        updatedAt: new Date(),
      })
      .where(eq(customIngredients.id, id))
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
 * Delete a custom ingredient (only the owner can delete)
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

    // Verify the ingredient exists and belongs to the user
    const ingredient = await db
      .select()
      .from(customIngredients)
      .where(
        and(
          eq(customIngredients.id, id),
          eq(customIngredients.userId, session.user.id)
        )
      )
      .then((results) => results[0]);

    if (!ingredient) {
      return NextResponse.json(
        { error: 'Ingredient not found' },
        { status: 404 }
      );
    }

    // Delete the ingredient
    await db.delete(customIngredients).where(eq(customIngredients.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom ingredient:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the ingredient' },
      { status: 500 }
    );
  }
}
