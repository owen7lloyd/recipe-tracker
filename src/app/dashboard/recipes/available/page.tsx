/**
 * What Can I Cook? Page
 *
 * Shows recipes that can be cooked with current pantry inventory,
 * with options to show near-matches and apply filters
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CookableRecipeCard } from '@/components/recipes/cookable-recipe-card';
import { ChefHat, Loader2, RefreshCw, SlidersHorizontal } from 'lucide-react';
import type { RecipeMatch } from '@/lib/recipe-matching';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AvailableRecipesPage() {
  const [loading, setLoading] = useState(true);
  const [cookableRecipes, setCookableRecipes] = useState<RecipeMatch[]>([]);
  const [nearMatches, setNearMatches] = useState<RecipeMatch[]>([]);
  const [showNearMatches, setShowNearMatches] = useState(false);
  const [sortBy, setSortBy] = useState<
    'match' | 'newest' | 'rating' | 'prepTime'
  >('match');
  const [showFilters, setShowFilters] = useState(false);
  const [includeReducedServings, setIncludeReducedServings] = useState(false);
  const router = useRouter();

  // Load persisted settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('includeReducedServings');
    if (stored === 'true') {
      setIncludeReducedServings(true);
    }
  }, []);

  // Persist setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(
      'includeReducedServings',
      includeReducedServings.toString()
    );
  }, [includeReducedServings]);

  useEffect(() => {
    fetchAvailableRecipes();
  }, [sortBy, showNearMatches, includeReducedServings]);

  const fetchAvailableRecipes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort_by: sortBy,
        near_matches: showNearMatches.toString(),
        include_reduced_servings: includeReducedServings.toString(),
      });

      const response = await fetch(`/api/recipes/available?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch available recipes');
      }

      const data = await response.json();
      setCookableRecipes(data.cookable || []);
      setNearMatches(data.nearMatches || []);
    } catch (error) {
      console.error('Error fetching available recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAvailableRecipes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#d4a574]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#6b8e23]/20 p-3">
                <ChefHat className="h-6 w-6 text-[#2d5016]" />
              </div>
              <div>
                <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
                  What Can I Cook?
                </h1>
                <p className="mt-2 text-[#6b6250]">
                  Recipes you can make with ingredients in your pantry
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                title="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 rounded-2xl border-2 border-[#e8dcc8] bg-white p-4">
              <h3 className="font-merriweather mb-4 font-semibold text-[#2d5016]">
                Filters & Sorting
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  >
                    <option value="match">Best Match</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="prepTime">Quickest Prep</option>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="near-matches"
                    checked={showNearMatches}
                    onCheckedChange={setShowNearMatches}
                  />
                  <Label htmlFor="near-matches" className="cursor-pointer">
                    Show near-matches (missing some ingredients)
                  </Label>
                </div>

                <div className="border-t-2 border-[#e8dcc8] pt-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="reduced-servings"
                      checked={includeReducedServings}
                      onCheckedChange={setIncludeReducedServings}
                    />
                    <Label
                      htmlFor="reduced-servings"
                      className="cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-[#2d5016]">
                          Include reduced servings
                        </p>
                        <p className="text-xs text-[#6b6250]">
                          Show recipes you can make with fewer servings
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-4">
            <div className="text-sm font-medium text-[#6b6250]">
              Ready to Cook
            </div>
            <div className="mt-1 text-3xl font-bold text-[#2d5016]">
              {cookableRecipes.length}
            </div>
          </div>
          {showNearMatches && (
            <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-4">
              <div className="text-sm font-medium text-[#6b6250]">
                Near Matches
              </div>
              <div className="mt-1 text-3xl font-bold text-[#6b8e23]">
                {nearMatches.length}
              </div>
            </div>
          )}
        </div>

        {/* Cookable Recipes Section */}
        {cookableRecipes.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold text-[#2d5016]">
              Ready to Cook
              <span className="ml-2 text-lg font-normal text-[#6b6250]">
                ({cookableRecipes.length} recipe
                {cookableRecipes.length !== 1 ? 's' : ''})
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cookableRecipes.map((match) => (
                <CookableRecipeCard key={match.recipe.id} match={match} />
              ))}
            </div>
          </section>
        ) : (
          <div className="mb-12 rounded-2xl border-2 border-[#e8dcc8] bg-white p-8 text-center">
            <ChefHat className="mx-auto h-12 w-12 text-[#d4a574]" />
            <h3 className="mt-4 text-lg font-semibold text-[#2d5016]">
              No recipes available right now
            </h3>
            <p className="mt-2 text-[#6b6250]">
              Try adding more ingredients to your pantry or check out
              near-matches.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => router.push('/dashboard/pantry')}>
                Go to Pantry
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowNearMatches(true)}
              >
                Show Near-Matches
              </Button>
            </div>
          </div>
        )}

        {/* Near Matches Section */}
        {showNearMatches && nearMatches.length > 0 && (
          <section>
            <h2 className="mb-4 text-2xl font-bold text-[#2d5016]">
              Almost There
              <span className="ml-2 text-lg font-normal text-[#6b6250]">
                ({nearMatches.length} recipe
                {nearMatches.length !== 1 ? 's' : ''})
              </span>
            </h2>
            <p className="mb-4 text-sm text-[#6b6250]">
              These recipes are missing a few ingredients. Add them to your
              pantry to cook these recipes!
            </p>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {nearMatches.map((match) => (
                <CookableRecipeCard
                  key={match.recipe.id}
                  match={match}
                  showDetails
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty state when nothing matches at all */}
        {cookableRecipes.length === 0 &&
          nearMatches.length === 0 &&
          showNearMatches && (
            <div className="rounded-2xl border-2 border-[#e8dcc8] bg-white p-8 text-center">
              <ChefHat className="mx-auto h-12 w-12 text-[#d4a574]" />
              <h3 className="mt-4 text-lg font-semibold text-[#2d5016]">
                No recipes found
              </h3>
              <p className="mt-2 text-[#6b6250]">
                Your pantry is empty or you haven't added any recipes yet.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => router.push('/dashboard/pantry')}>
                  Manage Pantry
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/recipes')}
                >
                  Browse Recipes
                </Button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
