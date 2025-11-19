import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { groceryListGenerationSchema } from '@/lib/validations/grocery-list';
import { generateGroceryList } from '@/lib/grocery-list-generator';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validated = groceryListGenerationSchema.parse(body);

    const groceryList = await generateGroceryList(
      validated,
      user.householdId,
      user.id
    );

    return NextResponse.json(groceryList, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    // Handle the case where no items are needed
    if (
      error instanceof Error &&
      error.message.startsWith('NO_ITEMS_NEEDED:')
    ) {
      const message = error.message.replace('NO_ITEMS_NEEDED:', '');
      return NextResponse.json(
        {
          error: 'NO_ITEMS_NEEDED',
          message,
        },
        { status: 400 }
      );
    }

    console.error('Error generating grocery list:', error);
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    );
  }
}
