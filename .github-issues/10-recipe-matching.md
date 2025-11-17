# Recipe Matching ("What Can I Cook?")

**Phase:** 2 - Core Features
**Priority:** P0
**Estimate:** 5 days

## Description

Implement the "What Can I Cook?" feature that matches recipes with current pantry inventory, considering ingredient substitutions and quantities.

## Tasks

### Matching Algorithm
- [ ] Implement recipe-pantry matching logic
- [ ] Check all required ingredients available
- [ ] Respect quantity requirements
- [ ] Consider substitutions
- [ ] Handle optional ingredients
- [ ] Calculate match percentage for near-matches

### API Endpoint
- [ ] `GET /api/recipes/available`
- [ ] Return fully cookable recipes
- [ ] Optionally return near-matches
- [ ] Include substitutions used
- [ ] Sort by match percentage

### Query Optimization
- [ ] Efficient database queries
- [ ] Index optimization for performance
- [ ] Cache pantry state
- [ ] Batch process recipes

### Near-Match Feature (Optional)
- [ ] Show recipes missing 1-2 ingredients
- [ ] Display which ingredients are missing
- [ ] Sort by number of missing items
- [ ] Quick add missing items to grocery list

### UI Components
- [ ] `AvailableRecipes` page
- [ ] `CookableRecipeCard` - with availability badge
- [ ] `AvailabilityBadge` - green/yellow/red indicator
- [ ] `SubstitutionNote` - shows when substitute used
- [ ] `MissingIngredients` - list of what's needed
- [ ] Filter and sort controls

### Visual Indicators
- [ ] Green badge: Fully cookable
- [ ] Yellow badge: Cookable with substitutions
- [ ] Red badge: Missing ingredients (near-match)
- [ ] Show which substitutions will be used
- [ ] Highlight missing ingredients

### Filters and Sorting
- [ ] Filter: Fully cookable only
- [ ] Filter: Include near-matches
- [ ] Sort: Best match first
- [ ] Sort: Newest recipes
- [ ] Sort: Highest rated
- [ ] Sort: Quickest prep time

## Acceptance Criteria

- [ ] "What Can I Cook?" page shows all cookable recipes
- [ ] Only shows recipes with ALL ingredients available
- [ ] Respects quantity requirements
- [ ] Considers substitutions in matching
- [ ] Shows which substitutes will be used
- [ ] Fast performance (< 2 seconds)
- [ ] Near-matches shown separately (if implemented)
- [ ] Can filter by category while viewing cookable
- [ ] Updates when pantry changes
- [ ] Mobile responsive

## Technical Details

### Matching Algorithm

