import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, households } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireHousehold, isHouseholdCreator } from '@/lib/household/helpers';

// DELETE /api/households/:id/members/:userId - Remove member from household
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, userId } = await params;

    // Verify user has access to this household
    const hasAccess = await requireHousehold(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if trying to remove self
    if (session.user.id === userId) {
      // Check if user is the creator
      const isCreator = await isHouseholdCreator(session.user.id, id);
      if (isCreator) {
        return NextResponse.json(
          {
            error:
              'Household creator cannot leave without transferring ownership or deleting the household',
          },
          { status: 400 }
        );
      }

      // User is leaving the household - create new household for them
      const [newHousehold] = await db
        .insert(households)
        .values({
          name: `${session.user.name}'s Household`,
          createdBy: session.user.id,
        })
        .returning();

      await db
        .update(users)
        .set({
          householdId: newHousehold.id,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.user.id));

      return NextResponse.json({
        success: true,
        message: 'Left household successfully',
        newHouseholdId: newHousehold.id,
      });
    }

    // Only creator can remove other members
    const isCreator = await isHouseholdCreator(session.user.id, id);
    if (!isCreator) {
      return NextResponse.json(
        { error: 'Only household creator can remove members' },
        { status: 403 }
      );
    }

    // Verify the user to remove is in this household
    const userToRemove = await db
      .select()
      .from(users)
      .where(and(eq(users.id, userId), eq(users.householdId, id)))
      .limit(1);

    if (userToRemove.length === 0) {
      return NextResponse.json(
        { error: 'User not found in this household' },
        { status: 404 }
      );
    }

    // Create new household for removed user
    const [newHousehold] = await db
      .insert(households)
      .values({
        name: `${userToRemove[0].name}'s Household`,
        createdBy: userId,
      })
      .returning();

    await db
      .update(users)
      .set({
        householdId: newHousehold.id,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { error: 'An error occurred while removing member' },
      { status: 500 }
    );
  }
}
