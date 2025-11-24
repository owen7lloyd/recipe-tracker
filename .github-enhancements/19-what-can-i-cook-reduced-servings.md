# What Can I Cook? - Reduced Servings Support

**Phase:** 5 - Enhancements
**Priority:** P2
**Estimate:** 4 days

## Description

Extend the "What Can I Cook?" feature to include recipes where reduced servings could be made with available ingredients. Currently, recipes only appear as cookable if ingredients are available in full quantities for the recipe's default servings. This enhancement allows users to see recipes they can make in smaller portions.

## Tasks

### Backend Enhancement

- [ ] Extend recipe matching algorithm to calculate achievable servings
- [ ] Determine minimum required quantities for each recipe
- [ ] Calculate maximum servings possible with available pantry
- [ ] Categorize recipes into:
  - Full servings available
  - Reduced servings possible
  - Not enough ingredients for any servings
- [ ] Create new endpoint for filtered "What Can I Cook?" results

### Frontend UI Updates

- [ ] Add serving size filter/toggle to "What Can I Cook?" page
- [ ] Display achievable servings on recipe cards
- [ ] Show "Can make X servings" instead of just cookable/not cookable
- [ ] Create grouped view: "Full Servings" vs. "Reduced Servings"
- [ ] Add toggle to show/hide reduced serving recipes

### Filtering Options

- [ ] Filter by minimum servings (e.g., show only recipes with 2+ servings possible)
- [ ] Sort by achievable servings (most flexible recipes first)
- [ ] Filter by serving range (e.g., "exactly 2 servings", "up to 4 servings")
- [ ] Show recipes with serving flexibility as priority

### Components to Update

- [ ] `AvailableRecipes` page - Add serving filters
- [ ] `RecipeCard` - Show achievable servings badge
- [ ] `RecipeMatchingFilters` - New serving range filter
- [ ] `RecipeDetailView` - Show serving possibilities

## Acceptance Criteria

- [ ] "What Can I Cook?" shows recipes achievable at reduced servings
- [ ] Serving calculations are accurate to 2 decimal places
- [ ] Users can filter by minimum servings required
- [ ] UI clearly shows achievable vs. full servings
- [ ] Performance: Results load in < 2 seconds
- [ ] Responsive design on mobile
- [ ] Toast notifications for ingredient shortages

## Technical Details

### Recipe Matching Algorithm Update

```typescript
interface RecipeMatchResult {
  recipeId: string;
  title: string;
  achievableServings: number;
  defaultServings: number;
  canMakeFull: boolean;
  canMakeReduced: boolean;
  limitingIngredients: string[];
  shortages: {
    ingredientId: string;
    name: string;
    needed: number;
    available: number;
    unit: string;
  }[];
}

async function findCookableRecipes(
  householdId: string,
  options?: {
    includeReducedServings?: boolean;
    minServings?: number;
    maxServings?: number;
  }
): Promise<RecipeMatchResult[]> {
  // Get all recipes and ingredients
  const recipes = await getHouseholdRecipes(householdId);
  const pantryItems = await getPantryItems(householdId);
  const pantryMap = new Map(pantryItems.map((p) => [p.ingredientId, p]));

  const results = recipes.map((recipe) => {
    // Check each ingredient
    const limitations: Array<{
      ingredientId: string;
      maxServings: number;
      needed: number;
      available: number;
    }> = [];

    for (const recipeIng of recipe.ingredients) {
      const pantryIng = pantryMap.get(recipeIng.ingredientId);
      const needed = recipeIng.quantity ?? 0;

      if (!needed) continue; // Skip ingredients without quantities

      const available = pantryIng?.quantity ?? 0;
      if (available <= 0) {
        limitations.push({
          ingredientId: recipeIng.ingredientId,
          maxServings: 0,
          needed,
          available,
        });
      } else {
        const maxServingsForIng = (available / needed) * recipe.servings;
        limitations.push({
          ingredientId: recipeIng.ingredientId,
          maxServings: maxServingsForIng,
          needed,
          available,
        });
      }
    }

    // Find limiting ingredient
    const achievableServings =
      limitations.length > 0
        ? Math.floor(Math.min(...limitations.map((l) => l.maxServings)) * 100) /
          100
        : recipe.servings;

    const canMakeFull = achievableServings >= recipe.servings;
    const canMakeReduced =
      achievableServings > 0 && achievableServings < recipe.servings;

    return {
      recipeId: recipe.id,
      title: recipe.title,
      achievableServings,
      defaultServings: recipe.servings,
      canMakeFull,
      canMakeReduced,
      limitingIngredients: limitations
        .filter((l) => l.maxServings === achievableServings)
        .map((l) => l.ingredientId),
      shortages: limitations
        .filter((l) => l.available < l.needed)
        .map((l) => ({
          ingredientId: l.ingredientId,
          name: 'ingredient name',
          needed: l.needed,
          available: l.available,
          unit: 'unit',
        })),
    };
  });

  // Filter based on options
  let filtered = results;

  if (!options?.includeReducedServings) {
    filtered = filtered.filter((r) => r.canMakeFull);
  }

  if (options?.minServings) {
    filtered = filtered.filter(
      (r) => r.achievableServings >= options.minServings
    );
  }

  if (options?.maxServings) {
    filtered = filtered.filter(
      (r) => r.achievableServings <= options.maxServings
    );
  }

  return filtered.sort((a, b) => b.achievableServings - a.achievableServings);
}
```

