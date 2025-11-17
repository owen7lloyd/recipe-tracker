# Ingredient Substitution System

**Phase:** 2 - Core Features
**Priority:** P0
**Estimate:** 4 days

## Description

Implement ingredient substitution system to enable recipe matching with common ingredient substitutes (e.g., butter ↔ oil, milk types, etc.).

## Tasks

### Database Schema
- [ ] Create `ingredient_substitutions` table
- [ ] Add foreign keys to ingredients
- [ ] Add ratio column for quantity adjustments
- [ ] Add notes column for context
- [ ] Create indexes for lookups

### Seed Substitution Data
- [ ] Butter ↔ Oil (1:1 ratio)
- [ ] Milk types (whole ↔ 2% ↔ skim ↔ oat ↔ almond)
- [ ] Sugar types (white ↔ brown ↔ honey with ratios)
- [ ] Flour types (all-purpose ↔ bread ↔ whole wheat)
- [ ] Egg substitutes for baking
- [ ] Fresh ↔ dried herbs (1:3 ratio)
- [ ] Common oil substitutions
- [ ] 30+ substitution rules total

### Substitution Logic
- [ ] Bidirectional substitution support
- [ ] Apply ratio when calculating quantities
- [ ] Transitive substitutions (A→B, B→C means A→C possible)
- [ ] Query substitutes for an ingredient
- [ ] Check if two ingredients are substitutable

### API Endpoints
- [ ] `GET /api/ingredients/:id/substitutes`
- [ ] `GET /api/substitutions` (admin - list all)
- [ ] `POST /api/substitutions` (admin - add new)
- [ ] `DELETE /api/substitutions/:id` (admin - remove)

### Integration with Recipe Matching
- [ ] Update recipe matching algorithm to consider substitutes
- [ ] When ingredient not in pantry, check substitutes
- [ ] Apply ratio adjustment when using substitute
- [ ] Show which substitute was used in UI

### UI Components (Optional for MVP)
- [ ] `SubstitutionManager` (admin page)
- [ ] Add substitution form
- [ ] List existing substitutions
- [ ] Display substitutes in recipe detail
- [ ] Show when recipe uses a substitute

## Acceptance Criteria

- [ ] Substitution data seeded in database
- [ ] Can query substitutes for any ingredient
- [ ] Bidirectional substitutions work (A→B and B→A)
- [ ] Ratios applied correctly
- [ ] Recipe matching considers substitutions
- [ ] Transitive substitutions work (optional for MVP)
- [ ] At least 30 common substitutions defined

## Technical Details

### Database Schema

```sql
CREATE TABLE ingredient_substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  substitute_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ratio DECIMAL(5, 2) DEFAULT 1.0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ingredient_id, substitute_id)
);

CREATE INDEX idx_substitutions_ingredient ON ingredient_substitutions(ingredient_id);
CREATE INDEX idx_substitutions_substitute ON ingredient_substitutions(substitute_id);
```

### Seed Data

```typescript
const substitutions = [
  // Fats
  { from: 'Butter', to: 'Vegetable Oil', ratio: 1.0, notes: 'For cooking and baking' },
  { from: 'Butter', to: 'Coconut Oil', ratio: 1.0, notes: 'For baking' },
  { from: 'Olive Oil', to: 'Vegetable Oil', ratio: 1.0 },

  // Milk
  { from: 'Whole Milk', to: '2% Milk', ratio: 1.0 },
  { from: 'Whole Milk', to: 'Skim Milk', ratio: 1.0 },
  { from: 'Whole Milk', to: 'Oat Milk', ratio: 1.0 },
  { from: 'Whole Milk', to: 'Almond Milk', ratio: 1.0 },
  { from: '2% Milk', to: 'Skim Milk', ratio: 1.0 },

  // Sugar
  { from: 'White Sugar', to: 'Brown Sugar', ratio: 1.0 },
  { from: 'White Sugar', to: 'Honey', ratio: 0.75, notes: 'Reduce liquid in recipe' },
  { from: 'Brown Sugar', to: 'Honey', ratio: 0.75 },

  // Flour
  { from: 'All-Purpose Flour', to: 'Bread Flour', ratio: 1.0 },
  { from: 'All-Purpose Flour', to: 'Whole Wheat Flour', ratio: 0.9, notes: 'May affect texture' },

  // Herbs
  { from: 'Fresh Basil', to: 'Dried Basil', ratio: 0.33, notes: 'Fresh to dried ratio' },
  { from: 'Fresh Parsley', to: 'Dried Parsley', ratio: 0.33 },
  { from: 'Fresh Oregano', to: 'Dried Oregano', ratio: 0.33 },

  // Eggs
  { from: 'Egg', to: 'Flax Egg', ratio: 1.0, notes: '1 tbsp flax + 3 tbsp water per egg' },
  { from: 'Egg', to: 'Applesauce', ratio: 4.0, notes: '¼ cup per egg, for baking' },

  // More substitutions...
]
```

