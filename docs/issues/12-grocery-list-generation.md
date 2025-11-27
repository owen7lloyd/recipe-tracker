# Grocery List Generation

**Phase:** 3 - Grocery Lists
**Priority:** P0
**Estimate:** 5 days

## Description

Implement grocery list generation from selected recipes, automatically excluding pantry items and combining quantities for shared ingredients.

## Tasks

### List Generation Algorithm
- [ ] Select multiple recipes for shopping trip
- [ ] Extract all ingredients from selected recipes
- [ ] Check against current pantry
- [ ] Exclude items already in pantry (with sufficient quantity)
- [ ] Combine quantities for ingredients needed in multiple recipes
- [ ] Handle unit conversions if possible
- [ ] Track which recipes need each ingredient

### API Endpoints
- [ ] `POST /api/grocery-lists/generate` - Generate list from recipes
- [ ] `GET /api/grocery-lists` - List all grocery lists
- [ ] `POST /api/grocery-lists` - Create custom list
- [ ] `GET /api/grocery-lists/:id` - Get specific list
- [ ] `PUT /api/grocery-lists/:id` - Update list
- [ ] `DELETE /api/grocery-lists/:id` - Delete list

### Recipe Selection Interface
- [ ] Multi-select checkboxes on recipe cards
- [ ] Batch select controls (select all, clear)
- [ ] Show selected count
- [ ] "Generate List" button
- [ ] Option to specify servings per recipe

### Manual List Management
- [ ] Add items manually to generated list
- [ ] Remove items from list
- [ ] Edit item quantities
- [ ] Mark items as checked/unchecked
- [ ] Reorder items

### List Metadata
- [ ] List name (auto-generated or custom)
- [ ] Creation date
- [ ] Associated recipes
- [ ] Created by user
- [ ] Last modified

### UI Components
- [ ] `RecipeSelector` - Multi-select recipe interface
- [ ] `GenerateListButton` - Primary action
- [ ] `GroceryListView` - Main list display
- [ ] `GroceryListItem` - Individual item row
- [ ] `AddManualItem` - Form to add custom items
- [ ] `ListMetadata` - Show associated recipes

## Acceptance Criteria

- [ ] Users can select multiple recipes
- [ ] Generate list button creates new grocery list
- [ ] Items already in pantry excluded
- [ ] Shared ingredients have combined quantities
- [ ] Can add items manually to list
- [ ] Can remove items from list
- [ ] Can edit quantities
- [ ] Shows which recipes need each ingredient
- [ ] List saves and persists
- [ ] Can create multiple lists
- [ ] Mobile responsive

## Technical Details

### Generation Algorithm

```typescript
interface GroceryListGenerationRequest {
  recipeIds: string[]
  servings?: Record<string, number> // recipe_id -> servings
  name?: string
}

async function generateGroceryList(
  req: GroceryListGenerationRequest,
  householdId: string,
  userId: string
): Promise<GroceryList> {
  // Fetch recipes and pantry
  const [recipes, pantry] = await Promise.all([
    db.recipe.findMany({
      where: {
        id: { in: req.recipeIds },
        household_id: householdId
      },
      include: {
        recipe_ingredients: {
          include: { ingredient: true }
        }
      }
    }),
    db.pantryItem.findMany({
      where: { household_id: householdId },
      include: { ingredient: true }
    })
  ])

  // Build map of needed ingredients
  const needed = new Map<string, {
    ingredient_id: string
    ingredient: Ingredient
    quantity: number
    unit: string
    recipe_sources: string[]
  }>()

  for (const recipe of recipes) {
    const servings = req.servings?.[recipe.id] || recipe.servings
    const scaleFactor = servings / recipe.servings

    for (const recipeIng of recipe.recipe_ingredients) {
      if (recipeIng.optional) continue

      const quantityNeeded = (recipeIng.quantity || 0) * scaleFactor

      // Check pantry
      const pantryItem = pantry.find(p =>
        p.ingredient_id === recipeIng.ingredient_id
      )

      const inPantry = pantryItem?.quantity || 0
      const stillNeeded = Math.max(0, quantityNeeded - inPantry)

      if (stillNeeded === 0 && inPantry > 0) {
        // Already have enough in pantry
        continue
      }

      // Add or update needed quantity
      if (needed.has(recipeIng.ingredient_id)) {
        const existing = needed.get(recipeIng.ingredient_id)!

        // Combine quantities (handle unit conversion if possible)
        if (existing.unit === recipeIng.unit) {
          existing.quantity += stillNeeded
        } else {
          // Different units - try to convert or keep both
          existing.quantity += stillNeeded
          existing.unit = `${existing.unit} + ${recipeIng.unit}`
        }

        existing.recipe_sources.push(recipe.id)
      } else {
        needed.set(recipeIng.ingredient_id, {
          ingredient_id: recipeIng.ingredient_id,
          ingredient: recipeIng.ingredient,
          quantity: stillNeeded > 0 ? stillNeeded : quantityNeeded,
          unit: recipeIng.unit || '',
          recipe_sources: [recipe.id]
        })
      }
    }
  }

  // Create grocery list
  const listName = req.name || `Shopping List - ${new Date().toLocaleDateString()}`

  const groceryList = await db.groceryList.create({
    data: {
      household_id: householdId,
      name: listName,
      created_by: userId,
      recipe_ids: req.recipeIds,
      items: {
        create: Array.from(needed.values()).map(item => ({
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          category: item.ingredient.category,
          checked: false,
          recipe_sources: item.recipe_sources
        }))
      }
    },
    include: {
      items: {
        include: { ingredient: true }
      }
    }
  })

  return groceryList
}
```

