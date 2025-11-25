'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  LogOut,
  BookOpen,
  Carrot,
  ShoppingCart,
  Zap,
  Leaf,
  Settings,
  Search,
} from 'lucide-react';

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

            <div className="ml-8 flex items-center gap-2">
              <Link
                href="/dashboard/recipes"
                className={`rounded-md p-2 transition-colors ${
                  pathname.startsWith('/dashboard/recipes') &&
                  pathname !== '/dashboard/recipes/available' &&
                  pathname !== '/dashboard/recipes/search'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Recipes"
                aria-label="Recipes"
              >
                <BookOpen className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/recipes/search"
                className={`rounded-md p-2 transition-colors ${
                  pathname === '/dashboard/recipes/search'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Search by Ingredients"
                aria-label="Search by Ingredients"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/recipes/available"
                className={`rounded-md p-2 transition-colors ${
                  pathname === '/dashboard/recipes/available'
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="What Can I Cook?"
                aria-label="What Can I Cook?"
              >
                <Zap className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/pantry"
                className={`rounded-md p-2 transition-colors ${
                  pathname.startsWith('/dashboard/pantry')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Pantry"
                aria-label="Pantry"
              >
                <Carrot className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/grocery-lists"
                className={`rounded-md p-2 transition-colors ${
                  pathname.startsWith('/dashboard/grocery-lists')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Grocery Lists"
                aria-label="Grocery Lists"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/ingredients"
                className={`rounded-md p-2 transition-colors ${
                  pathname.startsWith('/dashboard/ingredients')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Ingredients"
                aria-label="Ingredients"
              >
                <Leaf className="h-5 w-5" />
              </Link>
              <Link
                href="/dashboard/settings"
                className={`rounded-md p-2 transition-colors ${
                  pathname.startsWith('/dashboard/settings')
                    ? 'bg-[#3d6b1f] text-white'
                    : 'text-white hover:text-[#d4a574]'
                }`}
                title="Settings"
                aria-label="Settings"
              >
                <Settings className="h-5 w-5" />
              </Link>
            </div>
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
    </nav>
  );
}
