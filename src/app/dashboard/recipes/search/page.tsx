import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserHouseholdId } from '@/lib/recipe/helpers';
import { IngredientSearchPage } from '@/components/recipes/ingredient-search-page';
import { db } from '@/lib/db';
import { pantryItems, ingredients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function SearchByIngredientsPage() {
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
              You need to be part of a household to search recipes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch pantry ingredients for quick select
  const pantryIngredientsList = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      category: ingredients.category,
    })
    .from(pantryItems)
    .innerJoin(ingredients, eq(pantryItems.ingredientId, ingredients.id))
    .where(eq(pantryItems.householdId, householdId))
    .limit(20);

  return <IngredientSearchPage pantryIngredients={pantryIngredientsList} />;
}
