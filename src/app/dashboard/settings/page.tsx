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
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Household Settings</h1>
          <p className="text-muted-foreground">
            Manage your household and members
          </p>
        </div>

        <HouseholdSettingsForm household={household} />
      </div>
    </div>
  );
}
