import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { households, householdInvites } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { JoinHouseholdForm } from '@/components/household/join-household-form';
import { InvitePreview } from '@/components/household/invite-preview';

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const session = await auth();
  const { code } = await params;

  // Fetch invite and household info (even if not authenticated)
  const invite = await db
    .select({
      id: householdInvites.id,
      householdId: householdInvites.householdId,
      expiresAt: householdInvites.expiresAt,
      usedBy: householdInvites.usedBy,
      householdName: households.name,
    })
    .from(householdInvites)
    .innerJoin(households, eq(householdInvites.householdId, households.id))
    .where(
      and(
        eq(householdInvites.code, code),
        gt(householdInvites.expiresAt, new Date())
      )
    )
    .limit(1);

  // Show preview if not authenticated
  if (!session?.user) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <InvitePreview
          code={code}
          householdName={invite[0]?.householdName}
          isValid={invite.length > 0 && !invite[0]?.usedBy}
        />
      </div>
    );
  }

  // If authenticated, show join form
  return (
    <div className="container flex min-h-screen items-center justify-center">
      <JoinHouseholdForm code={code} autoJoin />
    </div>
  );
}