### API Implementation

```typescript
// POST /api/grocery-lists/generate
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, household_id: true }
  })

  if (!user?.household_id) {
    return Response.json({ error: "No household" }, { status: 400 })
  }

  const body = await req.json()
  const validated = groceryListGenerationSchema.parse(body)

  const groceryList = await generateGroceryList(
    validated,
    user.household_id,
    user.id
  )

  return Response.json(groceryList, { status: 201 })
}
```

### Validation Schema

```typescript
import { z } from "zod"

export const groceryListGenerationSchema = z.object({
  recipeIds: z.array(z.string().uuid()).min(1, "Select at least one recipe"),
  servings: z.record(z.string(), z.number().positive()).optional(),
  name: z.string().max(255).optional()
})

export const groceryListItemSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.number().positive(),
  unit: z.string(),
  checked: z.boolean().default(false)
})
```

### UI Component

```typescript
'use client'

export function RecipeSelector() {
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set())
  const [servings, setServings] = useState<Record<string, number>>({})
  const { data: recipes } = useQuery(['recipes'])

  const toggleRecipe = (recipeId: string, defaultServings: number) => {
    const newSelected = new Set(selectedRecipes)

    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId)
      const newServings = { ...servings }
      delete newServings[recipeId]
      setServings(newServings)
    } else {
      newSelected.add(recipeId)
      setServings({ ...servings, [recipeId]: defaultServings })
    }

    setSelectedRecipes(newSelected)
  }

  const generateList = async () => {
    try {
      const res = await fetch('/api/grocery-lists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeIds: Array.from(selectedRecipes),
          servings
        })
      })

      if (!res.ok) throw new Error('Failed to generate list')

      const list = await res.json()

      // Navigate to list view
      router.push(`/grocery-lists/${list.id}`)

      toast.success('Grocery list created!')
    } catch (error) {
      toast.error('Failed to generate list')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Select Recipes</h2>
        <div className="flex gap-2">
          <span className="text-sm text-gray-600">
            {selectedRecipes.size} selected
          </span>
          <Button
            onClick={generateList}
            disabled={selectedRecipes.size === 0}
          >
            Generate Shopping List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes?.map(recipe => (
          <div key={recipe.id} className="border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selectedRecipes.has(recipe.id)}
                onChange={() => toggleRecipe(recipe.id, recipe.servings)}
                className="mt-1"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{recipe.title}</h3>
                <p className="text-sm text-gray-600">
                  {recipe.prep_time_minutes + recipe.cook_time_minutes} min
                </p>

                {selectedRecipes.has(recipe.id) && (
                  <div className="mt-2">
                    <label className="text-sm">Servings:</label>
                    <input
                      type="number"
                      min="1"
                      value={servings[recipe.id] || recipe.servings}
                      onChange={(e) => setServings({
                        ...servings,
                        [recipe.id]: parseInt(e.target.value)
                      })}
                      className="ml-2 w-16 border rounded px-2 py-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Dependencies

- [ ] #05 Recipe CRUD
- [ ] #06 Pantry Management
- [ ] #08 Recipe Scaling
- Database schema for grocery_lists and grocery_list_items

## Testing

- [ ] Test list generation from single recipe
- [ ] Test list generation from multiple recipes
- [ ] Test pantry item exclusion
- [ ] Test quantity combining for shared ingredients
- [ ] Test with scaled recipes
- [ ] Test manual item addition
- [ ] Test item removal
- [ ] Test empty pantry (all items needed)
- [ ] Test full pantry (few items needed)
- [ ] E2E test: Select recipes → Generate → View list

## Resources

- PRD Section 3.4: Grocery List Generation (US-4.1)
- Implementation Plan: Section 3.1 Grocery List Generation
