import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { createRecipeSchema } from '@/lib/validations/recipe';
import { getUserHouseholdId, searchRecipes } from '@/lib/recipe/helpers';

// GET /api/recipes - List recipes with filters and pagination
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household
    const householdId = await getUserHouseholdId(session.user.id);
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to a household' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',').filter(Boolean) : undefined;
    const ingredientsParam = searchParams.get('ingredients');
    const ingredientIds = ingredientsParam
      ? ingredientsParam.split(',').filter(Boolean)
      : undefined;
    const sortBy = (searchParams.get('sortBy') as string) || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Search recipes
    const result = await searchRecipes(householdId, {
      search,
      category,
      tags,
      ingredientIds,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching recipes' },
      { status: 500 }
    );
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household
    const householdId = await getUserHouseholdId(session.user.id);
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to a household' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRecipeSchema.parse(body);

    // Create recipe in a transaction
    const [newRecipe] = await db
      .insert(recipes)
      .values({
        householdId,
        title: validatedData.title,
        description: validatedData.description || null,
        imageUrl: validatedData.imageUrl || null,
        sourceUrl: validatedData.sourceUrl || null,
        category: validatedData.category,
        tags: validatedData.tags,
        prepTimeMinutes: validatedData.prepTimeMinutes || null,
        cookTimeMinutes: validatedData.cookTimeMinutes || null,
        servings: validatedData.servings,
        rating: validatedData.rating || null,
        instructions: validatedData.instructions,
        createdBy: session.user.id,
      })
      .returning();

    // Insert recipe ingredients
    if (validatedData.ingredients.length > 0) {
      await db.insert(recipeIngredients).values(
        validatedData.ingredients.map((ing) => ({
          recipeId: newRecipe.id,
          ingredientId: ing.ingredientId,
          quantity: ing.quantity?.toString() || null,
          unit: ing.unit || null,
          notes: ing.notes || null,
          optional: ing.optional,
        }))
      );
    }

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error creating recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating recipe' },
      { status: 500 }
    );
  }
}
