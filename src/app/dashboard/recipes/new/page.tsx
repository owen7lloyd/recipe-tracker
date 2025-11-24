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
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
            <p className="text-[#6b6250]">
              You need to be part of a household to create recipes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
            Create New Recipe
          </h1>
          <p className="mt-2 text-[#6b6250]">
            Add a new recipe to your collection
          </p>
        </div>

        <RecipeForm />
      </div>
    </div>
  );
}
