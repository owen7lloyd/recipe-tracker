import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShoppingCart, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { users, groceryLists, groceryListItems } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { GroceryListsEmptyState } from '@/components/ui/empty-state';

export default async function GroceryListsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

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
              You need to be part of a household to manage grocery lists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch all grocery lists for the household
  const lists = await db
    .select({
      list: groceryLists,
    })
    .from(groceryLists)
    .where(eq(groceryLists.householdId, user.householdId))
    .orderBy(desc(groceryLists.createdAt));

  // Get item counts for each list
  const listsWithCounts = await Promise.all(
    lists.map(async ({ list }) => {
      const items = await db
        .select()
        .from(groceryListItems)
        .where(eq(groceryListItems.groceryListId, list.id));

      const checkedCount = items.filter((item) => item.checked).length;

      return {
        ...list,
        totalItems: items.length,
        checkedItems: checkedCount,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">Grocery Lists</h1>
            <p className="text-[#6b6250]">
              Manage your shopping lists
            </p>
          </div>
          <Link href="/dashboard/grocery-lists/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Grocery List
            </Button>
          </Link>
        </div>

        {listsWithCounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12">
              <ShoppingCart className="mb-4 h-16 w-16 text-[#e8dcc8]" />
              <h2 className="mb-2 font-merriweather text-xl font-bold text-[#2d5016]">
                No grocery lists yet
              </h2>
              <p className="mb-6 text-center text-[#6b6250]">
                Create your first grocery list by selecting recipes
              </p>
              <Link href="/dashboard/grocery-lists/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Grocery List
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listsWithCounts.map((list) => (
              <Link key={list.id} href={`/dashboard/grocery-lists/${list.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {list.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b6250]">
                        Items
                      </span>
                      <span className="font-medium">
                        {list.checkedItems} / {list.totalItems}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8dcc8]">
                      <div
                        className="h-full bg-[#2d5016] transition-all"
                        style={{
                          width: `${
                            list.totalItems > 0
                              ? (list.checkedItems / list.totalItems) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#6b6250]">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Created {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
