import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ShoppingCart, Calendar } from 'lucide-react';
import { db } from '@/lib/db';
import { users, groceryLists, groceryListItems } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function GroceryListsPage() {
  const session = await auth();

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
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
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
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Grocery Lists</h1>
            <p className="text-slate-600 dark:text-slate-400">
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
              <ShoppingCart className="mb-4 h-16 w-16 text-slate-300 dark:text-slate-600" />
              <h2 className="mb-2 text-xl font-semibold">
                No grocery lists yet
              </h2>
              <p className="mb-6 text-center text-slate-600 dark:text-slate-400">
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
                      <span className="text-slate-600 dark:text-slate-400">
                        Items
                      </span>
                      <span className="font-medium">
                        {list.checkedItems} / {list.totalItems}
                      </span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${
                            list.totalItems > 0
                              ? (list.checkedItems / list.totalItems) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
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
