import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pantryItems, ingredients, users } from '@/lib/db/schema';
import { eq, and, ilike, sql } from 'drizzle-orm';

/**
 * GET /api/pantry?search=query&category=produce
 * List all pantry items for the user's household
 */
export async function GET(request: Request) {
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

    // Get search and filter params
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    // Build conditions array
    const conditions = [eq(pantryItems.householdId, householdId)];

    if (search) {
      conditions.push(ilike(ingredients.name, `%${search}%`));
    }

    if (category) {
      conditions.push(sql`${ingredients.category} = ${category}`);
    }

    // Build and execute query - join with ingredients to get ingredient details
    const items = await db
      .select({
        id: pantryItems.id,
        quantity: pantryItems.quantity,
        unit: pantryItems.unit,
        updatedAt: pantryItems.updatedAt,
        addedBy: pantryItems.addedBy,
        ingredient: {
          id: ingredients.id,
          name: ingredients.name,
          category: ingredients.category,
          commonUnits: ingredients.commonUnits,
        },
      })
      .from(pantryItems)
      .innerJoin(ingredients, eq(pantryItems.ingredientId, ingredients.id))
      .where(and(...conditions));

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching pantry items:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching pantry items' },
      { status: 500 }
    );
  }
}
