import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users,
  groceryLists,
  groceryListItems,
  ingredients,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { groceryListUpdateSchema } from '@/lib/validations/grocery-list';
import { ZodError } from 'zod';

// GET /api/grocery-lists/:id - Get specific grocery list
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id: listId } = await params;

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

    // Fetch the grocery list with items
    const listData = await db
      .select({
        list: groceryLists,
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, user.householdId)
        )
      )
      .leftJoin(
        groceryListItems,
        eq(groceryLists.id, groceryListItems.groceryListId)
      )
      .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id));

    if (listData.length === 0) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Format the response
    const list = listData[0].list;
    const items: Array<{
      id: string;
      ingredientId: string;
      ingredient: typeof ingredients.$inferSelect;
      quantity: string;
      unit: string | null;
      category: string;
      checked: boolean | null;
      checkedBy: string | null;
      checkedAt: Date | null;
      recipeIds: string[] | null;
    }> = [];

    for (const row of listData) {
      if (row.item && row.ingredient) {
        items.push({
          id: row.item.id,
          ingredientId: row.item.ingredientId,
          ingredient: row.ingredient,
          quantity: row.item.quantity,
          unit: row.item.unit,
          category: row.item.category,
          checked: row.item.checked,
          checkedBy: row.item.checkedBy,
          checkedAt: row.item.checkedAt,
          recipeIds: row.item.recipeIds,
        });
      }
    }

    return NextResponse.json({
      ...list,
      items,
    });
  } catch (error) {
    console.error('Error fetching grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grocery list' },
      { status: 500 }
    );
  }
}

// PUT /api/grocery-lists/:id - Update grocery list
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id: listId } = await params;

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

    const body = await req.json();
    const validated = groceryListUpdateSchema.parse(body);

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

    // Update the list
    const [updatedList] = await db
      .update(groceryLists)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(groceryLists.id, listId))
      .returning();

    // Fetch updated list with items
    const listWithItems = await db
      .select({
        list: groceryLists,
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryLists)
      .where(eq(groceryLists.id, listId))
      .leftJoin(
        groceryListItems,
        eq(groceryLists.id, groceryListItems.groceryListId)
      )
      .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id));

    const items: Array<{
      id: string;
      ingredientId: string;
      ingredient: typeof ingredients.$inferSelect;
      quantity: string;
      unit: string | null;
      category: string;
      checked: boolean | null;
      checkedBy: string | null;
      checkedAt: Date | null;
      recipeIds: string[] | null;
    }> = [];
    for (const row of listWithItems) {
      if (row.item && row.ingredient) {
        items.push({
          id: row.item.id,
          ingredientId: row.item.ingredientId,
          ingredient: row.ingredient,
          quantity: row.item.quantity,
          unit: row.item.unit,
          category: row.item.category,
          checked: row.item.checked,
          checkedBy: row.item.checkedBy,
          checkedAt: row.item.checkedAt,
          recipeIds: row.item.recipeIds,
        });
      }
    }

    return NextResponse.json({
      ...updatedList,
      items,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to update grocery list' },
      { status: 500 }
    );
  }
}

// DELETE /api/grocery-lists/:id - Delete grocery list
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id: listId } = await params;

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

    // Delete the list (items will be cascade deleted)
    await db.delete(groceryLists).where(eq(groceryLists.id, listId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to delete grocery list' },
      { status: 500 }
    );
  }
}
