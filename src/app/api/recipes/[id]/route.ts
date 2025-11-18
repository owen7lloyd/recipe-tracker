import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { recipes, recipeIngredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateRecipeSchema } from '@/lib/validations/recipe';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
  deleteRecipe,
} from '@/lib/recipe/helpers';

// GET /api/recipes/:id - Get single recipe with ingredients
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this recipe
    const hasAccess = await requireRecipeAccess(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const recipe = await getRecipeWithIngredients(id);
    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching recipe' },
      { status: 500 }
    );
  }
}

// PUT /api/recipes/:id - Update recipe
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this recipe
    const hasAccess = await requireRecipeAccess(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateRecipeSchema.parse(body);

    // Update recipe
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.imageUrl !== undefined)
      updateData.imageUrl = validatedData.imageUrl;
    if (validatedData.sourceUrl !== undefined)
      updateData.sourceUrl = validatedData.sourceUrl;
    if (validatedData.category !== undefined)
      updateData.category = validatedData.category;
    if (validatedData.tags !== undefined) updateData.tags = validatedData.tags;
    if (validatedData.prepTimeMinutes !== undefined)
      updateData.prepTimeMinutes = validatedData.prepTimeMinutes;
    if (validatedData.cookTimeMinutes !== undefined)
      updateData.cookTimeMinutes = validatedData.cookTimeMinutes;
    if (validatedData.servings !== undefined)
      updateData.servings = validatedData.servings;
    if (validatedData.rating !== undefined)
      updateData.rating = validatedData.rating;
    if (validatedData.instructions !== undefined)
      updateData.instructions = validatedData.instructions;

    const [updatedRecipe] = await db
      .update(recipes)
      .set(updateData)
      .where(eq(recipes.id, id))
      .returning();

    // Update ingredients if provided
    if (validatedData.ingredients !== undefined) {
      // Delete existing ingredients
      await db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, id));

      // Insert new ingredients
      if (validatedData.ingredients.length > 0) {
        await db.insert(recipeIngredients).values(
          validatedData.ingredients.map((ing) => ({
            recipeId: id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity?.toString() || null,
            unit: ing.unit || null,
            notes: ing.notes || null,
            optional: ing.optional || false,
          }))
        );
      }
    }

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating recipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/recipes/:id - Delete recipe
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this recipe
    const hasAccess = await requireRecipeAccess(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const deleted = await deleteRecipe(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Recipe deleted' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting recipe' },
      { status: 500 }
    );
  }
}
