import { db } from './db';
import {
  recipes,
  recipeIngredients,
  pantryItems,
  ingredients,
  groceryLists,
  groceryListItems,
} from './db/schema';
import { eq, inArray } from 'drizzle-orm';

interface GroceryListGenerationRequest {
  recipeIds: string[];
  servings?: Record<string, number>; // recipe_id -> servings
  name?: string;
}

interface NeededIngredient {
  ingredientId: string;
  ingredient: {
    id: string;
    name: string;
    category: string;
  };
  quantity: number;
  unit: string;
  recipeIds: string[];
}

export async function generateGroceryList(
  req: GroceryListGenerationRequest,
  householdId: string,
  userId: string
) {
  // Fetch recipes with their ingredients
  const recipesData = await db
    .select()
    .from(recipes)
    .where(inArray(recipes.id, req.recipeIds))
    .innerJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .innerJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id));

  // Fetch pantry items for the household
  const pantryData = await db
    .select()
    .from(pantryItems)
    .where(eq(pantryItems.householdId, householdId))
    .innerJoin(ingredients, eq(pantryItems.ingredientId, ingredients.id));

  // Build pantry lookup map
  const pantryMap = new Map<
    string,
    { quantity: string | null; unit: string | null }
  >();
  for (const item of pantryData) {
    pantryMap.set(item.pantry_items.ingredientId, {
      quantity: item.pantry_items.quantity,
      unit: item.pantry_items.unit,
    });
  }

  // Group recipe data by recipe
  const recipeMap = new Map<
    string,
    {
      servings: number;
      ingredients: Array<{
        ingredientId: string;
        ingredient: typeof ingredients.$inferSelect;
        quantity: string | null;
        unit: string | null;
        optional: boolean;
      }>;
    }
  >();

  for (const row of recipesData) {
    const recipeId = row.recipes.id;
    if (!recipeMap.has(recipeId)) {
      recipeMap.set(recipeId, {
        servings: row.recipes.servings,
        ingredients: [],
      });
    }

    const recipeData = recipeMap.get(recipeId)!;
    recipeData.ingredients.push({
      ingredientId: row.recipe_ingredients.ingredientId,
      ingredient: row.ingredients,
      quantity: row.recipe_ingredients.quantity,
      unit: row.recipe_ingredients.unit,
      optional: row.recipe_ingredients.optional || false,
    });
  }

  // Build map of needed ingredients
  const needed = new Map<string, NeededIngredient>();

  for (const [recipeId, recipeData] of recipeMap) {
    const targetServings = req.servings?.[recipeId] || recipeData.servings;
    const scaleFactor = targetServings / recipeData.servings;

    for (const recipeIng of recipeData.ingredients) {
      // Skip optional ingredients
      if (recipeIng.optional) continue;

      const quantityNeeded = recipeIng.quantity
        ? parseFloat(recipeIng.quantity) * scaleFactor
        : 0;

      // Check pantry
      const pantryItem = pantryMap.get(recipeIng.ingredientId);
      const inPantry = pantryItem?.quantity
        ? parseFloat(pantryItem.quantity)
        : 0;

      // Calculate still needed
      let stillNeeded = quantityNeeded;
      if (inPantry > 0 && quantityNeeded > 0) {
        stillNeeded = Math.max(0, quantityNeeded - inPantry);
      }

      // If we have enough in pantry and quantity is tracked, skip
      if (stillNeeded === 0 && inPantry > 0 && quantityNeeded > 0) {
        continue;
      }

      // If quantity is not specified in recipe, add to list anyway
      const finalQuantity = quantityNeeded > 0 ? stillNeeded : 1;

      // Add or update needed quantity
      if (needed.has(recipeIng.ingredientId)) {
        const existing = needed.get(recipeIng.ingredientId)!;

        // Combine quantities if units match
        if (
          existing.unit === (recipeIng.unit || '') ||
          (!existing.unit && !recipeIng.unit)
        ) {
          existing.quantity += finalQuantity;
        } else {
          // Different units - just add the quantity for now
          // In a more advanced version, we could handle unit conversions
          existing.quantity += finalQuantity;
          if (existing.unit !== recipeIng.unit) {
            existing.unit = existing.unit
              ? `${existing.unit}/${recipeIng.unit || ''}`
              : recipeIng.unit || '';
          }
        }

        if (!existing.recipeIds.includes(recipeId)) {
          existing.recipeIds.push(recipeId);
        }
      } else {
        needed.set(recipeIng.ingredientId, {
          ingredientId: recipeIng.ingredientId,
          ingredient: {
            id: recipeIng.ingredient.id,
            name: recipeIng.ingredient.name,
            category: recipeIng.ingredient.category,
          },
          quantity: finalQuantity,
          unit: recipeIng.unit || '',
          recipeIds: [recipeId],
        });
      }
    }
  }

  // Check if any items are needed
  const itemsToInsert = Array.from(needed.values()).map((item) => ({
    ingredientId: item.ingredientId,
    quantity: item.quantity.toString(),
    unit: item.unit,
    category: item.ingredient.category,
    recipeIds: item.recipeIds,
    checked: false,
  }));

  // If no items are needed, throw an error to prevent creating an empty list
  if (itemsToInsert.length === 0) {
    throw new Error(
      'NO_ITEMS_NEEDED:You already have all the ingredients needed for the selected recipes in your pantry!'
    );
  }

  // Create grocery list
  const listName =
    req.name || `Shopping List - ${new Date().toLocaleDateString()}`;

  const [newList] = await db
    .insert(groceryLists)
    .values({
      householdId,
      name: listName,
      createdBy: userId,
    })
    .returning();

  // Add groceryListId to items and insert
  const itemsWithListId = itemsToInsert.map((item) => ({
    ...item,
    groceryListId: newList.id,
  }));

  await db.insert(groceryListItems).values(itemsWithListId);

  // Fetch the complete list with items and ingredients
  const listWithItems = await db
    .select({
      list: groceryLists,
      item: groceryListItems,
      ingredient: ingredients,
    })
    .from(groceryLists)
    .where(eq(groceryLists.id, newList.id))
    .leftJoin(
      groceryListItems,
      eq(groceryLists.id, groceryListItems.groceryListId)
    )
    .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id));

  // Format the response
  const itemsMap = new Map<
    string,
    {
      id: string;
      ingredientId: string;
      ingredient: typeof ingredients.$inferSelect;
      quantity: string;
      unit: string | null;
      category: string;
      checked: boolean;
      checkedBy: string | null;
      checkedAt: Date | null;
      recipeIds: string[] | null;
    }
  >();
  for (const row of listWithItems) {
    if (row.item && row.ingredient) {
      itemsMap.set(row.item.id, {
        id: row.item.id,
        ingredientId: row.item.ingredientId,
        ingredient: row.ingredient,
        quantity: row.item.quantity,
        unit: row.item.unit,
        category: row.item.category,
        checked: row.item.checked,
        checkedBy: row.item.checkedBy,
        checkedAt: row.item.checkedAt,
        recipeIds: row.item.recipeIds,
      });
    }
  }

  return {
    ...newList,
    items: Array.from(itemsMap.values()),
  };
}
