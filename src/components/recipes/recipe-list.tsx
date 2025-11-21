'use client';

import { RecipeCard } from './recipe-card';
import { RecipesEmptyState } from '@/components/ui/empty-state';
import { useRouter } from 'next/navigation';

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number;
  rating?: number | null;
}

interface RecipeListProps {
  recipes: Recipe[];
}

export function RecipeList({ recipes }: RecipeListProps) {
  const router = useRouter();

  if (recipes.length === 0) {
    return (
      <RecipesEmptyState
        onAddRecipe={() => router.push('/dashboard/recipes/new')}
        onImportRecipe={() => {
          // Import modal will be triggered by the import button in the page
          document.dispatchEvent(new CustomEvent('open-recipe-import'));
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} {...recipe} />
      ))}
    </div>
  );
}
