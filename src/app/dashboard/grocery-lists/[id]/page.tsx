import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
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
  const session = await getSession();

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
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
            <p className="text-[#6b6250]">
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
      and(
        eq(groceryLists.id, id),
        eq(groceryLists.householdId, user.householdId)
      )
    );

  if (!list) {
    // Redirect to grocery lists page if list not found
    redirect('/dashboard/grocery-lists');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-5xl">
        <GroceryListWithRealtime listId={list.id} listName={list.name} />
      </div>
    </div>
  );
}

// Make the page dynamic to support revalidation
export const dynamic = 'force-dynamic';
