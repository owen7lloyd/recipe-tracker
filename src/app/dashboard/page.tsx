import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user's current household from database (source of truth)
  const user = await db
    .select({ householdId: users.householdId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Welcome back, {session.user.name}!
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Recipes
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage your recipe collection
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Pantry
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track your ingredients
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Grocery Lists
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Plan your shopping trips
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Account Information
          </h2>
          <dl className="mt-4 space-y-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Name
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-50">
                {session.user.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Email
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-50">
                {session.user.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Household ID
              </dt>
              <dd className="text-sm text-slate-900 dark:text-slate-50">
                {user[0]?.householdId || 'Not assigned'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
