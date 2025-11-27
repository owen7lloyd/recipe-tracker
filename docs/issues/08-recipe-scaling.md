# Recipe Scaling Functionality

**Phase:** 2 - Core Features
**Priority:** P0
**Estimate:** 3 days

## Description

Implement recipe scaling feature to adjust ingredient quantities based on desired serving size, with support for fractions, edge cases, and persistence through grocery list generation.

## Tasks

### Scaling Algorithm
- [ ] Calculate scale factor (newServings / originalServings)
- [ ] Multiply all ingredient quantities by scale factor
- [ ] Handle edge cases (zero quantities, "to taste", etc.)
- [ ] Round to reasonable precision
- [ ] Format fractions nicely (1.5 → 1 ½)

### API Endpoint
- [ ] `GET /api/recipes/:id/scale?servings=6`
- [ ] Return recipe with scaled ingredient quantities
- [ ] Include original servings in response

### UI Components
- [ ] `ServingScaler` - Stepper component (-, current, +)
- [ ] Update `RecipeDetail` to show scaled quantities
- [ ] Visual indicator when recipe is scaled
- [ ] Reset to original servings button

### Number Formatting
- [ ] Convert decimals to fractions where appropriate
- [ ] Format common fractions (0.25 → ¼, 0.5 → ½, 0.75 → ¾)
- [ ] Handle mixed numbers (1.5 → 1 ½)
- [ ] Round to sensible precision (2 decimal places for most)
- [ ] Handle very small quantities (0.125 tsp → ⅛ tsp)

### Non-Numeric Quantities
- [ ] Preserve "to taste" without scaling
- [ ] Preserve "pinch of" without scaling
- [ ] Preserve "dash of" without scaling
- [ ] Handle ranges (scale both min and max)

### Persistence
- [ ] Store scaled servings in state
- [ ] Pass scaled quantities to grocery list generation
- [ ] Remember scaling when returning to recipe detail

## Acceptance Criteria

- [ ] Serving size can be adjusted with +/- buttons
- [ ] All ingredient quantities scale proportionally
- [ ] Fractions display nicely (not 0.333333)
- [ ] "To taste" and similar preserved
- [ ] Ranges scale correctly
- [ ] Can reset to original servings
- [ ] Scaled recipe generates correct grocery list
- [ ] UI shows current vs original servings
- [ ] Works with imported recipes
- [ ] Mobile friendly stepper controls

## Technical Details

### Scaling Algorithm

```typescript
interface ScaledRecipe extends Recipe {
  current_servings: number
  scale_factor: number
}

function scaleRecipe(recipe: Recipe, newServings: number): ScaledRecipe {
  const scaleFactor = newServings / recipe.servings

  const scaledIngredients = recipe.ingredients.map(ingredient => {
    // Handle non-numeric quantities
    if (!ingredient.quantity || isNonNumeric(ingredient.name)) {
      return ingredient
    }

    const scaledQuantity = ingredient.quantity * scaleFactor
    const formattedQuantity = formatQuantity(scaledQuantity)

    return {
      ...ingredient,
      quantity: scaledQuantity,
      display_quantity: formattedQuantity
    }
  })

  return {
    ...recipe,
    current_servings: newServings,
    scale_factor: scaleFactor,
    ingredients: scaledIngredients
  }
}

function isNonNumeric(text: string): boolean {
  const nonNumericPhrases = ['to taste', 'pinch', 'dash', 'handful']
  return nonNumericPhrases.some(phrase =>
    text.toLowerCase().includes(phrase)
  )
}
```

### Quantity Formatting

```typescript
function formatQuantity(quantity: number): string {
  // Common fractions
  const fractions = [
    { decimal: 0.125, display: '⅛' },
    { decimal: 0.25, display: '¼' },
    { decimal: 0.333, display: '⅓' },
    { decimal: 0.5, display: '½' },
    { decimal: 0.666, display: '⅔' },
    { decimal: 0.75, display: '¾' },
  ]

  const whole = Math.floor(quantity)
  const fractional = quantity - whole

  // Find closest fraction
  if (fractional > 0) {
    for (const frac of fractions) {
      if (Math.abs(fractional - frac.decimal) < 0.05) {
        return whole > 0 ? `${whole} ${frac.display}` : frac.display
      }
    }

    // No close fraction, use decimal
    return quantity.toFixed(2).replace(/\.?0+$/, '')
  }

  return whole.toString()
}
```

### API Implementation

```typescript
// GET /api/recipes/:id/scale?servings=6
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const servings = parseInt(searchParams.get('servings') || '0')

  if (!servings || servings < 1) {
    return Response.json({ error: "Invalid servings" }, { status: 400 })
  }

  const recipe = await db.recipe.findUnique({
    where: { id: params.id },
    include: {
      recipe_ingredients: {
        include: { ingredient: true }
      }
    }
  })

  if (!recipe) {
    return Response.json({ error: "Recipe not found" }, { status: 404 })
  }

  // Verify household access
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  if (recipe.household_id !== user.household_id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  const scaled = scaleRecipe(recipe, servings)
  return Response.json(scaled)
}
```

### UI Component

```typescript
'use client'

interface ServingScalerProps {
  originalServings: number
  currentServings: number
  onScaleChange: (servings: number) => void
}

export function ServingScaler({
  originalServings,
  currentServings,
  onScaleChange
}: ServingScalerProps) {
  const handleDecrease = () => {
    if (currentServings > 1) {
      onScaleChange(currentServings - 1)
    }
  }

  const handleIncrease = () => {
    onScaleChange(currentServings + 1)
  }

  const handleReset = () => {
    onScaleChange(originalServings)
  }

  const isScaled = currentServings !== originalServings

  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">Servings:</label>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecrease}
          disabled={currentServings <= 1}
          className="btn-icon"
        >
          −
        </button>
        <span className="text-lg font-semibold min-w-[3ch] text-center">
          {currentServings}
        </span>
        <button onClick={handleIncrease} className="btn-icon">
          +
        </button>
      </div>
      {isScaled && (
        <button onClick={handleReset} className="btn-secondary text-sm">
          Reset to {originalServings}
        </button>
      )}
    </div>
  )
}
```

## Dependencies

- [ ] #05 Recipe CRUD completed
- Recipe detail page implemented

## Testing

- [ ] Test scaling up (4 → 8 servings)
- [ ] Test scaling down (8 → 4 servings)
- [ ] Test fractional scaling (4 → 6 servings)
- [ ] Test edge cases (1 serving recipes)
- [ ] Test non-numeric quantities preserved
- [ ] Test range scaling (1-2 cups → 2-4 cups)
- [ ] Test fraction formatting
- [ ] Test very small quantities (⅛ tsp)
- [ ] Test grocery list with scaled recipe
- [ ] Unit tests for scaling algorithm
- [ ] Unit tests for quantity formatting

## Resources

- PRD Section 3.2: Recipe Management (US-2.3)
- Implementation Plan: Section 2.2 Recipe Scaling
