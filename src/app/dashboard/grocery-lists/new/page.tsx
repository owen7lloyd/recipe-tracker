import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RecipeSelector } from '@/components/grocery-lists/recipe-selector';
import { searchRecipes, getUserHouseholdId } from '@/lib/recipe/helpers';

export default async function NewGroceryListPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Get user's household
  const householdId = await getUserHouseholdId(session.user.id);

  if (!householdId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
              You need to be part of a household to create grocery lists.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch all recipes for the household
  const { recipes } = await searchRecipes(householdId, {
    limit: 100, // Get all recipes
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <RecipeSelector recipes={recipes} />
      </div>
    </div>
  );
}
