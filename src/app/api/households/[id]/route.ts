import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { households } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  requireHousehold,
  getHouseholdWithMembers,
} from '@/lib/household/helpers';
import { updateHouseholdSchema } from '@/lib/validations/household';

// GET /api/households/:id - Get household details with members
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this household
    const hasAccess = await requireHousehold(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const household = await getHouseholdWithMembers(id);
    if (!household) {
      return NextResponse.json(
        { error: 'Household not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(household);
  } catch (error) {
    console.error('Error fetching household:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching household' },
      { status: 500 }
    );
  }
}

// PUT /api/households/:id - Update household details
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify user has access to this household
    const hasAccess = await requireHousehold(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateHouseholdSchema.parse(body);

    const [updated] = await db
      .update(households)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
      })
      .where(eq(households.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error updating household:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating household' },
      { status: 500 }
    );
  }
}
