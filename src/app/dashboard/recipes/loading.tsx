import { RecipeListSkeleton } from '@/components/ui/skeleton';

export default function RecipesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Filters Skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-10 w-64 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Recipe List Skeleton */}
        <RecipeListSkeleton />
      </div>
    </div>
  );
}
