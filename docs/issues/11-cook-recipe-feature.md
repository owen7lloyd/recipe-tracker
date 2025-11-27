# Cook Recipe Feature (Pantry Updates)

**Phase:** 2 - Core Features
**Priority:** P0
**Estimate:** 4 days

## Description

Implement "cook this recipe" functionality that automatically deducts ingredient quantities from the pantry when a recipe is cooked.

## Tasks

### API Endpoint
- [ ] `POST /api/recipes/:id/cook`
- [ ] Accept servings parameter (for scaled recipes)
- [ ] Accept manual quantity adjustments
- [ ] Update pantry quantities atomically
- [ ] Return updated pantry state

### Business Logic
- [ ] Calculate ingredients needed based on servings
- [ ] Find matching pantry items
- [ ] Deduct quantities from pantry
- [ ] Handle partial quantities (e.g., 3 cups available, 1 cup needed → 2 cups remain)
- [ ] Remove pantry items when quantity reaches zero
- [ ] Skip items without tracked quantities
- [ ] Handle substitutions if used

### Confirmation Flow
- [ ] Show confirmation modal before cooking
- [ ] Display all ingredients that will be deducted
- [ ] Show current vs remaining quantities
- [ ] Allow manual adjustments before confirming
- [ ] Warn if insufficient quantities

### Quantity Validation
- [ ] Check if enough of each ingredient
- [ ] Warn user if pantry quantity less than required
- [ ] Allow cooking anyway (partial use)
- [ ] Show which items will be depleted

### History Tracking (Optional)
- [ ] Create `recipe_history` table
- [ ] Record when recipes are cooked
- [ ] Record by whom
- [ ] Use for "recently cooked" sorting
- [ ] Use for recipe recommendations (future)

### UI Components
- [ ] `CookRecipeButton` - Primary action on recipe detail
- [ ] `CookConfirmationModal` - Shows deductions
- [ ] `IngredientDeductionRow` - Shows current → remaining
- [ ] `InsufficientWarning` - Alert for missing quantities
- [ ] Success toast notification

### Error Handling
- [ ] Handle concurrent cooking (race conditions)
- [ ] Handle deleted pantry items
- [ ] Handle deleted ingredients
- [ ] Rollback on error

## Acceptance Criteria

- [ ] "Cook This Recipe" button on recipe detail page
- [ ] Clicking shows confirmation modal
- [ ] Modal shows all ingredient deductions
- [ ] Can adjust quantities before confirming
- [ ] Pantry updates correctly after cooking
- [ ] Items removed when quantity reaches zero
- [ ] Items without quantity tracked are not removed
- [ ] Works with scaled recipes
- [ ] Shows success notification
- [ ] Handles errors gracefully
- [ ] Updates are atomic (all or nothing)

## Technical Details

### API Implementation

```typescript
// POST /api/recipes/:id/cook
interface CookRecipeRequest {
  servings?: number
  adjustments?: Array<{
    ingredient_id: string
    quantity: number
  }>
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { servings, adjustments } = await req.json()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, household_id: true }
  })

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

  if (recipe.household_id !== user.household_id) {
    return Response.json({ error: "Forbidden" }, { status: 403 })
  }

  // Calculate scale factor
  const scaleFactor = servings
    ? servings / recipe.servings
    : 1

  // Use transaction for atomicity
  const result = await db.$transaction(async (tx) => {
    const updates = []

    for (const recipeIng of recipe.recipe_ingredients) {
      if (recipeIng.optional) continue

      // Check for manual adjustment
      const adjustment = adjustments?.find(
        a => a.ingredient_id === recipeIng.ingredient_id
      )

      const quantityNeeded = adjustment?.quantity
        || (recipeIng.quantity || 0) * scaleFactor

      if (quantityNeeded === 0) continue

      // Find pantry item
      const pantryItem = await tx.pantryItem.findFirst({
        where: {
          household_id: user.household_id,
          ingredient_id: recipeIng.ingredient_id
        }
      })

      if (!pantryItem) continue

      // Skip if no quantity tracked
      if (!pantryItem.quantity) continue

      const remainingQuantity = pantryItem.quantity - quantityNeeded

      if (remainingQuantity <= 0) {
        // Remove item
        await tx.pantryItem.delete({
          where: { id: pantryItem.id }
        })
        updates.push({
          ingredient: recipeIng.ingredient,
          before: pantryItem.quantity,
          after: 0,
          removed: true
        })
      } else {
        // Update quantity
        await tx.pantryItem.update({
          where: { id: pantryItem.id },
          data: {
            quantity: remainingQuantity,
            updated_at: new Date()
          }
        })
        updates.push({
          ingredient: recipeIng.ingredient,
          before: pantryItem.quantity,
          after: remainingQuantity,
          removed: false
        })
      }
    }

    // Record cooking history (optional)
    await tx.recipeHistory.create({
      data: {
        recipe_id: recipe.id,
        household_id: user.household_id,
        cooked_by: user.id,
        servings: servings || recipe.servings,
        cooked_at: new Date()
      }
    })

    return updates
  })

  return Response.json({
    success: true,
    updates: result
  })
}
```

