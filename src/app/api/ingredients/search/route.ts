import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ingredients, customIngredients } from '@/lib/db/schema';
import { ilike, and, eq, or, sql } from 'drizzle-orm';

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

    // Build and execute query for default ingredients
    const baseQuery = db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        category: ingredients.category,
        commonUnits: ingredients.commonUnits,
        isCustom: sql<boolean>`false`,
      })
      .from(ingredients);

    const defaultResults = await (conditions.length > 0
      ? baseQuery.where(and(...conditions)).limit(limit)
      : baseQuery.limit(limit));

    // Also search custom ingredients for this user
    const customConditions = [eq(customIngredients.userId, session.user.id)];

    if (query) {
      customConditions.push(ilike(customIngredients.name, `%${query}%`));
    } else if (category) {
      customConditions.push(eq(customIngredients.category, category));
    }

    const customResults = await db
      .select({
        id: customIngredients.id,
        name: customIngredients.name,
        category: customIngredients.category,
        commonUnits: sql<null>`null`,
        isCustom: sql<boolean>`true`,
      })
      .from(customIngredients)
      .where(and(...customConditions))
      .limit(limit);

    // Combine and deduplicate results (prioritize custom ingredients if same name)
    const combinedResults = [
      ...defaultResults,
      ...customResults.filter(
        (custom) =>
          !defaultResults.some(
            (d) => d.name.toLowerCase() === custom.name.toLowerCase()
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