### Component Example

```typescript
'use client';

import { useState } from 'react';
import { RecipeCard } from '@/components/recipes/recipe-card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface ServingFilterProps {
  onFilterChange: (minServings: number, maxServings: number) => void;
}

export function ServingFilter({ onFilterChange }: ServingFilterProps) {
  const [minServings, setMinServings] = useState(0);
  const [maxServings, setMaxServings] = useState(12);

  const handleChange = (values: number[]) => {
    setMinServings(values[0]);
    setMaxServings(values[1]);
    onFilterChange(values[0], values[1]);
  };

  return (
    <div className="p-4 border rounded-2xl bg-[#faf8f3] border-[#e8dcc8]">
      <h3 className="font-merriweather text-lg font-bold mb-4">
        Achievable Servings
      </h3>
      <Slider
        min={0}
        max={12}
        step={0.5}
        value={[minServings, maxServings]}
        onValueChange={handleChange}
        className="mb-4"
      />
      <div className="flex justify-between text-sm text-[#6b6250]">
        <span>{minServings} servings minimum</span>
        <span>Up to {maxServings} servings</span>
      </div>
    </div>
  );
}

export function RecipeCardWithServings({
  recipe,
  achievableServings,
  canMakeFull,
  canMakeReduced,
}: {
  recipe: any;
  achievableServings: number;
  canMakeFull: boolean;
  canMakeReduced: boolean;
}) {
  return (
    <div className="relative">
      <RecipeCard recipe={recipe} />
      <div className="absolute top-4 right-4">
        {canMakeFull ? (
          <Badge className="bg-[#2d5016] text-white">Full Recipe</Badge>
        ) : canMakeReduced ? (
          <Badge className="bg-[#d4a574] text-white">
            {achievableServings} servings
          </Badge>
        ) : (
          <Badge variant="destructive">Can't Cook</Badge>
        )}
      </div>
    </div>
  );
}

export function AvailableRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [minServings, setMinServings] = useState(0);
  const [maxServings, setMaxServings] = useState(12);
  const [showReducedOnly, setShowReducedOnly] = useState(false);

  const handleFilterChange = (min: number, max: number) => {
    setMinServings(min);
    setMaxServings(max);
    // Refetch recipes with new filters
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ServingFilter onFilterChange={handleFilterChange} />
          <label className="flex items-center mt-4">
            <input
              type="checkbox"
              checked={showReducedOnly}
              onChange={(e) => setShowReducedOnly(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Show reduced servings only</span>
          </label>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recipes.map((recipe) => (
              <RecipeCardWithServings
                key={recipe.recipeId}
                recipe={recipe}
                achievableServings={recipe.achievableServings}
                canMakeFull={recipe.canMakeFull}
                canMakeReduced={recipe.canMakeReduced}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### API Endpoint

```typescript
// GET /api/recipes/available?minServings=2&maxServings=8&includeReduced=true
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const minServings = parseFloat(url.searchParams.get('minServings') ?? '0');
  const maxServings = parseFloat(url.searchParams.get('maxServings') ?? '12');
  const includeReduced = url.searchParams.get('includeReduced') === 'true';

  const recipes = await findCookableRecipes(session.user.householdId, {
    includeReducedServings: includeReduced,
    minServings,
    maxServings,
  });

  return NextResponse.json(recipes);
}
```

## User Workflows

### Workflow 1: Browse by Servings

1. User opens "What Can I Cook?"
2. Adjusts slider to show recipes that serve 2-4 people
3. Sees recipes they can make (full or reduced servings)
4. Selects a recipe and it auto-scales to achievable servings

### Workflow 2: Discover More Options

1. User sees only 3 recipes available at full servings
2. Enables "Include reduced servings"
3. Discovers 5 additional recipes they can make with fewer servings
4. Uses this when cooking for fewer people

## Dependencies

- Phase 1-2 features fully implemented
- Recipe matching logic stable
- Recipe scaling functionality complete

## Testing

- [ ] Test calculations with various ingredient quantities
- [ ] Test fractional servings (e.g., 2.5 servings)
- [ ] Test with recipes having no quantity ingredients
- [ ] Test performance with 100+ recipes
- [ ] Test filter combinations (min, max, reduced only)
- [ ] Verify accurate serving calculations across 10+ test recipes
- [ ] Test on mobile with slider interaction

## References

- Recipe Matching: `.github-issues/10-recipe-matching.md`
- Recipe Scaling: `.github-issues/08-recipe-scaling.md`
- Pantry Impact: `.github-enhancements/18-pantry-impact-indicator.md`
