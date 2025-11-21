import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { groceryLists, groceryListItems, ingredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/grocery-lists/shared/:token - Public access to shared list
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the list by share token
    const [list] = await db
      .select()
      .from(groceryLists)
      .where(eq(groceryLists.shareToken, token));

    if (!list) {
      return NextResponse.json(
        { error: 'Share link not found' },
        { status: 404 }
      );
    }

    // Check if share link has expired
    if (list.shareExpiresAt && list.shareExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Share link has expired' },
        { status: 410 }
      );
    }

    // Fetch list items
    const listData = await db
      .select({
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryListItems)
      .where(eq(groceryListItems.groceryListId, list.id))
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
      shared: true,
      expiresAt: list.shareExpiresAt,
    });
  } catch (error) {
    console.error('Error fetching shared grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared grocery list' },
      { status: 500 }
    );
  }
}