### Database Schema (Optional History)

```sql
CREATE TABLE recipe_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  cooked_by UUID NOT NULL REFERENCES users(id),
  servings INTEGER NOT NULL,
  cooked_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recipe_history_recipe ON recipe_history(recipe_id);
CREATE INDEX idx_recipe_history_household ON recipe_history(household_id);
CREATE INDEX idx_recipe_history_date ON recipe_history(cooked_at DESC);
```

### UI Component

```typescript
'use client'

interface CookRecipeModalProps {
  recipe: Recipe
  open: boolean
  onClose: () => void
}

export function CookRecipeModal({ recipe, open, onClose }: CookRecipeModalProps) {
  const [servings, setServings] = useState(recipe.servings)
  const [adjustments, setAdjustments] = useState<Map<string, number>>(new Map())
  const { data: pantry } = useQuery(['pantry'])

  const handleCook = async () => {
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/cook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servings,
          adjustments: Array.from(adjustments.entries()).map(([id, qty]) => ({
            ingredient_id: id,
            quantity: qty
          }))
        })
      })

      if (!res.ok) throw new Error('Failed to cook recipe')

      const result = await res.json()

      // Show success toast
      toast.success(`Cooked ${recipe.title}!`)

      // Refresh pantry
      queryClient.invalidateQueries(['pantry'])

      onClose()
    } catch (error) {
      toast.error('Failed to update pantry')
    }
  }

  const scaleFactor = servings / recipe.servings

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cook {recipe.title}</DialogTitle>
          <DialogDescription>
            This will deduct ingredients from your pantry
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ServingScaler
            originalServings={recipe.servings}
            currentServings={servings}
            onScaleChange={setServings}
          />

          <div className="space-y-2">
            <h4 className="font-medium">Ingredient Deductions</h4>
            {recipe.ingredients.map(ing => {
              const quantityNeeded = (ing.quantity || 0) * scaleFactor
              const pantryItem = pantry?.find(p => p.ingredient_id === ing.ingredient_id)
              const currentQty = pantryItem?.quantity || 0
              const remainingQty = Math.max(0, currentQty - quantityNeeded)
              const insufficient = pantryItem?.quantity && currentQty < quantityNeeded

              return (
                <div key={ing.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{ing.ingredient.name}</p>
                    {insufficient && (
                      <p className="text-sm text-yellow-600">
                        Warning: Only {currentQty} {ing.unit} available
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {currentQty} {ing.unit} → {remainingQty} {ing.unit}
                    </p>
                    {remainingQty === 0 && (
                      <p className="text-xs text-red-600">Will be removed</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCook}>Confirm & Cook</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

## Dependencies

- [ ] #05 Recipe CRUD
- [ ] #06 Pantry Management
- [ ] #08 Recipe Scaling
- Recipe detail page implemented

## Testing

- [ ] Test cooking with original servings
- [ ] Test cooking with scaled servings
- [ ] Test quantity deductions
- [ ] Test item removal when quantity reaches zero
- [ ] Test items without quantity (should not be removed)
- [ ] Test insufficient quantity warning
- [ ] Test concurrent cooking (race conditions)
- [ ] Test transaction rollback on error
- [ ] E2E test: Add pantry → Cook recipe → Verify pantry updated

## Resources

- PRD Section 3.3: Pantry Management (US-3.3)
- Implementation Plan: Section 2.5 Cook Recipe Feature
