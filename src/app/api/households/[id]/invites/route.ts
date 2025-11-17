import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { householdInvites } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { requireHousehold } from '@/lib/household/helpers';

// GET /api/households/:id/invites - List active invites
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

    // Get active (non-expired, unused) invites
    const invites = await db
      .select()
      .from(householdInvites)
      .where(
        and(
          eq(householdInvites.householdId, id),
          gt(householdInvites.expiresAt, new Date())
        )
      );

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return NextResponse.json(
      invites.map((invite) => ({
        id: invite.id,
        code: invite.code,
        link: `${baseUrl}/join/${invite.code}`,
        expiresAt: invite.expiresAt,
        usedBy: invite.usedBy,
        usedAt: invite.usedAt,
        createdAt: invite.createdAt,
      }))
    );
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invites' },
      { status: 500 }
    );
  }
}
