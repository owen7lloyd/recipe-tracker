import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getHouseholdWithMembers } from '@/lib/household/helpers';
import { HouseholdSettingsForm } from '@/components/household/household-settings-form';
import { ChangePasswordModal } from '@/components/auth/change-password-modal';

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
            Settings
          </h1>
          <p className="mt-2 text-[#6b6250]">
            Manage your account, household, and security
          </p>
        </header>

        <div className="space-y-12">
          {/* Household Settings Section */}
          <section>
            <h2 className="mb-6 text-2xl font-merriweather font-bold text-[#2c2415]">
              Household Settings
            </h2>
            <HouseholdSettingsForm household={household} />
          </section>

          {/* Account Security Section */}
          <section>
            <h2 className="mb-6 text-2xl font-merriweather font-bold text-[#2c2415]">
              Account Security
            </h2>
            <div className="p-6 border rounded-2xl bg-white border-[#e8dcc8]">
              <p className="text-[#6b6250] mb-4">
                Manage your account password and security settings
              </p>
              <ChangePasswordModal />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
