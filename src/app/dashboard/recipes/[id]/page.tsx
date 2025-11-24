import { getSession } from '@/lib/auth';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-6xl">
        <RecipeDetail {...recipe} createdAt={recipe.createdAt.toISOString()} />
      </div>
    </div>
  );
}