```typescript
interface RecipeMatch {
  recipe: Recipe
  cookable: boolean
  matchPercentage: number
  substitutions: Array<{
    original: Ingredient
    substitute: Ingredient
    ratio: number
  }>
  missingIngredients: Array<{
    ingredient: Ingredient
    quantity: number
    unit: string
  }>
}

async function findCookableRecipes(
  householdId: string
): Promise<RecipeMatch[]> {
  // Get all household recipes and pantry
  const [recipes, pantry] = await Promise.all([
    db.recipe.findMany({
      where: { household_id: householdId },
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

  const substitutionService = new SubstitutionService()
  const matches: RecipeMatch[] = []

  for (const recipe of recipes) {
    const match = await checkRecipeMatch(recipe, pantry, substitutionService)
    matches.push(match)
  }

  // Filter and sort
  return matches
    .filter(m => m.cookable)
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
}

async function checkRecipeMatch(
  recipe: Recipe,
  pantry: PantryItem[],
  substitutionService: SubstitutionService
): Promise<RecipeMatch> {
  const requiredIngredients = recipe.recipe_ingredients.filter(i => !i.optional)
  const substitutions = []
  const missingIngredients = []
  let matchedCount = 0

  for (const recipeIng of requiredIngredients) {
    // Check exact match
    const exactMatch = pantry.find(p =>
      p.ingredient_id === recipeIng.ingredient_id &&
      (!p.quantity || !recipeIng.quantity || p.quantity >= recipeIng.quantity)
    )

    if (exactMatch) {
      matchedCount++
      continue
    }

    // Check substitutions
    const substitutes = await substitutionService.getSubstitutes(
      recipeIng.ingredient_id
    )

    let foundSubstitute = false

    for (const sub of substitutes) {
      const pantryItem = pantry.find(p => p.ingredient_id === sub.substitute.id)

      if (pantryItem) {
        const requiredQty = (recipeIng.quantity || 0) * sub.ratio

        if (!pantryItem.quantity || pantryItem.quantity >= requiredQty) {
          substitutions.push({
            original: recipeIng.ingredient,
            substitute: sub.substitute,
            ratio: sub.ratio
          })
          matchedCount++
          foundSubstitute = true
          break
        }
      }
    }

    if (!foundSubstitute) {
      missingIngredients.push({
        ingredient: recipeIng.ingredient,
        quantity: recipeIng.quantity || 0,
        unit: recipeIng.unit || ''
      })
    }
  }

  const matchPercentage = (matchedCount / requiredIngredients.length) * 100
  const cookable = missingIngredients.length === 0

  return {
    recipe,
    cookable,
    matchPercentage,
    substitutions,
    missingIngredients
  }
}
```

### API Implementation

```typescript
// GET /api/recipes/available
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const includeNearMatches = searchParams.get('near_matches') === 'true'
  const minMatch = parseInt(searchParams.get('min_match') || '100')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  if (!user?.household_id) {
    return Response.json({ error: "No household" }, { status: 400 })
  }

  const matches = await findCookableRecipes(user.household_id)

  // Filter based on parameters
  const filtered = matches.filter(m =>
    m.matchPercentage >= minMatch
  )

  return Response.json({
    cookable: filtered.filter(m => m.cookable),
    nearMatches: includeNearMatches
      ? filtered.filter(m => !m.cookable)
      : []
  })
}
```

### UI Component

```typescript
'use client'

export function AvailableRecipes() {
  const { data, isLoading } = useQuery({
    queryKey: ['available-recipes'],
    queryFn: async () => {
      const res = await fetch('/api/recipes/available?near_matches=true')
      return res.json()
    }
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">
          What Can I Cook? ({data.cookable.length} recipes)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.cookable.map(match => (
            <RecipeCard
              key={match.recipe.id}
              recipe={match.recipe}
              badge={
                match.substitutions.length > 0
                  ? { color: 'yellow', text: 'With substitutes' }
                  : { color: 'green', text: 'Ready to cook' }
              }
              substitutions={match.substitutions}
            />
          ))}
        </div>
      </section>

      {data.nearMatches.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Almost There ({data.nearMatches.length} recipes)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.nearMatches.map(match => (
              <RecipeCard
                key={match.recipe.id}
                recipe={match.recipe}
                badge={{
                  color: 'red',
                  text: `Missing ${match.missingIngredients.length} items`
                }}
                missingIngredients={match.missingIngredients}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
```

## Dependencies

- [ ] #05 Recipe CRUD
- [ ] #06 Pantry Management
- [ ] #09 Ingredient Substitutions
- Recipe and pantry data available

## Testing

- [ ] Test with empty pantry (no matches)
- [ ] Test with full pantry (many matches)
- [ ] Test with substitutions
- [ ] Test quantity checking
- [ ] Test optional ingredients (should not block)
- [ ] Test near-matches
- [ ] Performance test with 100+ recipes
- [ ] Test real-time updates when pantry changes
- [ ] E2E test: Add pantry → Check cookable → Cook recipe

## Resources

- PRD Section 3.3: Pantry Management (US-3.2)
- Implementation Plan: Section 2.4 Recipe Matching
