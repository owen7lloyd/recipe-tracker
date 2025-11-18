import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { pantryItems, users } from '@/lib/db/schema';
import { bulkUpdateSchema } from '@/lib/validations/pantry';
import { eq, inArray, and } from 'drizzle-orm';
import { ZodError } from 'zod';

/**
 * POST /api/pantry/bulk-update
 * Perform bulk add, update, and delete operations on pantry items
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
    const validatedData = bulkUpdateSchema.parse(body);

    // Use transaction for atomicity
    const results = await db.transaction(async (tx) => {
      const added = [];
      const updated = [];
      const deleted = [];

      // Add new items
      if (validatedData.add?.length) {
        for (const item of validatedData.add) {
          // Check if item already exists
          const existing = await tx
            .select()
            .from(pantryItems)
            .where(
              and(
                eq(pantryItems.householdId, householdId),
                eq(pantryItems.ingredientId, item.ingredientId)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            // Update existing item
            const [updatedItem] = await tx
              .update(pantryItems)
              .set({
                quantity: item.quantity,
                unit: item.unit,
                updatedAt: new Date(),
              })
              .where(eq(pantryItems.id, existing[0].id))
              .returning();
            updated.push(updatedItem);
          } else {
            // Create new item
            const [newItem] = await tx
              .insert(pantryItems)
              .values({
                householdId,
                ingredientId: item.ingredientId,
                quantity: item.quantity,
                unit: item.unit,
                addedBy: session.user.id,
              })
              .returning();
            added.push(newItem);
          }
        }
      }

      // Update existing items
      if (validatedData.update?.length) {
        for (const item of validatedData.update) {
          const [updatedItem] = await tx
            .update(pantryItems)
            .set({
              quantity: item.quantity,
              unit: item.unit,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(pantryItems.id, item.id),
                eq(pantryItems.householdId, householdId)
              )
            )
            .returning();

          if (updatedItem) {
            updated.push(updatedItem);
          }
        }
      }

      // Delete items
      if (validatedData.delete?.length) {
        const deletedItems = await tx
          .delete(pantryItems)
          .where(
            and(
              inArray(pantryItems.id, validatedData.delete),
              eq(pantryItems.householdId, householdId)
            )
          )
          .returning();
        deleted.push(...deletedItems);
      }

      return { added, updated, deleted };
    });

    return NextResponse.json({
      message: 'Bulk update completed',
      results: {
        added: results.added.length,
        updated: results.updated.length,
        deleted: results.deleted.length,
      },
      items: results,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error performing bulk update:', error);
    return NextResponse.json(
      { error: 'An error occurred while performing bulk update' },
      { status: 500 }
    );
  }
}
