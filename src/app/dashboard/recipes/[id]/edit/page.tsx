import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RecipeForm } from '@/components/recipes/recipe-form';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
} from '@/lib/recipe/helpers';

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  // Check access
  const hasAccess = await requireRecipeAccess(session.user.id, id);
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
            <p className="text-[#6b6250]">
              Recipe not found or you don't have access to it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch recipe
  const recipe = await getRecipeWithIngredients(id);
  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-6">
            <p className="text-[#6b6250]">
              Recipe not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Transform recipe data for the form
  const formData = {
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    sourceUrl: recipe.sourceUrl,
    category: recipe.category,
    tags: recipe.tags || [],
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    rating: recipe.rating,
    ingredients: recipe.ingredients.map((ing) => ({
      ingredientId: ing.ingredientId,
      ingredientName: ing.ingredientName,
      quantity: ing.quantity ? parseFloat(ing.quantity) : null,
      unit: ing.unit,
      notes: ing.notes,
      optional: ing.optional,
    })),
    instructions: recipe.instructions,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
            Edit Recipe
          </h1>
          <p className="mt-2 text-[#6b6250]">
            Update your recipe details
          </p>
        </div>

        <RecipeForm initialData={formData} recipeId={id} />
      </div>
    </div>
  );
}