### Substitution Service

```typescript
class SubstitutionService {
  // Get all substitutes for an ingredient (including reverse)
  async getSubstitutes(ingredientId: string): Promise<Substitution[]> {
    const forward = await db.ingredientSubstitution.findMany({
      where: { ingredient_id: ingredientId },
      include: { substitute: true }
    })

    const reverse = await db.ingredientSubstitution.findMany({
      where: { substitute_id: ingredientId },
      include: { ingredient: true }
    })

    return [
      ...forward.map(s => ({
        id: s.id,
        ingredient_id: ingredientId,
        substitute: s.substitute,
        ratio: s.ratio,
        notes: s.notes
      })),
      ...reverse.map(s => ({
        id: s.id,
        ingredient_id: ingredientId,
        substitute: s.ingredient,
        ratio: 1 / s.ratio, // Inverse ratio
        notes: s.notes
      }))
    ]
  }

  // Check if two ingredients are substitutable
  async areSubstitutable(
    ingredientId1: string,
    ingredientId2: string
  ): Promise<{ substitutable: boolean; ratio?: number }> {
    const sub = await db.ingredientSubstitution.findFirst({
      where: {
        OR: [
          { ingredient_id: ingredientId1, substitute_id: ingredientId2 },
          { ingredient_id: ingredientId2, substitute_id: ingredientId1 }
        ]
      }
    })

    if (!sub) return { substitutable: false }

    const ratio = sub.ingredient_id === ingredientId1
      ? sub.ratio
      : 1 / sub.ratio

    return { substitutable: true, ratio }
  }

  // Find transitive substitutions (A→B→C)
  async getTransitiveSubstitutes(
    ingredientId: string,
    maxDepth: number = 2
  ): Promise<Substitution[]> {
    // Implement graph traversal for transitive substitutions
    // This is more complex and optional for MVP
    const visited = new Set<string>()
    const results: Substitution[] = []

    async function traverse(currentId: string, depth: number, ratio: number) {
      if (depth >= maxDepth || visited.has(currentId)) return

      visited.add(currentId)
      const directSubs = await this.getSubstitutes(currentId)

      for (const sub of directSubs) {
        const newRatio = ratio * sub.ratio
        results.push({ ...sub, ratio: newRatio })
        await traverse(sub.substitute.id, depth + 1, newRatio)
      }
    }

    await traverse(ingredientId, 0, 1)
    return results
  }
}
```

### Integration with Recipe Matching

```typescript
async function isRecipeCookable(
  recipe: Recipe,
  pantry: PantryItem[]
): Promise<{ cookable: boolean; substitutions: Map<string, string> }> {
  const substitutionService = new SubstitutionService()
  const substitutionsUsed = new Map<string, string>()

  for (const recipeIngredient of recipe.ingredients) {
    if (recipeIngredient.optional) continue

    // Check exact match
    const hasIngredient = pantry.some(item =>
      item.ingredient_id === recipeIngredient.ingredient_id &&
      (!item.quantity || item.quantity >= recipeIngredient.quantity)
    )

    if (hasIngredient) continue

    // Check substitutes
    const substitutes = await substitutionService.getSubstitutes(
      recipeIngredient.ingredient_id
    )

    let foundSubstitute = false

    for (const sub of substitutes) {
      const pantryItem = pantry.find(p => p.ingredient_id === sub.substitute.id)

      if (pantryItem) {
        const requiredQuantity = recipeIngredient.quantity * sub.ratio

        if (!pantryItem.quantity || pantryItem.quantity >= requiredQuantity) {
          substitutionsUsed.set(
            recipeIngredient.ingredient_id,
            sub.substitute.id
          )
          foundSubstitute = true
          break
        }
      }
    }

    if (!foundSubstitute) {
      return { cookable: false, substitutions: new Map() }
    }
  }

  return { cookable: true, substitutions: substitutionsUsed }
}
```

## Dependencies

- [ ] #02 Database Schema
- [ ] #06 Pantry Management
- Ingredients table populated

## Testing

- [ ] Test bidirectional substitutions
- [ ] Test ratio application
- [ ] Test recipe matching with substitutions
- [ ] Test multiple substitution paths
- [ ] Test substitution queries
- [ ] Test transitive substitutions (if implemented)
- [ ] Verify all seeded substitutions are accurate

## Resources

- PRD Section 4.3: Substitution Rules
- Implementation Plan: Section 2.3 Ingredient Substitution System
