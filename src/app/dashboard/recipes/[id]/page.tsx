import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { RecipeDetail } from '@/components/recipes/recipe-detail';
import {
  requireRecipeAccess,
  getRecipeWithIngredients,
} from '@/lib/recipe/helpers';

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { id } = await params;

  // Check access
  const hasAccess = await requireRecipeAccess(session.user.id, id);
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
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
      <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-slate-600 dark:text-slate-400">
              Recipe not found.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <RecipeDetail {...recipe} createdAt={recipe.createdAt.toISOString()} />
      </div>
    </div>
  );
}
