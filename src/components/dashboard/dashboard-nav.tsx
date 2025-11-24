'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LogOut, ChefHat, Settings, Leaf } from 'lucide-react';

interface DashboardNavProps {
  user: {
    name: string | null;
    email: string;
  };
}

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <nav className="border-b border-[#e8dcc8] bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 font-merriweather text-xl font-bold text-white"
            >
              <span className="text-2xl">🌱</span>
              <span>Recipe Tracker</span>
            </Link>

            <div className="ml-10 flex items-baseline space-x-1">
              <Link
                href="/dashboard"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/recipes"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/recipes') &&
                  pathname !== '/dashboard/recipes/available'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                Recipes
              </Link>
              <Link
                href="/dashboard/recipes/available"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === '/dashboard/recipes/available'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                What Can I Cook?
              </Link>
              <Link
                href="/dashboard/pantry"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/pantry')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                Pantry
              </Link>
              <Link
                href="/dashboard/grocery-lists"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/grocery-lists')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                Grocery Lists
              </Link>
              <Link
                href="/dashboard/ingredients"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/ingredients')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                <Leaf className="mr-1 inline h-4 w-4" />
                Ingredients
              </Link>
              <Link
                href="/dashboard/settings"
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/settings')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
              >
                <Settings className="mr-1 inline h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-white">
              <p className="font-medium">
                {user.name || 'User'}
              </p>
              <p className="text-[#d4a574]">{user.email}</p>
            </div>
            <Button
              variant="secondary"
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
