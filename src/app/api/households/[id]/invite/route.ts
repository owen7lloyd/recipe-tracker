import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { householdInvites } from '@/lib/db/schema';
import {
  requireHousehold,
  generateUniqueInviteCode,
} from '@/lib/household/helpers';

// POST /api/households/:id/invite - Generate invite code
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

    // Verify user has access to this household
    const hasAccess = await requireHousehold(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Generate unique code
    const code = await generateUniqueInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invite] = await db
      .insert(householdInvites)
      .values({
        householdId: id,
        code,
        createdBy: session.user.id,
        expiresAt,
      })
      .returning();

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return NextResponse.json({
      id: invite.id,
      code,
      link: `${baseUrl}/join/${code}`,
      expiresAt,
    });
  } catch (error) {
    console.error('Error creating invite:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating invite' },
      { status: 500 }
    );
  }
}
