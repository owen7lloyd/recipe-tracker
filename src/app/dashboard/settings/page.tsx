import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getHouseholdWithMembers } from '@/lib/household/helpers';
import { HouseholdSettingsForm } from '@/components/household/household-settings-form';

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.householdId) {
    redirect('/login');
  }

  const household = await getHouseholdWithMembers(session.user.householdId);

  if (!household) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Household Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your household and members
          </p>
        </header>

        <HouseholdSettingsForm household={household} />
      </div>
    </div>
  );
}
