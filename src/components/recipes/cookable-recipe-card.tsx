/**
 * Cookable Recipe Card Component
 *
 * Displays a recipe card with availability information, substitutions, and missing ingredients
 */

'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, ImageIcon } from 'lucide-react';
import { AvailabilityBadge, MatchPercentageBadge } from './availability-badge';
import { SubstitutionNote, MissingIngredientsNote } from './substitution-note';
import { ServingBadge } from './serving-badge';
import type {
  RecipeMatch,
  RecipeMatchWithServings,
} from '@/lib/recipe-matching';

interface CookableRecipeCardProps {
  match: RecipeMatch | RecipeMatchWithServings;
  showDetails?: boolean;
}

function isMatchWithServings(
  match: RecipeMatch | RecipeMatchWithServings
): match is RecipeMatchWithServings {
  return 'achievableServings' in match;
}

export function CookableRecipeCard({
  match,
  showDetails = false,
}: CookableRecipeCardProps) {
  const {
    recipe,
    cookable,
    matchPercentage,
    substitutionsUsed,
    missingIngredients,
  } = match;
  const withServings = isMatchWithServings(match) ? match : null;
  const totalTime =
    (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) || null;

  return (
    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/dashboard/recipes/${recipe.id}`} className="group">
        <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {recipe.imageUrl ? (
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href={`/dashboard/recipes/${recipe.id}`} className="flex-1">
            <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 hover:text-slate-700 dark:text-slate-50 dark:hover:text-slate-200">
              {recipe.title}
            </h3>
          </Link>
          {recipe.rating && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">{recipe.rating}</span>
            </div>
          )}
        </div>

        {/* Availability Badge */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {withServings ? (
            <ServingBadge
              achievableServings={withServings.achievableServings}
              defaultServings={recipe.servings}
              canMakeFull={withServings.canMakeFull}
              canMakeReduced={withServings.canMakeReduced}
              size="sm"
            />
          ) : (
            <AvailabilityBadge
              cookable={cookable}
              matchPercentage={matchPercentage}
              substitutionsCount={substitutionsUsed.length}
              missingCount={missingIngredients.length}
              size="sm"
            />
          )}
          {matchPercentage < 100 && (
            <MatchPercentageBadge percentage={matchPercentage} size="sm" />
          )}
        </div>

        {recipe.description && (
          <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {recipe.description}
          </p>
        )}

        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {recipe.category}
          </Badge>
          {recipe.tags?.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {totalTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Show substitution and missing ingredient details if requested */}
        {showDetails && (
          <div className="mt-4 space-y-3">
            {substitutionsUsed.length > 0 && (
              <SubstitutionNote substitutions={substitutionsUsed} />
            )}
            {missingIngredients.length > 0 && (
              <MissingIngredientsNote missingIngredients={missingIngredients} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
