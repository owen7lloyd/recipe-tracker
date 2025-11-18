import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users, householdInvites, households } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { validateInviteCode } from '@/lib/household/helpers';
import { joinHouseholdSchema } from '@/lib/validations/household';

// POST /api/households/join - Join household with invite code
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinHouseholdSchema.parse(body);

    // Validate invite code
    const invite = await validateInviteCode(validatedData.code);
    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Check if user already belongs to a household
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (user[0].householdId === invite.householdId) {
      return NextResponse.json(
        { error: 'You are already a member of this household' },
        { status: 400 }
      );
    }

    // If user has a household, check if they're the only member
    if (user[0].householdId) {
      const currentHouseholdMembers = await db
        .select()
        .from(users)
        .where(eq(users.householdId, user[0].householdId));

      // Only allow joining if user is the sole member (auto-created household)
      if (currentHouseholdMembers.length > 1) {
        return NextResponse.json(
          {
            error:
              'You are already a member of a household with other members. Please leave your current household first.',
          },
          { status: 400 }
        );
      }

      // Delete the old household since user is the only member
      await db.delete(households).where(eq(households.id, user[0].householdId));
    }

    // Update user's household
    await db
      .update(users)
      .set({
        householdId: invite.householdId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Mark invite as used
    await db
      .update(householdInvites)
      .set({
        usedBy: session.user.id,
        usedAt: new Date(),
      })
      .where(eq(householdInvites.id, invite.id));

    return NextResponse.json({
      success: true,
      householdId: invite.householdId,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      );
    }

    console.error('Error joining household:', error);
    return NextResponse.json(
      { error: 'An error occurred while joining household' },
      { status: 500 }
    );
  }
}
