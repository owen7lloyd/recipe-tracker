import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { customIngredients } from '@/lib/db/schema';
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

    // Check if ingredient with same name already exists for this user
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

    // Create the custom ingredient
    const [newIngredient] = await db
      .insert(customIngredients)
      .values({
        userId: session.user.id,
        name: name.trim(),
        defaultUnit: defaultUnit || null,
        category: validatedCategory,
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
 * Get all custom ingredients for the authenticated user
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userIngredients = await db
      .select()
      .from(customIngredients)
      .where(eq(customIngredients.userId, session.user.id));

    return NextResponse.json(userIngredients);
  } catch (error) {
    console.error('Error fetching custom ingredients:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching ingredients' },
      { status: 500 }
    );
  }
}
