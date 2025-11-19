import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, householdCategoryOrder } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const categoryOrderSchema = z.object({
  order: z.array(z.string()).min(1),
});

// GET /api/household/category-order - Get household category order
export async function GET(_req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get category order for household
    const [categoryOrder] = await db
      .select()
      .from(householdCategoryOrder)
      .where(eq(householdCategoryOrder.householdId, user.householdId));

    if (!categoryOrder) {
      // Return default order if not set
      return NextResponse.json({
        order: [
          'produce',
          'bakery',
          'dairy',
          'meat',
          'seafood',
          'frozen',
          'pantry',
          'other',
        ],
      });
    }

    return NextResponse.json({
      order: categoryOrder.categoryOrder,
    });
  } catch (error) {
    console.error('Error getting category order:', error);
    return NextResponse.json(
      { error: 'Failed to get category order' },
      { status: 500 }
    );
  }
}

// PUT /api/household/category-order - Update household category order
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { order } = categoryOrderSchema.parse(body);

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

    // Upsert category order
    const [existing] = await db
      .select()
      .from(householdCategoryOrder)
      .where(eq(householdCategoryOrder.householdId, user.householdId));

    if (existing) {
      await db
        .update(householdCategoryOrder)
        .set({
          categoryOrder: order,
          updatedAt: new Date(),
        })
        .where(eq(householdCategoryOrder.householdId, user.householdId));
    } else {
      await db.insert(householdCategoryOrder).values({
        householdId: user.householdId,
        categoryOrder: order,
      });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating category order:', error);
    return NextResponse.json(
      { error: 'Failed to update category order' },
      { status: 500 }
    );
  }
}
