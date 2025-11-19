import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { GroceryListClientWrapper } from '@/components/grocery-lists/grocery-list-client-wrapper';
import { db } from '@/lib/db';
import {
  users,
  groceryLists,
  groceryListItems,
  ingredients,
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface PageProps {
  params: {
    id: string;
  };
}

async function getGroceryList(listId: string, householdId: string) {
  const listData = await db
    .select({
      list: groceryLists,
      item: groceryListItems,
      ingredient: ingredients,
    })
    .from(groceryLists)
    .where(
      and(
        eq(groceryLists.id, listId),
        eq(groceryLists.householdId, householdId)
      )
    )
    .leftJoin(
      groceryListItems,
      eq(groceryLists.id, groceryListItems.groceryListId)
    )
    .leftJoin(ingredients, eq(groceryListItems.ingredientId, ingredients.id));

  if (listData.length === 0) {
    return null;
  }

  const list = listData[0].list;
  const items: any[] = [];

  for (const row of listData) {
    if (row.item && row.ingredient) {
      items.push({
        id: row.item.id,
        ingredientId: row.item.ingredientId,
        ingredient: row.ingredient,
        quantity: row.item.quantity,
        unit: row.item.unit,
        category: row.item.category,
        checked: row.item.checked,
        checkedBy: row.item.checkedBy,
        checkedAt: row.item.checkedAt,
        recipeIds: row.item.recipeIds,
      });
    }
  }

  return {
    ...list,
    items,
  };
}

export default async function GroceryListDetailPage({ params }: PageProps) {
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
              You need to be part of a household to view grocery lists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const list = await getGroceryList(params.id, user.householdId);

  if (!list) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-5xl">
        <GroceryListClientWrapper initialList={list} />
      </div>
    </div>
  );
}

// Make the page dynamic to support revalidation
export const dynamic = 'force-dynamic';
