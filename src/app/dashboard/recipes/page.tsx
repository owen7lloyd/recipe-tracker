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
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
            <p className="text-[#6b6250]">
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
              Recipes
            </h1>
            <p className="mt-2 text-[#6b6250]">
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
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    pageNum === pagination.page
                      ? 'bg-[#2d5016] text-white'
                      : 'bg-white text-[#2d5016] hover:bg-[#f0ebe0]'
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
