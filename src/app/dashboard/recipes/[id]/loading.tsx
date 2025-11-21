import { RecipeDetailSkeleton } from '@/components/ui/skeleton';

export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-900">
      <RecipeDetailSkeleton />
    </div>
  );
}
