import { RecipeDetailSkeleton } from '@/components/ui/skeleton';

export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <RecipeDetailSkeleton />
    </div>
  );
}
