# Pantry Impact Indicator

**Phase:** 5 - Enhancements
**Priority:** P2
**Estimate:** 3 days

## Description

Display ingredient insufficiency warnings on recipes and grocery lists to help users understand which ingredients are missing or in low quantities from their pantry. This provides better visibility into what needs to be purchased before cooking a recipe.

## Tasks

### Backend Enhancement

- [ ] Extend recipe response to include pantry availability status
- [ ] Add ingredient availability check endpoint
- [ ] Calculate shortage amounts for each ingredient
- [ ] Determine if ingredient is:
  - Available (sufficient quantity in pantry)
  - Partial (some but insufficient quantity)
  - Missing (not in pantry)

### Recipe Display Updates

- [ ] Update `RecipeDetail` component to show ingredient status
- [ ] Add visual indicators for ingredient availability:
  - Green checkmark for available
  - Yellow warning for partial
  - Red X for missing
- [ ] Display quantity needed vs. available
- [ ] Show shortage amount when applicable

### Grocery List Integration

- [ ] Highlight items needed due to insufficiency vs. pantry depletion
- [ ] Add filter toggle: "Show all" vs. "Shortage only"
- [ ] Color-code list items by urgency
- [ ] Display why each item is on the list (shortage vs. new recipe)

### "What Can I Cook?" Enhancement

- [ ] Show partial match recipes with required quantity reductions
- [ ] Display which ingredients are the limiting factor
- [ ] Suggest servings possible with current pantry

### Components to Update

- [ ] `RecipeDetail` - Add pantry status indicators
- [ ] `RecipeCard` - Show quick availability badge
- [ ] `RecipeIngredients` - Individual ingredient status
- [ ] `GroceryListItem` - Show reason for inclusion
- [ ] `AvailableRecipes` - Add shortage information

## Acceptance Criteria

- [ ] Users see which ingredients are available/missing/partial
- [ ] Shortage amounts are accurately calculated
- [ ] Visual indicators are clear and consistent
- [ ] Grocery list shows why each item is needed
- [ ] "What Can I Cook?" shows recipes with reduced servings
- [ ] Performance impact is minimal (<100ms for calculations)
- [ ] Responsive on mobile devices

## Technical Details

### Database Query Enhancement

```typescript
interface IngredientStatus {
  ingredientId: string;
  name: string;
  needed: number;
  unit: string;
  available: number;
  status: 'available' | 'partial' | 'missing';
  shortage: number;
}

// Get recipe with pantry status
async function getRecipeWithPantryStatus(
  recipeId: string,
  householdId: string
): Promise<Recipe & { ingredients: IngredientStatus[] }> {
  const recipe = await db
    .select()
    .from(recipes)
    .where(eq(recipes.id, recipeId));
  const ingredients = await db
    .select({
      id: recipeIngredients.ingredientId,
      name: ingredients.name,
      needed: recipeIngredients.quantity,
      unit: recipeIngredients.unit,
      available: pantryItems.quantity,
    })
    .from(recipeIngredients)
    .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
    .leftJoin(
      pantryItems,
      and(
        eq(pantryItems.ingredientId, recipeIngredients.ingredientId),
        eq(pantryItems.householdId, householdId)
      )
    )
    .where(eq(recipeIngredients.recipeId, recipeId));

  const withStatus = ingredients.map((ing) => ({
    ...ing,
    available: ing.available ?? 0,
    status:
      ing.available === null || ing.available === 0
        ? 'missing'
        : ing.available < ing.needed
          ? 'partial'
          : 'available',
    shortage: Math.max(0, (ing.needed ?? 0) - (ing.available ?? 0)),
  }));

  return { ...recipe, ingredients: withStatus };
}
```

### Component Example

```typescript
'use client';

import { Check, AlertCircle, X } from 'lucide-react';

interface IngredientWithStatus {
  name: string;
  quantity: number;
  unit?: string;
  available: number;
  status: 'available' | 'partial' | 'missing';
  shortage: number;
}

export function RecipeIngredientWithStatus({
  ingredient,
}: {
  ingredient: IngredientWithStatus;
}) {
  const statusConfig = {
    available: {
      icon: <Check className="w-5 h-5 text-green-600" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      label: 'Available',
    },
    partial: {
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      label: `${ingredient.shortage} ${ingredient.unit} short`,
    },
    missing: {
      icon: <X className="w-5 h-5 text-red-600" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      label: 'Not in pantry',
    },
  };

  const config = statusConfig[ingredient.status];

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${config.bgColor}`}>
      <div className="flex items-center gap-3">
        {config.icon}
        <div>
          <p className="font-medium">{ingredient.name}</p>
          <p className={`text-sm ${config.textColor}`}>
            {ingredient.quantity} {ingredient.unit} needed
            {ingredient.available > 0 && ` | ${ingredient.available} available`}
          </p>
        </div>
      </div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}
```

### API Endpoint

```typescript
// GET /api/recipes/[id]/pantry-status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const householdId = session.user.householdId;
  if (!householdId)
    return NextResponse.json({ error: 'No household' }, { status: 403 });

  const recipe = await getRecipeWithPantryStatus(params.id, householdId);
  return NextResponse.json({
    recipe,
    totalShortage: recipe.ingredients.reduce(
      (sum, ing) => sum + ing.shortage,
      0
    ),
    missingCount: recipe.ingredients.filter((ing) => ing.status === 'missing')
      .length,
  });
}
```

## Styling

Use organic garden palette:

- Available: `#2d5016` (primary green)
- Partial: `#d4a574` (accent gold)
- Missing: `#d97706` (warning orange)

## Dependencies

- Phase 1-2 features fully implemented
- Pantry data structure stable
- Recipe ingredient associations complete

## Testing

- [ ] Test with recipes missing all ingredients
- [ ] Test with recipes missing some ingredients
- [ ] Test with recipes fully available
- [ ] Test with ingredients at exact quantities
- [ ] Test with fractional quantities
- [ ] Verify performance with 100+ ingredients
- [ ] Test on mobile devices
- [ ] Test real-time pantry updates

## References

- Pantry Management: `.github-issues/06-pantry-management.md`
- Recipe Scaling: `.github-issues/08-recipe-scaling.md`
- Recipe Matching: `.github-issues/10-recipe-matching.md`
