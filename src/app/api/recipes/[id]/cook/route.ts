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
import { convertBetweenUnits, canConvert } from '@/lib/units/converter';

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
  unitMismatch?: boolean; // Flagged if units don't match and couldn't be converted
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

        console.log(
          `\n[COOK] Processing ingredient: ${ingredient.ingredientName}`,
          {
            ingredientId: ingredient.ingredientId,
            recipeQuantity: quantityNeeded,
            recipeUnit: ingredient.unit,
            recipeUnitType: typeof ingredient.unit,
            pantryQuantity: pantryItem.quantity,
            pantryUnit: pantryItem.unit,
            pantryUnitType: typeof pantryItem.unit,
          }
        );

        const currentQuantity = parseFloat(pantryItem.quantity);
        let quantityToDeduct = quantityNeeded;

        // Check if units exist and differ
        const pantryHasUnit = !!pantryItem.unit;
        const recipeHasUnit = !!ingredient.unit;
        const unitsAreDifferent = pantryItem.unit !== ingredient.unit;

        console.log(`[COOK] Unit analysis:`, {
          pantryHasUnit,
          recipeHasUnit,
          unitsAreDifferent,
          pantryUnit: pantryItem.unit,
          recipeUnit: ingredient.unit,
        });

        // If units don't match and both exist, attempt conversion
        if (pantryHasUnit && recipeHasUnit && unitsAreDifferent) {
          console.log(`[COOK] Units differ - attempting conversion...`);

          // Check if units are convertible
          const isConvertible = canConvert(ingredient.unit, pantryItem.unit);
          console.log(
            `[COOK] canConvert(${ingredient.unit}, ${pantryItem.unit}) = ${isConvertible}`
          );

          if (!isConvertible) {
            // Units are incompatible - log warning and skip deduction
            console.warn(
              `Skipping ingredient "${ingredient.ingredientName}": ` +
                `recipe uses ${ingredient.unit} but pantry has ${pantryItem.unit} (incompatible units)`
            );

            pantryUpdates.push({
              ingredientId: ingredient.ingredientId,
              ingredientName: ingredient.ingredientName,
              before: pantryItem.quantity,
              after: pantryItem.quantity,
              removed: false,
              unit: pantryItem.unit,
              unitMismatch: true,
            });
            continue;
          }

          // Convert recipe quantity to pantry unit
          console.log(
            `[COOK] Converting ${quantityNeeded} ${ingredient.unit} to ${pantryItem.unit}...`
          );

          const converted = convertBetweenUnits(
            quantityNeeded,
            ingredient.unit,
            pantryItem.unit
          );

          console.log(
            `[COOK] Conversion result: ${quantityNeeded} ${ingredient.unit} = ${converted} ${pantryItem.unit}`
          );

          if (converted === null) {
            // Conversion failed - skip deduction
            console.warn(
              `Failed to convert "${ingredient.ingredientName}" from ${ingredient.unit} to ${pantryItem.unit}`
            );

            pantryUpdates.push({
              ingredientId: ingredient.ingredientId,
              ingredientName: ingredient.ingredientName,
              before: pantryItem.quantity,
              after: pantryItem.quantity,
              removed: false,
              unit: pantryItem.unit,
              unitMismatch: true,
            });
            continue;
          }

          quantityToDeduct = converted;
          console.log(`[COOK] Using converted quantity: ${quantityToDeduct}`);
        } else if (pantryHasUnit !== recipeHasUnit) {
          // One has a unit, the other doesn't - can't reliably deduct
          console.warn(
            `Skipping ingredient "${ingredient.ingredientName}": ` +
              `unit mismatch - recipe ${recipeHasUnit ? 'has' : 'lacks'} unit (${ingredient.unit}), ` +
              `pantry ${pantryHasUnit ? 'has' : 'lacks'} unit (${pantryItem.unit})`
          );

          pantryUpdates.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            before: pantryItem.quantity,
            after: pantryItem.quantity,
            removed: false,
            unit: pantryItem.unit,
            unitMismatch: true,
          });
          continue;
        } else {
          console.log(
            `[COOK] Units match or both missing - using quantity directly: ${quantityToDeduct}`
          );
        }

        console.log(
          `[COOK] Calculation: ${currentQuantity} - ${quantityToDeduct} = ?`
        );

        const remainingQuantity = currentQuantity - quantityToDeduct;

        console.log(`[COOK] Remaining quantity: ${remainingQuantity}`);

        if (remainingQuantity <= 0) {
          // Remove item from pantry
          await tx.delete(pantryItems).where(eq(pantryItems.id, pantryItem.id));

          console.log(
            `[COOK] Item removed from pantry (remaining: ${remainingQuantity})`
          );

          pantryUpdates.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            before: pantryItem.quantity,
            after: '0',
            removed: true,
            unit: pantryItem.unit,
          });
        } else {
          // Update quantity
          await tx
            .update(pantryItems)
            .set({
              quantity: remainingQuantity.toString(),
              updatedAt: new Date(),
            })
            .where(eq(pantryItems.id, pantryItem.id));

          console.log(
            `[COOK] Item updated in pantry: ${pantryItem.quantity} ${pantryItem.unit} → ${remainingQuantity} ${pantryItem.unit}`
          );

          pantryUpdates.push({
            ingredientId: ingredient.ingredientId,
            ingredientName: ingredient.ingredientName,
            before: pantryItem.quantity,
            after: remainingQuantity.toString(),
            removed: false,
            unit: pantryItem.unit,
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
