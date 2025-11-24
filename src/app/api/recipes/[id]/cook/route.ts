import { z } from 'zod';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pantryItems, users, recipeHistory } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
} from '@/lib/recipe/helpers';
import { scaleRecipe } from '@/lib/recipe-scaling';
import { convertBetweenUnits, roundQuantity } from '@/lib/units/converter';
import { areUnitsCompatible } from '@/lib/units/conversions';

// Schema for cook recipe request
const cookRecipeSchema = z.object({
  servings: z.number().int().positive().optional(),
  adjustments: z
    .array(
      z.object({
        ingredientId: z.string().uuid(),
        quantity: z.number().nonnegative(),
      })
    )
    .optional(),
});

interface PantryUpdate {
  ingredientId: string;
  ingredientName: string | null;
  before: string;
  after: string;
  removed: boolean;
  unit: string | null;
  unitMismatch?: boolean;
  conversionNote?: string;
}

/**
 * POST /api/recipes/:id/cook
 * Cook a recipe and deduct ingredients from pantry
 */
export async function POST(
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = cookRecipeSchema.parse(body);

    // Get recipe with ingredients
    const recipe = await getRecipeWithIngredients(id);
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Scale recipe if servings specified
    const targetServings = validatedData.servings || recipe.servings;
    const scaledRecipe = scaleRecipe(recipe, targetServings);

    // Process pantry updates in a transaction
    const updates = await db.transaction(async (tx) => {
      const pantryUpdates: PantryUpdate[] = [];

      for (const ingredient of scaledRecipe.ingredients) {
        // Skip optional ingredients
        if (ingredient.optional) continue;

        // Check for manual adjustment
        const adjustment = validatedData.adjustments?.find(
          (a: { ingredientId: string; quantity: number }) =>
            a.ingredientId === ingredient.ingredientId
        );

        // Determine quantity needed
        let quantityNeeded: number;
        if (adjustment !== undefined) {
          quantityNeeded = adjustment.quantity;
        } else if (ingredient.scaledQuantity !== null) {
          quantityNeeded = ingredient.scaledQuantity;
        } else {
          // Skip non-numeric quantities (like "to taste")
          continue;
        }

        if (quantityNeeded === 0) continue;

        // Find pantry item
        const [pantryItem] = await tx
          .select()
          .from(pantryItems)
          .where(
            and(
              eq(pantryItems.householdId, householdId),
              eq(pantryItems.ingredientId, ingredient.ingredientId)
            )
          )
          .limit(1);

        if (!pantryItem) continue;

        // Skip if no quantity tracked
        if (!pantryItem.quantity) continue;

        const currentQuantity = parseFloat(pantryItem.quantity);

        // Handle unit conversion if needed
        let quantityToDeduct = quantityNeeded;
        let conversionNote: string | undefined;

        if (
          pantryItem.unit &&
          ingredient.unit &&
          pantryItem.unit !== ingredient.unit
        ) {
          // Units don't match - attempt conversion
          if (!areUnitsCompatible(pantryItem.unit, ingredient.unit)) {
            // Units are incompatible (e.g., cups vs pounds)
            // Log warning and skip this ingredient
            console.warn(
              `Skipping pantry deduction for ${ingredient.ingredientName}: ` +
                `incompatible units (recipe: ${ingredient.unit}, pantry: ${pantryItem.unit})`
            );

            pantryUpdates.push({
              ingredientId: ingredient.ingredientId,
              ingredientName: ingredient.ingredientName,
              before: pantryItem.quantity,
              after: pantryItem.quantity,
              removed: false,
              unit: pantryItem.unit,
              unitMismatch: true,
              conversionNote: `Cannot deduct: recipe uses ${ingredient.unit} but pantry tracks ${pantryItem.unit}`,
            });

            continue;
          }

          // Units are compatible - convert
          const converted = convertBetweenUnits(
            quantityNeeded,
            ingredient.unit,
            pantryItem.unit
          );

          if (converted === null) {
            // Conversion failed (shouldn't happen if units are compatible)
            console.error(
              `Unit conversion failed for ${ingredient.ingredientName}: ` +
                `${ingredient.unit} to ${pantryItem.unit}`
            );
            continue;
          }

          quantityToDeduct = roundQuantity(converted);
          conversionNote = `Converted ${quantityNeeded} ${ingredient.unit} to ${quantityToDeduct} ${pantryItem.unit}`;
        }

        const remainingQuantity = currentQuantity - quantityToDeduct;

        if (remainingQuantity <= 0) {
          // Remove item from pantry
          await tx.delete(pantryItems).where(eq(pantryItems.id, pantryItem.id));

          pantryUpdates.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            before: pantryItem.quantity,
            after: '0',
            removed: true,
            unit: pantryItem.unit,
            conversionNote,
          });
        } else {
          // Update quantity
          const roundedRemaining = roundQuantity(remainingQuantity);
          await tx
            .update(pantryItems)
            .set({
              quantity: roundedRemaining.toString(),
              updatedAt: new Date(),
            })
            .where(eq(pantryItems.id, pantryItem.id));

          pantryUpdates.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            before: pantryItem.quantity,
            after: roundedRemaining.toString(),
            removed: false,
            unit: pantryItem.unit,
            conversionNote,
          });
        }
      }

      // Record cooking history
      await tx.insert(recipeHistory).values({
        recipeId: recipe.id,
        householdId: householdId,
        cookedBy: session.user.id,
        servings: targetServings,
      });

      return pantryUpdates;
    });

    return NextResponse.json({
      success: true,
      message: `Cooked ${recipe.title}`,
      updates,
      servingsCooked: targetServings,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error cooking recipe:', error);
    return NextResponse.json(
      { error: 'An error occurred while cooking recipe' },
      { status: 500 }
    );
  }
}
