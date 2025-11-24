import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RecipeSelector } from '@/components/grocery-lists/recipe-selector';
import { searchRecipes, getUserHouseholdId } from '@/lib/recipe/helpers';

export default async function NewGroceryListPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        <RecipeSelector recipes={recipes} />
      </div>
    </div>
  );
}
