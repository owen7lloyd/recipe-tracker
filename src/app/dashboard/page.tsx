import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Carrot,
  ShoppingCart,
  Zap,
  Leaf,
  Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

function DashboardCard({
  icon,
  title,
  description,
  href,
  color,
}: DashboardCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl rounded-3xl cursor-pointer border-2 border-[#e8dcc8]">
        <div className="p-8">
          <div
            className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${color}`}
          >
            {icon}
          </div>
          <h2 className="mb-2 font-merriweather text-xl font-bold text-[#2d5016]">
            {title}
          </h2>
          <p className="mb-6 text-sm text-[#6b6250]">
            {description}
          </p>
          <Button className="bg-gradient-to-r from-[#2d5016] to-[#3d6b1f] text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Go to {title}
          </Button>
        </div>
      </Card>
    </Link>
  );
}

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
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12">
          <h1 className="mb-2 text-4xl font-merriweather font-bold text-[#2d5016]">
            Dashboard
          </h1>
          <p className="text-lg text-[#6b6250] font-light">
            Welcome back, {session.user.name}! Manage your recipes and pantry.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            icon={<BookOpen className="h-8 w-8 text-white" />}
            title="Recipes"
            description="Manage your recipe collection, import from websites, and organize your favorites"
            href="/dashboard/recipes"
            color="bg-[#2d5016]"
          />

          <DashboardCard
            icon={<Carrot className="h-8 w-8 text-white" />}
            title="Pantry"
            description="Track your ingredients and manage your inventory"
            href="/dashboard/pantry"
            color="bg-[#6b8e23]"
          />

          <DashboardCard
            icon={<ShoppingCart className="h-8 w-8 text-white" />}
            title="Grocery Lists"
            description="Plan your shopping trips and generate lists from recipes"
            href="/dashboard/grocery-lists"
            color="bg-[#d4a574]"
          />

          <DashboardCard
            icon={<Zap className="h-8 w-8 text-white" />}
            title="What Can I Cook?"
            description="Discover recipes you can make with your available ingredients"
            href="/dashboard/recipes/available"
            color="bg-[#2d5016]"
          />

          <DashboardCard
            icon={<Leaf className="h-8 w-8 text-white" />}
            title="Ingredients"
            description="Manage and search your ingredient database"
            href="/dashboard/ingredients"
            color="bg-[#6b8e23]"
          />

          <DashboardCard
            icon={<Settings className="h-8 w-8 text-white" />}
            title="Settings"
            description="Manage your account and household preferences"
            href="/dashboard/settings"
            color="bg-[#d4a574]"
          />
        </div>
      </div>
    </div>
  );
}
