# Search Recipes by Ingredients

**Phase:** 5 - Enhancements
**Priority:** P2
**Estimate:** 3 days

## Description

Add a powerful search and filtering feature that allows users to find recipes by selecting multiple ingredients. Users can search for recipes that contain specific ingredients, including recipes from their pantry or a custom ingredient list. This complements the existing "What Can I Cook?" feature by providing more flexible ingredient-based discovery.

## Tasks

### Backend Enhancement

- [ ] Create `GET /api/recipes/search?ingredients=id1,id2` endpoint
- [ ] Support "contains any" and "contains all" modes
- [ ] Support ingredient exclusion (NOT operator)
- [ ] Return recipes sorted by match relevance
- [ ] Include match count (e.g., "3 of 4 ingredients")
- [ ] Paginate results (20 per page)
- [ ] Add search performance indexing if needed

### Frontend Components

- [ ] Create `IngredientSearch` component with autocomplete
- [ ] Multi-select ingredient picker
- [ ] Display selected ingredients as tags/chips
- [ ] Add "Clear all" button
- [ ] Add toggle for "Any" vs. "All" ingredients mode
- [ ] Add toggle for "Exclude" mode
- [ ] Show "Quick select" for pantry ingredients

### Search Results Page

- [ ] Display matching recipes in grid
- [ ] Show match percentage (e.g., "4 of 5 ingredients")
- [ ] Show which ingredients are missing
- [ ] Filter results by category, rating, difficulty
- [ ] Sort by relevance, rating, cook time
- [ ] Infinite scroll or pagination
- [ ] "Add recipe to list" quick action

### Integration Points

- [ ] Add search tab to recipe navigation
- [ ] Link from ingredient detail views
- [ ] "Find recipes with this ingredient" quick action
- [ ] Dashboard ingredient block with quick search

### User Preferences

- [ ] Save favorite ingredient search combinations (optional)
- [ ] Recently searched ingredients
- [ ] Personalized ingredient recommendations based on pantry

## Acceptance Criteria

- [ ] Users can select multiple ingredients to search
- [ ] Search returns recipes containing selected ingredients
- [ ] Users can toggle "contains any" vs. "contains all"
- [ ] Users can exclude ingredients
- [ ] Results show match percentage
- [ ] Search completes in < 1 second
- [ ] Mobile responsive with touch-friendly ingredient picker
- [ ] Autocomplete works smoothly
- [ ] Pagination or infinite scroll works
- [ ] WCAG AA accessibility compliant

## Technical Details

### Database Query

```typescript
async function searchRecipesByIngredients(
  householdId: string,
  ingredientIds: string[],
  options: {
    matchMode: 'any' | 'all'; // 'any' = OR, 'all' = AND
    excludeIngredients?: string[];
    limit?: number;
    offset?: number;
  }
): Promise<RecipeSearchResult[]> {
  const {
    matchMode,
    excludeIngredients = [],
    limit = 20,
    offset = 0,
  } = options;

  if (ingredientIds.length === 0) {
    return [];
  }

  // Subquery: recipes containing each ingredient
  const recipesByIngredient = db
    .select({ recipeId: recipeIngredients.recipeId })
    .from(recipeIngredients)
    .where(inArray(recipeIngredients.ingredientId, ingredientIds))
    .distinct();

  let query = db
    .select({
      id: recipes.id,
      title: recipes.title,
      imageUrl: recipes.imageUrl,
      servings: recipes.servings,
      avgRating: recipes.avgRating,
      matchCount: sql`COUNT(DISTINCT ${recipeIngredients.ingredientId})`,
    })
    .from(recipes)
    .innerJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
    .where(
      and(
        eq(recipes.householdId, householdId),
        inArray(recipeIngredients.ingredientId, ingredientIds)
      )
    );

  // Exclude ingredients
  if (excludeIngredients.length > 0) {
    query = query.where(
      notInArray(recipeIngredients.ingredientId, excludeIngredients)
    );
  }

  // Group and filter by match mode
  const results = await query
    .groupBy(recipes.id)
    .having(
      matchMode === 'all'
        ? gte(
            sql`COUNT(DISTINCT ${recipeIngredients.ingredientId})`,
            ingredientIds.length
          )
        : undefined
    )
    .orderBy(desc(sql`COUNT(DISTINCT ${recipeIngredients.ingredientId})`))
    .limit(limit)
    .offset(offset);

  // Calculate total ingredients for match percentage
  const withMatchPercentage = await Promise.all(
    results.map(async (result) => {
      const [recipe] = await db
        .select({ totalIngredients: sql`COUNT(*)` })
        .from(recipeIngredients)
        .where(eq(recipeIngredients.recipeId, result.id));

      return {
        ...result,
        totalIngredients: recipe?.totalIngredients ?? 0,
        matchPercentage: Math.round(
          ((result.matchCount ?? 0) / (recipe?.totalIngredients ?? 1)) * 100
        ),
      };
    })
  );

  return withMatchPercentage;
}
```

