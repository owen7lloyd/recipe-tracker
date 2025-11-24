import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getHouseholdWithMembers } from '@/lib/household/helpers';
import { HouseholdSettingsForm } from '@/components/household/household-settings-form';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Fetch user's current household from database (source of truth)
  const user = await db
    .select({ householdId: users.householdId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user[0]?.householdId) {
    redirect('/dashboard');
  }

  const household = await getHouseholdWithMembers(user[0].householdId);

  if (!household) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
            Household Settings
          </h1>
          <p className="mt-2 text-[#6b6250]">
            Manage your household and members
          </p>
        </header>

        <HouseholdSettingsForm household={household} />
      </div>
    </div>
  );
}
