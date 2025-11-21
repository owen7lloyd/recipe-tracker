import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      {...props}
    />
  );
}

// Recipe Card Skeleton
export function RecipeCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-6 w-3/4" />
        <Skeleton className="mb-3 h-4 w-full" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}

// Recipe List Skeleton
export function RecipeListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Recipe Detail Skeleton
export function RecipeDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-950">
        {/* Header */}
        <div className="p-6">
          <Skeleton className="mb-3 h-10 w-3/4" />
          <Skeleton className="mb-6 h-5 w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* Image */}
        <Skeleton className="h-96 w-full rounded-none" />

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-6">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pantry List Skeleton
export function PantryListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Grocery List Skeleton
export function GroceryListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, categoryIdx) => (
        <div key={categoryIdx}>
          <Skeleton className="mb-3 h-6 w-40" />
          <div className="space-y-2">
            {Array.from({ length: 3 + (categoryIdx % 3) }).map((_, itemIdx) => (
              <div
                key={itemIdx}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
              >
                <Skeleton className="h-5 w-5 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Form Skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full">
      <div className="mb-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIdx) => (
              <Skeleton key={colIdx} className="h-12 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Spinner
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-50" />
    </div>
  );
}

// Full Page Loading
export function PageLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="mb-4" />
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
