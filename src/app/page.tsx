import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ChefHat } from 'lucide-react';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <ChefHat className="h-20 w-20 text-slate-900 dark:text-slate-50" />
          </div>
          <h1 className="mb-4 text-5xl font-bold text-slate-900 dark:text-slate-50">
            Recipe & Pantry Tracker
          </h1>
          <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
            Manage your recipes, track your pantry, and simplify grocery
            shopping
          </p>

          {session ? (
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/register">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          )}

          <div className="mt-16 grid gap-8 text-left sm:grid-cols-3">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                Store Recipes
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Import from websites or add manually. Keep all your favorite
                recipes in one place.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                Track Pantry
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Know what you have. See what recipes you can make with available
                ingredients.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                Smart Shopping
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Generate organized grocery lists from your recipes
                automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
