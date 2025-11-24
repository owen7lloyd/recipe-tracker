import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customIngredients, users, ingredients } from '@/lib/db/schema';
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
 * POST /api/ingredients/custom
 * Create a new custom ingredient for the authenticated user
 * Body: { name: string, defaultUnit?: string, category?: IngredientCategory }
 */
export async function POST(request: Request) {
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
      .then((results) => results[0]);

    if (!user?.householdId) {
      return NextResponse.json(
        { error: 'User must be part of a household' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, defaultUnit, category } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate category if provided
    const validatedCategory =
      category && VALID_CATEGORIES.includes(category as IngredientCategory)
        ? (category as IngredientCategory)
        : null;

    // Check if ingredient already exists in default database (no householdId)
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

    // Check if ingredient with same name already exists in this household's custom ingredients
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

    // Create the custom ingredient in the ingredients table
    const [newIngredient] = await db
      .insert(ingredients)
      .values({
        householdId: user.householdId,
        createdBy: session.user.id,
        name: name.trim(),
        category: validatedCategory || 'other',
      })
      .returning();

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error) {
    console.error('Error creating custom ingredient:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the ingredient' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingredients/custom
 * Get all custom ingredients for the authenticated user's household
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
      .then((results) => results[0]);

    if (!user?.householdId) {
      return NextResponse.json([]);
    }

    const householdIngredients = await db
      .select()
      .from(ingredients)
      .then((results) =>
        results.filter((r) => r.householdId === user.householdId)
      );

    return NextResponse.json(householdIngredients);
  } catch (error) {
    console.error('Error fetching custom ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching ingredients' },
      { status: 500 }
    );
  }
}
