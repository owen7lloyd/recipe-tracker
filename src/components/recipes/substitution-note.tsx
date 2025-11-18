/**
 * Substitution Note Component
 *
 * Displays which ingredient substitutions will be used when cooking a recipe
 */

import { ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubstitutionNoteProps {
  substitutions: Array<{
    original: string;
    substitute: string;
    ratio: number;
  }>;
  className?: string;
}

export function SubstitutionNote({
  substitutions,
  className,
}: SubstitutionNoteProps) {
  if (substitutions.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
            Using Substitutions
          </h4>
          <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
            This recipe will use the following substitutions from your pantry:
          </p>
          <ul className="mt-3 space-y-2">
            {substitutions.map((sub, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200"
              >
                <span className="font-medium">{sub.original}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{sub.substitute}</span>
                {sub.ratio !== 1 && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    (ratio: {sub.ratio}x)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface MissingIngredientsNoteProps {
  missingIngredients: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number | null;
    unit: string | null;
  }>;
  className?: string;
}

export function MissingIngredientsNote({
  missingIngredients,
  className,
}: MissingIngredientsNoteProps) {
  if (missingIngredients.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900 dark:text-red-100">
            Missing Ingredients
          </h4>
          <p className="mt-1 text-sm text-red-800 dark:text-red-200">
            You need the following ingredients to cook this recipe:
          </p>
          <ul className="mt-3 space-y-1">
            {missingIngredients.map((ing, index) => (
              <li
                key={index}
                className="text-sm text-red-800 dark:text-red-200"
              >
                <span className="font-medium">{ing.ingredientName}</span>
                {ing.quantity && (
                  <span className="ml-2 text-red-600 dark:text-red-400">
                    ({ing.quantity} {ing.unit || ''})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
