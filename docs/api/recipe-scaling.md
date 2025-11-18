# Recipe Scaling API Documentation

**Worker A (Issue #08)** → **Worker E (Issue #11)**

This document describes the recipe scaling functionality implemented in Issue #08, available for use by Worker E in Issue #11 (Cook Recipe Feature).

---

## Overview

The recipe scaling system allows you to scale recipe ingredient quantities to different serving sizes. It handles:

- Proportional quantity scaling
- Fraction formatting (1.5 → 1 ½)
- Non-numeric quantities ("to taste", "pinch", etc.)
- Decimal to fraction conversion

---

## Core Library: `/src/lib/recipe-scaling.ts`

### Main Function: `scaleRecipe()`

```typescript
import { scaleRecipe } from '@/lib/recipe-scaling';

/**
 * Scale a recipe to a new serving size
 *
 * @param recipe - The original recipe with ingredients
 * @param newServings - The desired number of servings
 * @returns A new recipe object with scaled quantities
 */
function scaleRecipe(recipe: any, newServings: number): ScaledRecipe;
```

**Example Usage:**

```typescript
import { getRecipeWithIngredients } from '@/lib/recipe/helpers';
import { scaleRecipe } from '@/lib/recipe-scaling';

// Get original recipe (4 servings)
const recipe = await getRecipeWithIngredients('recipe-id');

// Scale to 8 servings
const scaledRecipe = scaleRecipe(recipe, 8);

console.log(scaledRecipe.servings); // 4 (original)
console.log(scaledRecipe.currentServings); // 8 (new)
console.log(scaledRecipe.scaleFactor); // 2

// Access scaled ingredients
scaledRecipe.ingredients.forEach((ingredient) => {
  console.log(ingredient.originalQuantity); // "2"
  console.log(ingredient.scaledQuantity); // 4 (numeric)
  console.log(ingredient.displayQuantity); // "4" (formatted)
});
```

---

## Quantity Formatting: `formatQuantity()`

```typescript
import { formatQuantity } from '@/lib/recipe-scaling';

/**
 * Format a decimal quantity as a readable string with fractions
 *
 * @param quantity - Numeric quantity to format
 * @returns Formatted string with fractions where appropriate
 */
function formatQuantity(quantity: number): string;
```

**Examples:**

```typescript
formatQuantity(0.5); // "½"
formatQuantity(1.5); // "1 ½"
formatQuantity(2.25); // "2 ¼"
formatQuantity(2.33); // "2 ⅓"
formatQuantity(0.125); // "⅛"
formatQuantity(1.67); // "1.67" (no close fraction match)
```

**Supported Fractions:**

- ⅛ (0.125)
- ¼ (0.25)
- ⅓ (0.333)
- ⅜ (0.375)
- ½ (0.5)
- ⅝ (0.625)
- ⅔ (0.666)
- ¾ (0.75)
- ⅞ (0.875)

---

## API Endpoint: `GET /api/recipes/:id/scale`

### Request

```
GET /api/recipes/[recipeId]/scale?servings=8
```

**Query Parameters:**

- `servings` (required): Desired number of servings (must be >= 1)

**Headers:**

- Requires authentication (session cookie)

### Response

**Success (200):**

```json
{
  "id": "abc123",
  "householdId": "household-id",
  "title": "Chocolate Chip Cookies",
  "description": "Delicious homemade cookies",
  "servings": 4,
  "currentServings": 8,
  "scaleFactor": 2,
  "ingredients": [
    {
      "id": "ing-1",
      "ingredientId": "flour-id",
      "ingredientName": "all-purpose flour",
      "ingredientCategory": "pantry",
      "quantity": "4",
      "originalQuantity": "2",
      "scaledQuantity": 4,
      "displayQuantity": "4",
      "unit": "cups",
      "notes": null,
      "optional": false
    },
    {
      "id": "ing-2",
      "ingredientId": "sugar-id",
      "ingredientName": "sugar",
      "ingredientCategory": "pantry",
      "quantity": "3",
      "originalQuantity": "1.5",
      "scaledQuantity": 3,
      "displayQuantity": "3",
      "unit": "cups",
      "notes": null,
      "optional": false
    },
    {
      "id": "ing-3",
      "ingredientId": "salt-id",
      "ingredientName": "salt",
      "ingredientCategory": "pantry",
      "quantity": "to taste",
      "originalQuantity": "to taste",
      "scaledQuantity": null,
      "displayQuantity": "to taste",
      "unit": null,
      "notes": null,
      "optional": false
    }
  ],
  "instructions": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**

- `400 Bad Request`: Missing or invalid servings parameter
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: Recipe doesn't belong to user's household
- `404 Not Found`: Recipe not found
- `500 Internal Server Error`: Server error

---

## TypeScript Interfaces

```typescript
export interface ScaledIngredient {
  id: string;
  ingredientId: string;
  ingredientName: string | null;
  ingredientCategory: string | null;
  quantity: string | null; // Current quantity (scaled)
  originalQuantity: string | null; // Original quantity before scaling
  scaledQuantity: number | null; // Numeric scaled quantity
  displayQuantity: string | null; // Formatted for display (with fractions)
  unit: string | null;
  notes: string | null;
  optional: boolean | null;
  substitutionGroup?: string | null;
}

export interface ScaledRecipe {
  id: string;
  householdId: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  category: string;
  tags?: string[] | null;
  prepTimeMinutes?: number | null;
  cookTimeMinutes?: number | null;
  servings: number; // Original servings
  currentServings: number; // Scaled servings
  scaleFactor: number; // currentServings / servings
  rating?: number | null;
  instructions: string[];
  ingredients: ScaledIngredient[];
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

---

## For Worker E (Cook Recipe Feature #11)

### Use Case: Cook a Scaled Recipe

When a user cooks a recipe at a different serving size, you'll need to:

1. **Get the scaled quantities** to deduct from pantry
2. **Use the numeric values** for pantry calculations

```typescript
// In your Cook Recipe handler:
import { scaleRecipe } from '@/lib/recipe-scaling';
import { getRecipeWithIngredients } from '@/lib/recipe/helpers';

async function cookRecipe(recipeId: string, servings: number) {
  // 1. Get original recipe
  const recipe = await getRecipeWithIngredients(recipeId);

  // 2. Scale to desired servings
  const scaledRecipe = scaleRecipe(recipe, servings);

  // 3. Deduct scaled quantities from pantry
  for (const ingredient of scaledRecipe.ingredients) {
    if (ingredient.scaledQuantity !== null) {
      // Use ingredient.scaledQuantity for numeric calculations
      // Use ingredient.unit for unit matching
      await deductFromPantry(
        ingredient.ingredientId,
        ingredient.scaledQuantity,
        ingredient.unit
      );
    }
    // Skip non-numeric quantities (ingredient.scaledQuantity === null)
  }

  // 4. Log cooking history (optional)
  await createCookingHistory({
    recipeId,
    servingsCooked: servings,
    scaleFactor: scaledRecipe.scaleFactor,
  });
}
```

### Important Notes for Worker E:

1. **Non-numeric quantities**: Ingredients with `scaledQuantity: null` should be skipped when deducting from pantry (they're things like "to taste")

2. **Unit handling**: Make sure to use `ingredient.unit` when matching against pantry items

3. **Display vs. Calculation**:
   - Use `displayQuantity` for showing to users (has nice fractions)
   - Use `scaledQuantity` for numeric calculations (pantry deductions)

4. **Error handling**: If scaling fails, fall back to original recipe quantities

---

## Helper Functions

### `isRecipeScaled()`

```typescript
import { isRecipeScaled } from '@/lib/recipe-scaling';

function isRecipeScaled(recipe: {
  servings: number;
  currentServings?: number;
}): boolean;
```

Check if a recipe is currently scaled:

```typescript
if (isRecipeScaled(recipe)) {
  console.log('Recipe is scaled!');
}
```

### `getScalingDescription()`

```typescript
import { getScalingDescription } from '@/lib/recipe-scaling';

function getScalingDescription(
  originalServings: number,
  currentServings: number
): string;
```

Get a human-readable scaling description:

```typescript
const desc = getScalingDescription(4, 8);
// "Scaled from 4 to 8 servings (2x)"
```

---

## Testing Examples

### Test Case 1: Scale Up (4 → 8 servings)

```typescript
const recipe = {
  servings: 4,
  ingredients: [
    { quantity: '2', unit: 'cups', ingredientName: 'flour' },
    { quantity: '1.5', unit: 'cups', ingredientName: 'sugar' },
  ],
};

const scaled = scaleRecipe(recipe, 8);

expect(scaled.currentServings).toBe(8);
expect(scaled.scaleFactor).toBe(2);
expect(scaled.ingredients[0].displayQuantity).toBe('4'); // 2 * 2
expect(scaled.ingredients[1].displayQuantity).toBe('3'); // 1.5 * 2
```

### Test Case 2: Scale Down (8 → 4 servings)

```typescript
const recipe = {
  servings: 8,
  ingredients: [{ quantity: '4', unit: 'cups', ingredientName: 'flour' }],
};

const scaled = scaleRecipe(recipe, 4);

expect(scaled.scaleFactor).toBe(0.5);
expect(scaled.ingredients[0].displayQuantity).toBe('2'); // 4 * 0.5
```

### Test Case 3: Non-numeric Quantities

```typescript
const recipe = {
  servings: 4,
  ingredients: [
    { quantity: 'to taste', ingredientName: 'salt' },
    { quantity: '1', notes: 'pinch of cinnamon' },
  ],
};

const scaled = scaleRecipe(recipe, 8);

// Non-numeric quantities are preserved
expect(scaled.ingredients[0].displayQuantity).toBe('to taste');
expect(scaled.ingredients[0].scaledQuantity).toBeNull();
```

### Test Case 4: Fractional Results

```typescript
const recipe = {
  servings: 4,
  ingredients: [{ quantity: '1', unit: 'cup', ingredientName: 'flour' }],
};

const scaled = scaleRecipe(recipe, 6);

expect(scaled.scaleFactor).toBe(1.5);
expect(scaled.ingredients[0].displayQuantity).toBe('1 ½'); // Nice fraction!
```

---

## Questions?

If you have any questions about using the scaling API:

1. Check the source code: `/src/lib/recipe-scaling.ts`
2. Review the API endpoint: `/src/app/api/recipes/[id]/scale/route.ts`
3. See the UI implementation: `/src/components/recipes/serving-scaler.tsx`
4. Contact Worker A (Issue #08)

---

## Changelog

**v1.0.0** (Issue #08)

- Initial implementation
- Core scaling algorithm
- Fraction formatting
- API endpoint
- UI component integration
