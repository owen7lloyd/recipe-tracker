'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, ChefHat } from 'lucide-react';

interface DashboardNavProps {
  user: {
    name: string;
    email: string;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-xl font-bold text-slate-900 dark:text-slate-50"
            >
              <ChefHat className="h-6 w-6" />
              <span>Recipe Tracker</span>
            </Link>

            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === '/dashboard'
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/recipes"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname.startsWith('/dashboard/recipes')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                Recipes
              </Link>
              <Link
                href="/dashboard/pantry"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname.startsWith('/dashboard/pantry')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                Pantry
              </Link>
              <Link
                href="/dashboard/grocery-lists"
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  pathname.startsWith('/dashboard/grocery-lists')
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                Grocery Lists
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {user.name}
              </p>
              <p className="text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
