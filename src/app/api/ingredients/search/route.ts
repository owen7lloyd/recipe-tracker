import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ingredients, users } from '@/lib/db/schema';
import { ilike, and, eq, sql } from 'drizzle-orm';

// Valid ingredient categories
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
 * GET /api/ingredients/search?q=query&category=produce&limit=20
 * Search ingredients with fuzzy matching
 * Supports optional category filtering and configurable limit
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Validate category if provided
    const category: IngredientCategory | null =
      categoryParam &&
      VALID_CATEGORIES.includes(categoryParam as IngredientCategory)
        ? (categoryParam as IngredientCategory)
        : null;

    // Build filters array
    const conditions = [];

    if (query) {
      // Use ILIKE for case-insensitive search (PostgreSQL)
      conditions.push(ilike(ingredients.name, `%${query}%`));
    }

    if (category) {
      conditions.push(eq(ingredients.category, category));
    }

    // Get user's household
    const user = await db
      .select({ householdId: users.householdId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .then((results) => results[0]);

    // Search all ingredients (both default and custom for this household)
    const defaultConditions = [
      ...conditions,
      sql`"ingredients"."household_id" IS NULL`,
    ];

    const baseQuery = db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        commonUnits: ingredients.commonUnits,
        isCustom: sql<boolean>`false`,
      })
      .from(ingredients);

    const defaultResults = await (defaultConditions.length > 0
      ? baseQuery.where(and(...defaultConditions)).limit(limit)
      : baseQuery
          .where(sql`"ingredients"."household_id" IS NULL`)
          .limit(limit));

    // Also search custom ingredients for this household
    let customResults: typeof defaultResults = [];
    if (user?.householdId) {
      const householdId = user.householdId;
      const customConditions = [eq(ingredients.householdId, householdId)];

      if (query) {
        customConditions.push(ilike(ingredients.name, `%${query}%`));
      }
      if (category) {
        customConditions.push(eq(ingredients.category, category));
      }

      const results = await db
        .select({
          id: ingredients.id,
          name: ingredients.name,
          category: ingredients.category,
          commonUnits: ingredients.commonUnits,
          isCustom: sql<boolean>`true`,
        })
        .from(ingredients)
        .where(and(...customConditions))
        .limit(limit);

      customResults = results;
    }

    // Combine and deduplicate results (prioritize custom ingredients if same name)
    const combinedResults = [
      ...customResults,
      ...defaultResults.filter(
        (d) =>
          !customResults.some(
            (c) => c.name.toLowerCase() === d.name.toLowerCase()
          )
      ),
    ].slice(0, limit);

    return NextResponse.json(combinedResults);
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while searching ingredients' },
      { status: 500 }
    );
  }
}
