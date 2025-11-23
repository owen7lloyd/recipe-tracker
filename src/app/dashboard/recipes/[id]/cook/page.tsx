import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CookRecipeView } from '@/components/recipes/cook-recipe-view';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
} from '@/lib/recipe/helpers';

export default async function CookRecipePage({
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
    redirect('/dashboard/recipes');
  }

  // Fetch recipe
  const recipe = await getRecipeWithIngredients(id);
  if (!recipe) {
    redirect('/dashboard/recipes');
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <CookRecipeView
        id={recipe.id}
        title={recipe.title}
        description={recipe.description}
        imageUrl={recipe.imageUrl}
        servings={recipe.servings}
        prepTimeMinutes={recipe.prepTimeMinutes}
        cookTimeMinutes={recipe.cookTimeMinutes}
        instructions={recipe.instructions}
        ingredients={recipe.ingredients}
      />
    </div>
  );
}
