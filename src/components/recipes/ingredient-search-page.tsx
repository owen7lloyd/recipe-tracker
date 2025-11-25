'use client';

import { useState, useEffect } from 'react';
import { IngredientPicker, type Ingredient } from '@/components/recipes/ingredient-picker';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search as SearchIcon } from 'lucide-react';

interface RecipeSearchResult {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
  tags: string[] | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  servings: number;
  rating: number | null;
  matchCount: number;
  totalIngredients: number;
  matchPercentage: number;
}

interface IngredientSearchPageProps {
  pantryIngredients: Ingredient[];
}

export function IngredientSearchPage({
  pantryIngredients,
}: IngredientSearchPageProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<Ingredient[]>([]);
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [sortBy, setSortBy] = useState<'relevance' | 'rating' | 'cookTime' | 'prepTime'>('relevance');
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Automatically search when ingredients change
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      handleSearch();
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [selectedIngredients, excludedIngredients, matchMode, sortBy]);

  const handleSearch = async () => {
    if (selectedIngredients.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        ingredients: selectedIngredients.map((i) => i.id).join(','),
        matchMode,
        sortBy,
      });

      if (excludedIngredients.length > 0) {
        params.append('exclude', excludedIngredients.map((i) => i.id).join(','));
      }

      const response = await fetch(`/api/recipes/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        console.error('Search failed:', response.statusText);
        setResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf8f3] to-[#f0ebe0] p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="font-merriweather text-3xl font-bold text-[#2d5016]">
            Search Recipes by Ingredients
          </h1>
          <p className="mt-2 text-[#6b6250]">
            Find recipes based on the ingredients you have or want to use
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Search Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Ingredients */}
            <Card className="rounded-2xl border-[#e8dcc8]">
              <CardContent className="p-6">
                <IngredientPicker
                  selectedIngredients={selectedIngredients}
                  onIngredientsChange={setSelectedIngredients}
                  showPantryQuick={true}
                  pantryIngredients={pantryIngredients}
                />
              </CardContent>
            </Card>

            {/* Match Mode */}
            <Card className="rounded-2xl border-[#e8dcc8]">
              <CardContent className="p-6">
                <label className="block text-sm font-medium mb-3 text-[#2c2415]">
                  Match Mode
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setMatchMode('any')}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      matchMode === 'any'
                        ? 'border-[#2d5016] bg-[#2d5016] text-white'
                        : 'border-[#e8dcc8] bg-white text-[#2c2415] hover:border-[#d4a574]'
                    }`}
                  >
                    <div className="font-medium">Any (OR)</div>
                    <div className="text-xs opacity-90">
                      Recipes with at least one ingredient
                    </div>
                  </button>
                  <button
                    onClick={() => setMatchMode('all')}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      matchMode === 'all'
                        ? 'border-[#2d5016] bg-[#2d5016] text-white'
                        : 'border-[#e8dcc8] bg-white text-[#2c2415] hover:border-[#d4a574]'
                    }`}
                  >
                    <div className="font-medium">All (AND)</div>
                    <div className="text-xs opacity-90">
                      Recipes with all selected ingredients
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Sort By */}
            <Card className="rounded-2xl border-[#e8dcc8]">
              <CardContent className="p-6">
                <label className="block text-sm font-medium mb-3 text-[#2c2415]">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[#e8dcc8] bg-white text-[#2c2415] focus:border-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#d4a574]"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="cookTime">Shortest Cook Time</option>
                  <option value="prepTime">Shortest Prep Time</option>
                </select>
              </CardContent>
            </Card>

            {/* Exclude Ingredients */}
            <Card className="rounded-2xl border-[#e8dcc8]">
              <CardContent className="p-6">
                <IngredientPicker
                  selectedIngredients={excludedIngredients}
                  onIngredientsChange={setExcludedIngredients}
                  excludeMode={true}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-[#2d5016] mb-4" />
                <p className="text-[#6b6250]">Searching recipes...</p>
              </div>
            ) : !hasSearched ? (
              <Card className="rounded-2xl border-[#e8dcc8]">
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-16 w-16 mx-auto mb-4 text-[#d4a574]" />
                  <h3 className="font-merriweather text-xl font-bold text-[#2c2415] mb-2">
                    Select Ingredients to Search
                  </h3>
                  <p className="text-[#6b6250]">
                    Choose one or more ingredients to find matching recipes
                  </p>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-[#6b6250]">
                    Found <span className="font-semibold text-[#2d5016]">{results.length}</span>{' '}
                    {results.length === 1 ? 'recipe' : 'recipes'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map((recipe) => (
                    <div key={recipe.id} className="relative">
                      <RecipeCard
                        id={recipe.id}
                        title={recipe.title}
                        description={recipe.description}
                        imageUrl={recipe.imageUrl}
                        category={recipe.category}
                        tags={recipe.tags}
                        prepTimeMinutes={recipe.prepTimeMinutes}
                        cookTimeMinutes={recipe.cookTimeMinutes}
                        servings={recipe.servings}
                        rating={recipe.rating}
                      />
                      {/* Match Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-white border-2 border-[#2d5016] text-[#2d5016] px-3 py-1 rounded-full font-semibold shadow-md">
                          {recipe.matchPercentage}% match
                        </Badge>
                      </div>
                      {/* Match Count */}
                      <div className="absolute top-14 right-4 z-10">
                        <Badge className="bg-[#2d5016] text-white px-3 py-1 rounded-full text-xs">
                          {recipe.matchCount} of {recipe.totalIngredients} ingredients
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Card className="rounded-2xl border-[#e8dcc8]">
                <CardContent className="p-12 text-center">
                  <SearchIcon className="h-16 w-16 mx-auto mb-4 text-[#d4a574]" />
                  <h3 className="font-merriweather text-xl font-bold text-[#2c2415] mb-2">
                    No Recipes Found
                  </h3>
                  <p className="text-[#6b6250]">
                    Try adjusting your search criteria or selecting different ingredients
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
