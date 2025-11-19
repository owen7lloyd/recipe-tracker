import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  users,
  groceryLists,
  groceryListItems,
  pantryItems,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST /api/grocery-lists/:id/complete - Complete shopping trip and update pantry
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await params in Next.js 15+
    const { id: listId } = await params;

    // Get user with household
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.householdId) {
      return NextResponse.json(
        { error: 'User is not part of a household' },
        { status: 400 }
      );
    }

    const householdId = user.householdId; // Type narrowing for TypeScript

    // Check if list exists and belongs to household
    const [existingList] = await db
      .select()
      .from(groceryLists)
      .where(
        and(
          eq(groceryLists.id, listId),
          eq(groceryLists.householdId, householdId)
        )
      );

    if (!existingList) {
      return NextResponse.json(
        { error: 'Grocery list not found' },
        { status: 404 }
      );
    }

    // Get all checked items from the list
    const checkedItems = await db
      .select()
      .from(groceryListItems)
      .where(
        and(
          eq(groceryListItems.groceryListId, listId),
          eq(groceryListItems.checked, true)
        )
      );

    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      let addedCount = 0;
      let updatedCount = 0;

      // Add/update pantry items for all checked items
      for (const item of checkedItems) {
        // Check if item already exists in pantry
        const [existingPantryItem] = await tx
          .select()
          .from(pantryItems)
          .where(
            and(
              eq(pantryItems.householdId, householdId),
              eq(pantryItems.ingredientId, item.ingredientId)
            )
          );

        if (existingPantryItem) {
          // Update existing pantry item - add quantities if both have numeric values
          let newQuantity = existingPantryItem.quantity;
          if (
            existingPantryItem.quantity &&
            item.quantity &&
            !isNaN(parseFloat(existingPantryItem.quantity)) &&
            !isNaN(parseFloat(item.quantity))
          ) {
            // Only add if units match or if existing has no unit
            if (
              !existingPantryItem.unit ||
              existingPantryItem.unit === item.unit
            ) {
              newQuantity = (
                parseFloat(existingPantryItem.quantity) +
                parseFloat(item.quantity)
              ).toString();
            }
          }

          await tx
            .update(pantryItems)
            .set({
              quantity: newQuantity,
              unit: item.unit || existingPantryItem.unit,
              purchaseDate: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(pantryItems.id, existingPantryItem.id));

          updatedCount++;
        } else {
          // Create new pantry item
          await tx.insert(pantryItems).values({
            householdId: householdId,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
            addedBy: session.user.id,
            purchaseDate: new Date(),
          });

          addedCount++;
        }
      }

      // Delete the grocery list (items will be cascade deleted)
      await tx.delete(groceryLists).where(eq(groceryLists.id, listId));

      return { addedCount, updatedCount, totalProcessed: checkedItems.length };
    });

    return NextResponse.json({
      success: true,
      message: 'Shopping completed and pantry updated',
      ...result,
    });
  } catch (error) {
    console.error('Error completing shopping trip:', error);
    return NextResponse.json(
      { error: 'Failed to complete shopping trip' },
      { status: 500 }
    );
  }
}
