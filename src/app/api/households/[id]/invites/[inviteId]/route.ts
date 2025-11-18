import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { householdInvites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireHousehold } from '@/lib/household/helpers';

// DELETE /api/households/:id/invites/:inviteId - Revoke invite
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, inviteId } = await params;

    // Verify user has access to this household
    const hasAccess = await requireHousehold(session.user.id, id);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete(householdInvites).where(eq(householdInvites.id, inviteId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invite:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting invite' },
      { status: 500 }
    );
  }
}
