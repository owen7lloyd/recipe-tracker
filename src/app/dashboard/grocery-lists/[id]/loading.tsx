import { GroceryListSkeleton } from '@/components/ui/skeleton';

export default function GroceryListDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-9 w-64 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-5 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Actions Skeleton */}
        <div className="mb-6 flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-24 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Grocery List Skeleton */}
        <GroceryListSkeleton />
      </div>
    </div>
  );
}
