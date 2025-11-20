import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { GroceryListWithRealtime } from '@/components/grocery-lists/GroceryListWithRealtime';
import { db } from '@/lib/db';
import { users, groceryLists } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroceryListDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Await params in Next.js 15+
  const { id } = await params;

  // Get user with household
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || !user.householdId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
              You need to be part of a household to view grocery lists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verify list exists and belongs to household
  const [list] = await db
    .select()
    .from(groceryLists)
    .where(
      and(eq(groceryLists.id, id), eq(groceryLists.householdId, user.householdId))
    );

  if (!list) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <GroceryListWithRealtime listId={list.id} listName={list.name} />
      </div>
    </div>
  );
}

// Make the page dynamic to support revalidation
export const dynamic = 'force-dynamic';
