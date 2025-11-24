import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { RecipeList } from '@/components/recipes/recipe-list';
import { RecipeFilters } from '@/components/recipes/recipe-filters';
import { RecipeImportButton } from '@/components/recipes/recipe-import-button';
import { getUserHouseholdId, searchRecipes } from '@/lib/recipe/helpers';
import { Plus } from 'lucide-react';

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getSession();

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
              You need to be part of a household to manage recipes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const search = typeof params.search === 'string' ? params.search : undefined;
  const category =
    typeof params.category === 'string' ? params.category : undefined;
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;

  // Fetch recipes
  const { recipes, pagination } = await searchRecipes(householdId, {
    search,
    category,
    page,
    limit: 20,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Recipes
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage your recipe collection
            </p>
          </div>
          <div className="flex gap-2">
            <RecipeImportButton />
            <Button asChild>
              <Link href="/dashboard/recipes/new">
                <Plus className="mr-2 h-4 w-4" />
                New Recipe
              </Link>
            </Button>
          </div>
        </div>

        <RecipeFilters />

        <RecipeList recipes={recipes} />

        {/* TODO: Add pagination component here */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/dashboard/recipes?page=${pageNum}`}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    pageNum === pagination.page
                      ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
                      : 'bg-white text-slate-900 hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
