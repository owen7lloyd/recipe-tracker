import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users,
  groceryLists,
  groceryListItems,
  ingredients,
} from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { groceryListCreateSchema } from '@/lib/validations/grocery-list';
import { ZodError } from 'zod';

// GET /api/grocery-lists - List all grocery lists for household
export async function GET(_req: NextRequest) {
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

    // Fetch all grocery lists for the household
    const lists = await db
      .select({
        list: groceryLists,
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryLists)
      .where(eq(groceryLists.householdId, user.householdId))
      .leftJoin(
        groceryListItems,
        eq(groceryLists.id, groceryListItems.groceryListId)
      )
      .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id))
      .orderBy(desc(groceryLists.createdAt));

    // Group items by list
    const listsMap = new Map<
      string,
      typeof groceryLists.$inferSelect & { items: unknown[] }
    >();

    for (const row of lists) {
      if (!listsMap.has(row.list.id)) {
        listsMap.set(row.list.id, {
          ...row.list,
          items: [],
        });
      }

      if (row.item && row.ingredient) {
        listsMap.get(row.list.id)!.items.push({
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

    const result = Array.from(listsMap.values());
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching grocery lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grocery lists' },
      { status: 500 }
    );
  }
}

// POST /api/grocery-lists - Create a custom grocery list
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validated = groceryListCreateSchema.parse(body);

    // Create the list
    const [newList] = await db
      .insert(groceryLists)
      .values({
        householdId: user.householdId,
        name: validated.name,
        createdBy: user.id,
      })
      .returning();

    // Create items if provided
    if (validated.items && validated.items.length > 0) {
      const itemsToInsert = validated.items.map((item) => ({
        groceryListId: newList.id,
        ingredientId: item.ingredientId,
        quantity: item.quantity.toString(),
        unit: item.unit,
        category: item.category as
          | 'produce'
          | 'dairy'
          | 'meat'
          | 'seafood'
          | 'pantry'
          | 'frozen'
          | 'bakery'
          | 'other',
        checked: false,
      }));

      await db.insert(groceryListItems).values(itemsToInsert);
    }

    // Fetch the created list with items
    const listWithItems = await db
      .select({
        list: groceryLists,
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryLists)
      .where(eq(groceryLists.id, newList.id))
      .leftJoin(
        groceryListItems,
        eq(groceryLists.id, groceryListItems.groceryListId)
      )
      .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id));

    const itemsMap = new Map<
      string,
      typeof groceryLists.$inferSelect & { items: unknown[] }
    >();
    for (const row of listWithItems) {
      if (row.item && row.ingredient) {
        itemsMap.set(row.item.id, {
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

    return NextResponse.json(
      {
        ...newList,
        items: Array.from(itemsMap.values()),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to create grocery list' },
      { status: 500 }
    );
  }
}
