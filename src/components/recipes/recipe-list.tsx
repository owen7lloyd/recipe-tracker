'use client';

import { RecipeCard } from './recipe-card';

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
  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-12 dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-50">
          No recipes found
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Get started by creating your first recipe
        </p>
      </div>
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
