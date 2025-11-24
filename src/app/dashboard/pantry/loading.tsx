import { PantryListSkeleton } from '@/components/ui/skeleton';

export default function PantryLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-md bg-[#e8dcc8]/50" />
          <div className="mt-2 h-5 w-80 animate-pulse rounded-md bg-[#e8dcc8]/50" />
        </div>

        {/* Search Skeleton */}
        <div className="mb-6 flex gap-4">
          <div className="h-10 flex-1 animate-pulse rounded-md bg-[#e8dcc8]/50" />
          <div className="h-10 w-32 animate-pulse rounded-md bg-[#e8dcc8]/50" />
        </div>

        {/* Pantry List Skeleton */}
        <PantryListSkeleton />
      </div>
    </div>
  );
}
