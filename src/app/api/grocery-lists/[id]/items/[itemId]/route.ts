import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, groceryLists, groceryListItems, ingredients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { groceryListItemUpdateSchema } from '@/lib/validations/grocery-list';
import { ZodError } from 'zod';

// PUT /api/grocery-lists/:id/items/:itemId - Update item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with household
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.householdId) {
      return NextResponse.json(
        { error: 'User is not part of a household' },
        { status: 400 }
      );
    }

    const { id: listId, itemId } = params;
    const body = await req.json();
    const validated = groceryListItemUpdateSchema.parse(body);

    // Check if list exists and belongs to household
    const [existingList] = await db
      .select()
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, user.householdId)
        )
      );

    if (!existingList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(groceryListItems)
      .where(
        and(
          eq(groceryListItems.id, itemId),
          eq(groceryListItems.groceryListId, listId)
        )
      );

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (validated.quantity !== undefined) {
      updateData.quantity = validated.quantity.toString();
    }
    if (validated.unit !== undefined) {
      updateData.unit = validated.unit;
    }
    if (validated.checked !== undefined) {
      updateData.checked = validated.checked;
      if (validated.checked) {
        updateData.checkedBy = user.id;
        updateData.checkedAt = new Date();
      } else {
        updateData.checkedBy = null;
        updateData.checkedAt = null;
      }
    }

    // Update the item
    const [updatedItem] = await db
      .update(groceryListItems)
      .set(updateData)
      .where(eq(groceryListItems.id, itemId))
      .returning();

    // Fetch updated item with ingredient details
    const [itemWithIngredient] = await db
      .select({
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryListItems)
      .where(eq(groceryListItems.id, itemId))
      .innerJoin(
        ingredients,
        eq(groceryListItems.ingredientId, ingredients.id)
      );

    return NextResponse.json({
      id: itemWithIngredient.item.id,
      ingredientId: itemWithIngredient.item.ingredientId,
      ingredient: itemWithIngredient.ingredient,
      quantity: itemWithIngredient.item.quantity,
      unit: itemWithIngredient.item.unit,
      category: itemWithIngredient.item.category,
      checked: itemWithIngredient.item.checked,
      checkedBy: itemWithIngredient.item.checkedBy,
      checkedAt: itemWithIngredient.item.checkedAt,
      recipeIds: itemWithIngredient.item.recipeIds,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating grocery list item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-lists/:id/items/:itemId - Delete item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with household
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.householdId) {
      return NextResponse.json(
        { error: 'User is not part of a household' },
        { status: 400 }
      );
    }

    const { id: listId, itemId } = params;

    // Check if list exists and belongs to household
    const [existingList] = await db
      .select()
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, user.householdId)
        )
      );

    if (!existingList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Check if item exists
    const [existingItem] = await db
      .select()
      .from(groceryListItems)
      .where(
        and(
          eq(groceryListItems.id, itemId),
          eq(groceryListItems.groceryListId, listId)
        )
      );

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    await db.delete(groceryListItems).where(eq(groceryListItems.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grocery list item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
