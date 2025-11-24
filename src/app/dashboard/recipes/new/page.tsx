import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RecipeForm } from '@/components/recipes/recipe-form';
import { getUserHouseholdId } from '@/lib/recipe/helpers';

export default async function NewRecipePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  // Check if user has a household
  const householdId = await getUserHouseholdId(session.user.id);
  if (!householdId) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
              You need to be part of a household to create recipes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Create New Recipe
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Add a new recipe to your collection
          </p>
        </div>

        <RecipeForm />
      </div>
    </div>
  );
}
