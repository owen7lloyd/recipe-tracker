import { TableSkeleton } from '@/components/ui/skeleton';

export default function GroceryListsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-56 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>

        {/* Table Skeleton */}
        <TableSkeleton rows={6} columns={5} />
      </div>
    </div>
  );
}
