import { PantryListSkeleton } from '@/components/ui/skeleton';

export default function PantryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-5 w-80 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Search Skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Pantry List Skeleton */}
        <PantryListSkeleton />
      </div>
    </div>
  );
}
