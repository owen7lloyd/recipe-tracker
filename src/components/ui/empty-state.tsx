import { ReactNode } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import {
  ChefHat,
  ShoppingCart,
  Package,
  Search,
  AlertCircle,
  Inbox,
  Users,
  FileQuestion,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  iconType?: 'recipe' | 'pantry' | 'grocery' | 'search' | 'error' | 'generic' | 'users' | 'not-found';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap = {
  recipe: ChefHat,
  pantry: Package,
  grocery: ShoppingCart,
  search: Search,
  error: AlertCircle,
  generic: Inbox,
  users: Users,
  'not-found': FileQuestion,
};

export function EmptyState({
  icon,
  iconType,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const IconComponent = iconType ? iconMap[iconType] : null;

  return (
    <div
      className={cn(
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/50',
        className
      )}
    >
      {/* Icon */}
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
        {icon ? (
          <div className="text-slate-600 dark:text-slate-400">{icon}</div>
        ) : IconComponent ? (
          <IconComponent className="h-8 w-8 text-slate-600 dark:text-slate-400" />
        ) : (
          <Inbox className="h-8 w-8 text-slate-600 dark:text-slate-400" />
        )}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-50">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-6 max-w-md text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              size="default"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction.onClick} variant="outline" size="default">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function RecipesEmptyState({ onAddRecipe, onImportRecipe }: {
  onAddRecipe: () => void;
  onImportRecipe?: () => void;
}) {
  return (
    <EmptyState
      iconType="recipe"
      title="No recipes yet"
      description="Start building your recipe collection by adding your first recipe or importing one from the web."
      action={{
        label: 'Add Recipe',
        onClick: onAddRecipe,
      }}
      secondaryAction={onImportRecipe ? {
        label: 'Import from Web',
        onClick: onImportRecipe,
      } : undefined}
    />
  );
}

export function PantryEmptyState({ onAddItem }: { onAddItem: () => void }) {
  return (
    <EmptyState
      iconType="pantry"
      title="Your pantry is empty"
      description="Track what ingredients you have on hand to see which recipes you can cook and generate accurate grocery lists."
      action={{
        label: 'Add Pantry Item',
        onClick: onAddItem,
      }}
    />
  );
}

export function GroceryListsEmptyState({ onCreateList }: { onCreateList: () => void }) {
  return (
    <EmptyState
      iconType="grocery"
      title="No grocery lists"
      description="Create a grocery list from your recipes to make shopping easier. You can share lists with your household and check off items in real-time."
      action={{
        label: 'Create Grocery List',
        onClick: onCreateList,
      }}
    />
  );
}

export function CookableRecipesEmptyState({ onAddPantryItems }: { onAddPantryItems: () => void }) {
  return (
    <EmptyState
      iconType="search"
      title="No recipes available to cook"
      description="Add ingredients to your pantry to see which recipes you can make with what you have on hand."
      action={{
        label: 'Add Pantry Items',
        onClick: onAddPantryItems,
      }}
    />
  );
}

export function SearchEmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      iconType="search"
      title="No results found"
      description={`We couldn't find any results for "${searchTerm}". Try adjusting your search or filters.`}
    />
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "We encountered an error. Please try again later.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      iconType="error"
      title={title}
      description={description}
      action={onRetry ? {
        label: 'Try Again',
        onClick: onRetry,
        variant: 'default',
      } : undefined}
    />
  );
}

export function NotFoundState({
  resourceName = "page",
  onGoBack,
}: {
  resourceName?: string;
  onGoBack?: () => void;
}) {
  return (
    <EmptyState
      iconType="not-found"
      title={`${resourceName.charAt(0).toUpperCase() + resourceName.slice(1)} not found`}
      description={`The ${resourceName} you're looking for doesn't exist or has been removed.`}
      action={onGoBack ? {
        label: 'Go Back',
        onClick: onGoBack,
        variant: 'default',
      } : undefined}
    />
  );
}
