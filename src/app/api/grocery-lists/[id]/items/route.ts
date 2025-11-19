import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, groceryLists, groceryListItems, ingredients } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { groceryListItemSchema } from '@/lib/validations/grocery-list';
import { ZodError } from 'zod';

// POST /api/grocery-lists/:id/items - Add item to grocery list
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const listId = params.id;
    const body = await req.json();
    const validated = groceryListItemSchema.parse(body);

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

    // Get ingredient to determine category if not provided
    let category = validated.category;
    if (!category) {
      const [ingredient] = await db
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, validated.ingredientId));

      if (!ingredient) {
        return NextResponse.json(
          { error: 'Ingredient not found' },
          { status: 404 }
        );
      }

      category = ingredient.category as any;
    }

    // Add the item
    const [newItem] = await db
      .insert(groceryListItems)
      .values({
        groceryListId: listId,
        ingredientId: validated.ingredientId,
        quantity: validated.quantity.toString(),
        unit: validated.unit,
        category: category as any,
        checked: false,
      })
      .returning();

    // Fetch the item with ingredient details
    const [itemWithIngredient] = await db
      .select({
        item: groceryListItems,
        ingredient: ingredients,
      })
      .from(groceryListItems)
      .where(eq(groceryListItems.id, newItem.id))
      .innerJoin(
        ingredients,
        eq(groceryListItems.ingredientId, ingredients.id)
      );

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding item to grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to add item to grocery list' },
      { status: 500 }
    );
  }
}
