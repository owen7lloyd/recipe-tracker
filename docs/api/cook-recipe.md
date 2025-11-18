# Cook Recipe API Documentation

**Worker E (Issue #11)** - Cook Recipe Feature

This document describes the cook recipe functionality implemented in Issue #11, which allows users to cook recipes and automatically deduct ingredients from their pantry.

---

## Overview

The cook recipe system allows users to:

- Cook a recipe at original or scaled serving sizes
- Automatically deduct ingredient quantities from pantry
- Track recipe cooking history
- View which pantry items will be affected before cooking
- Handle insufficient quantities gracefully

---

## API Endpoint: `POST /api/recipes/:id/cook`

### Request

```http
POST /api/recipes/[recipeId]/cook
Content-Type: application/json
```

**Headers:**
- Requires authentication (session cookie)

**Request Body:**

```json
{
  "servings": 8,
  "adjustments": [
    {
      "ingredientId": "ingredient-uuid",
      "quantity": 2.5
    }
  ]
}
```

**Parameters:**

- `servings` (optional): Number of servings to cook. If omitted, uses recipe's original servings.
- `adjustments` (optional): Array of manual quantity adjustments for specific ingredients.

### Response

**Success (200):**

```json
{
  "success": true,
  "message": "Cooked Chocolate Chip Cookies",
  "updates": [
    {
      "ingredientId": "flour-uuid",
      "ingredientName": "all-purpose flour",
      "before": "10",
      "after": "6",
      "removed": false,
      "unit": "cups"
    },
    {
      "ingredientId": "sugar-uuid",
      "ingredientName": "sugar",
      "before": "3",
      "after": "0",
      "removed": true,
      "unit": "cups"
    }
  ],
  "servingsCooked": 8
}
```

**Error Responses:**

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Recipe doesn't belong to user's household
- `404 Not Found`: Recipe not found
- `500 Internal Server Error`: Server error

---

## Business Logic

### Ingredient Deduction

The cook recipe feature follows these rules:

1. **Optional ingredients**: Skipped entirely
2. **Non-numeric quantities**: Skipped (e.g., "to taste", "pinch")
3. **Not in pantry**: Skipped (no error)
4. **Untracked quantities**: Skipped (pantry item exists but has no quantity)
5. **Numeric quantities**: Deducted from pantry

### Quantity Calculations

- Uses recipe scaling logic to calculate scaled quantities
- Deducts the scaled amount from pantry
- Removes pantry item if remaining quantity ≤ 0
- Updates pantry item if remaining quantity > 0

### Transaction Safety

All pantry updates happen in a database transaction to ensure:
- All-or-nothing updates
- No partial deductions if an error occurs
- Cooking history is recorded atomically with pantry updates

---

## UI Components

### CookRecipeModal

Location: `/src/components/recipes/cook-recipe-modal.tsx`

**Features:**
- Serving size adjustment with ServingScaler component
- Real-time pantry deduction preview
- Visual indicators for:
  - Insufficient quantities (warning)
  - Items not in pantry (skipped)
  - Items that will be removed
  - Untracked quantities
- Loading states during scaling and cooking
- Success/error toast notifications

**Props:**

```typescript
interface CookRecipeModalProps {
  recipe: {
    id: string;
    title: string;
    servings: number;
    ingredients: Ingredient[];
  };
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Usage:**

```tsx
<CookRecipeModal
  recipe={{
    id: recipe.id,
    title: recipe.title,
    servings: recipe.servings,
    ingredients: recipe.ingredients,
  }}
  open={showCookModal}
  onClose={() => setShowCookModal(false)}
  onSuccess={() => {
    toast({ title: 'Success', description: 'Pantry updated' });
  }}
/>
```

### Integration in RecipeDetail

The "Cook This Recipe" button is displayed in the recipe header:

```tsx
<Button
  variant="default"
  size="sm"
  onClick={() => setShowCookModal(true)}
>
  <ChefHat className="mr-2 h-4 w-4" />
  Cook This Recipe
</Button>
```

---

## Database Schema

### Recipe History Table

```sql
CREATE TABLE recipe_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  cooked_by UUID NOT NULL REFERENCES users(id),
  servings INTEGER NOT NULL,
  cooked_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_recipe_history_recipe ON recipe_history(recipe_id);
CREATE INDEX idx_recipe_history_household ON recipe_history(household_id);
CREATE INDEX idx_recipe_history_date ON recipe_history(cooked_at);
```

**Purpose:**
- Track when recipes are cooked
- Track who cooked them
- Track serving sizes cooked
- Can be used for:
  - "Recently cooked" sorting
  - Recipe recommendations (future)
  - Household statistics (future)

---

## Integration with Recipe Scaling

The cook recipe feature integrates with the recipe scaling API (Issue #08):

```typescript
import { scaleRecipe } from '@/lib/recipe-scaling';

// Scale recipe to target servings
const scaledRecipe = scaleRecipe(recipe, targetServings);

// Use scaledQuantity for pantry deductions
for (const ingredient of scaledRecipe.ingredients) {
  if (ingredient.scaledQuantity !== null) {
    await deductFromPantry(
      ingredient.ingredientId,
      ingredient.scaledQuantity,
      ingredient.unit
    );
  }
}
```

**Key Points:**
- Uses `scaledQuantity` for numeric calculations
- Skips ingredients with `scaledQuantity: null`
- Preserves unit information for pantry matching

---

## User Flow

1. User views recipe detail page
2. Clicks "Cook This Recipe" button
3. Modal opens showing:
   - Serving size scaler
   - Ingredient deduction preview
   - Current → Remaining quantities
   - Warnings for insufficient items
4. User adjusts servings if needed
5. User clicks "Confirm & Cook"
6. API processes the request:
   - Scales recipe if needed
   - Deducts ingredients from pantry
   - Records cooking history
7. Success toast shown
8. Modal closes
9. Pantry is updated

---

## Error Handling

### Client-Side

- **Loading states**: Shows spinners during scaling and cooking
- **Network errors**: Displays error toast with retry option
- **Validation errors**: Prevents invalid input

### Server-Side

- **Transaction rollback**: On any error during pantry updates
- **Graceful degradation**: Skips items not in pantry or without quantities
- **Detailed error messages**: Returns specific error information

### Warnings

The modal displays warnings for:
- **Insufficient quantities**: Item has less than needed, but will still be deducted
- **Not in pantry**: Item will be skipped
- **Will be removed**: Item quantity will reach zero

---

## Testing

### Manual Testing Checklist

- [ ] Cook recipe with original servings
- [ ] Cook recipe with scaled servings (increase)
- [ ] Cook recipe with scaled servings (decrease)
- [ ] Cook recipe with insufficient pantry quantities
- [ ] Cook recipe with items not in pantry
- [ ] Cook recipe with items without tracked quantities
- [ ] Verify pantry items are removed when quantity reaches zero
- [ ] Verify pantry items are updated when quantity > zero
- [ ] Verify cooking history is recorded
- [ ] Verify transaction rollback on error

### Test Scenarios

**Scenario 1: Full pantry**
- Recipe needs: 2 cups flour, 1 cup sugar
- Pantry has: 5 cups flour, 3 cups sugar
- Expected: Flour → 3 cups, Sugar → 2 cups

**Scenario 2: Partial pantry**
- Recipe needs: 2 cups flour, 1 cup sugar
- Pantry has: 1.5 cups flour, 3 cups sugar
- Expected: Warning shown, Flour → 0 (removed), Sugar → 2 cups

**Scenario 3: Missing items**
- Recipe needs: 2 cups flour, 1 cup sugar
- Pantry has: 5 cups flour only
- Expected: Warning shown, Flour → 3 cups, Sugar skipped

**Scenario 4: Scaled recipe**
- Original: 4 servings, needs 2 cups flour
- Cook at: 8 servings, needs 4 cups flour
- Pantry has: 10 cups flour
- Expected: Flour → 6 cups

---

## Future Enhancements

Potential improvements for future iterations:

1. **Substitution support**: Allow using substitute ingredients when cooking
2. **Partial cook**: Only deduct a percentage of ingredients
3. **Cooking notes**: Add user notes when cooking
4. **Recipe ratings**: Prompt for rating after cooking
5. **Statistics dashboard**: Show most cooked recipes, favorite meals
6. **Meal planning integration**: Schedule recipes to cook
7. **Shopping list generation**: From planned cooking

---

## Dependencies

- **Issue #05**: Recipe CRUD (recipe data model)
- **Issue #06**: Pantry Management (pantry data model and API)
- **Issue #08**: Recipe Scaling (scaling calculations)

---

## Migration

To enable the cook recipe feature in an existing database:

```bash
# Run the migration
npm run db:migrate

# Or manually apply
psql -d your_database -f drizzle/0002_recipe_history.sql
```

---

## Support

For questions or issues:
- Check source code: `/src/app/api/recipes/[id]/cook/route.ts`
- Review UI component: `/src/components/recipes/cook-recipe-modal.tsx`
- See integration: `/src/components/recipes/recipe-detail.tsx`
- Contact Worker E (Issue #11)

---

## Changelog

**v1.0.0** (Issue #11)

- Initial implementation
- Cook recipe API endpoint
- Pantry deduction logic
- Recipe history tracking
- CookRecipeModal component
- Integration with recipe detail page
- Recipe scaling integration