### API Endpoint

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const searchSchema = z.object({
  ingredients: z.string(),
  matchMode: z.enum(['any', 'all']).default('any'),
  excludeIngredients: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
  sortBy: z.enum(['relevance', 'rating', 'cookTime']).default('relevance'),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json({ error: 'No household' }, { status: 403 });
    }

    const url = new URL(request.url);
    const ingredientsParam = url.searchParams.get('ingredients');

    if (!ingredientsParam) {
      return NextResponse.json(
        { error: 'ingredients parameter required' },
        { status: 400 }
      );
    }

    const ingredientIds = ingredientsParam.split(',').filter(Boolean);
    const matchMode = url.searchParams.get('matchMode') ?? 'any';
    const excludeParam = url.searchParams.get('exclude');
    const excludeIngredients = excludeParam ? excludeParam.split(',') : [];

    const results = await searchRecipesByIngredients(
      householdId,
      ingredientIds,
      {
        matchMode: matchMode as 'any' | 'all',
        excludeIngredients,
      }
    );

    return NextResponse.json({
      results,
      count: results.length,
      total: results.length, // Would be from COUNT(*) in real implementation
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

### Ingredient Picker Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Zap } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  category: string;
}

interface IngredientPickerProps {
  onSelect: (ingredientIds: string[]) => void;
  initialIngredients?: string[];
  showPantryQuick?: boolean;
  pantryIngredients?: Ingredient[];
}

export function IngredientPicker({
  onSelect,
  initialIngredients = [],
  showPantryQuick = false,
  pantryIngredients = [],
}: IngredientPickerProps) {
  const [selected, setSelected] = useState<string[]>(initialIngredients);
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);

  useEffect(() => {
    onSelect(selected);
  }, [selected]);

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const response = await fetch(
      `/api/ingredients/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    setSuggestions(data.ingredients || []);
  };

  const addIngredient = (ingredientId: string) => {
    if (!selected.includes(ingredientId)) {
      setSelected([...selected, ingredientId]);
      setSearch('');
      setSuggestions([]);
    }
  };

  const removeIngredient = (ingredientId: string) => {
    setSelected(selected.filter((id) => id !== ingredientId));
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Search Ingredients
        </label>
        <Input
          placeholder="Type ingredient name..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="border-[#e8dcc8] rounded-xl"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 border border-[#e8dcc8] rounded-lg max-h-48 overflow-y-auto">
            {suggestions.map((ingredient) => (
              <button
                key={ingredient.id}
                onClick={() => addIngredient(ingredient.id)}
                className="w-full text-left px-4 py-2 hover:bg-[#faf8f3] border-b border-[#e8dcc8] last:border-0"
              >
                {ingredient.name}
                <span className="text-xs text-gray-500 ml-2">
                  {ingredient.category}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pantry Quick Select */}
      {showPantryQuick && pantryIngredients.length > 0 && (
        <div>
          <button className="text-sm font-medium text-[#2d5016] flex items-center gap-1 mb-2">
            <Zap size={16} />
            Quick: My Pantry ({pantryIngredients.length})
          </button>
          <div className="flex flex-wrap gap-2">
            {pantryIngredients.slice(0, 8).map((ingredient) => (
              <Badge
                key={ingredient.id}
                variant="outline"
                className="cursor-pointer"
                onClick={() => addIngredient(ingredient.id)}
              >
                {ingredient.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Selected Ingredients */}
      {selected.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Selected ({selected.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => (
              <Badge
                key={id}
                className="bg-[#2d5016] text-white pl-3 pr-1 rounded-full"
              >
                {/* Get ingredient name from selected */}
                <span className="mr-2">Ingredient</span>
                <button
                  onClick={() => removeIngredient(id)}
                  className="hover:bg-[#1f3a0f] rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
          <button
            onClick={() => setSelected([])}
            className="text-sm text-gray-600 mt-2 hover:text-gray-800"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
```

### Search Results Page

```typescript
'use client';

import { useState } from 'react';
import { IngredientPicker } from '@/components/recipes/ingredient-picker';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function IngredientSearchPage() {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (ingredientIds: string[]) => {
    if (ingredientIds.length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        ingredients: ingredientIds.join(','),
        matchMode,
      });

      const response = await fetch(`/api/recipes/search?${params}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-merriweather text-3xl font-bold">Find Recipes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <IngredientPicker
            onSelect={(ids) => {
              setSelectedIngredients(ids);
              handleSearch(ids);
            }}
            showPantryQuick
          />

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Match Mode</p>
            <ToggleGroup
              type="single"
              value={matchMode}
              onValueChange={(value) => {
                if (value) {
                  setMatchMode(value as 'any' | 'all');
                  handleSearch(selectedIngredients);
                }
              }}
            >
              <ToggleGroupItem value="any" aria-label="Match any">
                Any (OR)
              </ToggleGroupItem>
              <ToggleGroupItem value="all" aria-label="Match all">
                All (AND)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">Loading recipes...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((recipe: any) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard recipe={recipe} />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium border border-[#e8dcc8]">
                    {recipe.matchPercentage}% match
                  </div>
                </div>
              ))}
            </div>
          ) : selectedIngredients.length > 0 ? (
            <div className="text-center py-12 text-gray-600">
              No recipes found with those ingredients
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              Select ingredients to find recipes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## User Workflows

### Workflow 1: Find Recipes with Specific Ingredients

1. User opens ingredient search
2. Selects 3 ingredients (e.g., chicken, tomato, olive oil)
3. Sets to "Any" mode to see all recipes with at least one
4. Sees 12 recipes matching
5. Clicks on recipe to view details

### Workflow 2: Use Pantry Quick Select

1. User opens ingredient search
2. Clicks "Quick: My Pantry (25)"
3. Pre-fills with their top 5 pantry ingredients
4. Sees recipes they can make completely
5. Selects a recipe

### Workflow 3: Exclude Ingredients

1. User searches for "pasta recipes"
2. Enters: pasta, garlic, onion
3. Sets to "All" mode
4. Adds allergies: shellfish, nuts (exclude)
5. Gets tailored recipe results

## Dependencies

- Phase 1-2 features fully implemented
- Ingredient database populated
- Recipe ingredient associations complete
- Ingredient search API working

## Testing

- [ ] Search with single ingredient returns correct recipes
- [ ] Search with multiple ingredients filters correctly
- [ ] Match "any" vs "all" mode works properly
- [ ] Match percentage calculated accurately
- [ ] Autocomplete returns relevant suggestions
- [ ] Selected ingredients display as tags
- [ ] Results update in real-time as ingredients selected
- [ ] Performance with 500+ recipes is acceptable
- [ ] Mobile ingredient picker is usable
- [ ] Pagination works if results exceed 20
- [ ] Exclude ingredients feature works

## References

- Recipe CRUD: `.github-issues/05-recipe-crud.md`
- Recipe Matching: `.github-issues/10-recipe-matching.md`
- Pantry Management: `.github-issues/06-pantry-management.md`
- What Can I Cook? Reduced Servings: `.github-enhancements/19-what-can-i-cook-reduced-servings.md`
