# Pantry Management System

**Phase:** 1 - Foundation
**Priority:** P0
**Estimate:** 5 days

## Description

Implement complete pantry inventory management with ingredient autocomplete, quick add functionality, and bulk operations.

## Tasks

### API Endpoints
- [ ] `GET /api/pantry` - List all pantry items for household
- [ ] `POST /api/pantry/items` - Add item to pantry
- [ ] `PUT /api/pantry/items/:id` - Update pantry item
- [ ] `DELETE /api/pantry/items/:id` - Remove from pantry
- [ ] `POST /api/pantry/bulk-update` - Bulk add/update/delete
- [ ] `GET /api/ingredients/search?q=query` - Search ingredients

### Ingredient Reference System
- [ ] Seed ingredients database with 200+ common items
- [ ] Categorize ingredients (produce, dairy, meat, pantry, etc.)
- [ ] Support common units per ingredient
- [ ] Fuzzy search implementation
- [ ] Auto-suggest as user types

### Pantry Operations
- [ ] Add single item with optional quantity
- [ ] Quick add without quantity (assumed available)
- [ ] Update quantity
- [ ] Remove item
- [ ] Bulk add from list
- [ ] Bulk delete selected items

### UI Components
- [ ] `PantryList` - Main pantry view
- [ ] `PantryItemRow` - Single item with quantity, unit, edit/delete
- [ ] `AddPantryItemForm` - Quick add form
- [ ] `IngredientAutocomplete` - Searchable ingredient selector
- [ ] `BulkEditModal` - Bulk operations dialog
- [ ] `PantryFilters` - Filter by category
- [ ] `PantryStats` - Optional: Show count by category

### Autocomplete Features
- [ ] Fuzzy matching (typo tolerance)
- [ ] Show ingredient category in results
- [ ] Show common units for selected ingredient
- [ ] Recently used ingredients prioritized
- [ ] Create new ingredient if not found (optional)

### Business Logic
- [ ] Prevent duplicate ingredients in pantry
- [ ] If item exists, update quantity instead of adding duplicate
- [ ] Items without quantity marked as "available"
- [ ] Track who added each item
- [ ] Track last updated timestamp

## Acceptance Criteria

- [ ] Users can add items to pantry
- [ ] Autocomplete shows relevant ingredients
- [ ] Can add items with or without quantity
- [ ] Can update quantities
- [ ] Can remove items from pantry
- [ ] Can select multiple items for bulk delete
- [ ] No duplicate ingredients allowed
- [ ] Filter by category works
- [ ] Search pantry items works
- [ ] Mobile responsive
- [ ] Fast autocomplete (< 200ms)

## Technical Details

### Ingredients Seed Data

```typescript
const commonIngredients = [
  // Produce
  { name: 'Tomato', category: 'produce', common_units: ['piece', 'lb', 'cup'] },
  { name: 'Onion', category: 'produce', common_units: ['piece', 'cup'] },
  { name: 'Garlic', category: 'produce', common_units: ['clove', 'tbsp'] },
  { name: 'Potato', category: 'produce', common_units: ['piece', 'lb', 'cup'] },

  // Dairy
  { name: 'Milk', category: 'dairy', common_units: ['cup', 'oz', 'liter'] },
  { name: 'Butter', category: 'dairy', common_units: ['tbsp', 'cup', 'stick'] },
  { name: 'Eggs', category: 'dairy', common_units: ['piece', 'dozen'] },

  // Pantry
  { name: 'Flour', category: 'pantry', common_units: ['cup', 'oz', 'lb'] },
  { name: 'Sugar', category: 'pantry', common_units: ['cup', 'oz', 'tbsp'] },
  { name: 'Salt', category: 'pantry', common_units: ['tsp', 'tbsp', 'oz'] },

  // ... 190+ more items
]
```

### Autocomplete Implementation

```typescript
// GET /api/ingredients/search?q=tom
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q') || ''

  if (query.length < 2) {
    return Response.json([])
  }

  // Fuzzy search using trigram similarity (PostgreSQL)
  const ingredients = await db.$queryRaw`
    SELECT id, name, category, common_units
    FROM ingredients
    WHERE LOWER(name) LIKE LOWER(${`%${query}%`})
    ORDER BY similarity(name, ${query}) DESC
    LIMIT 10
  `

  return Response.json(ingredients)
}
```

### Bulk Update Implementation

```typescript
// POST /api/pantry/bulk-update
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { add, update, delete: toDelete } = await req.json()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  // Use transaction for atomicity
  await db.$transaction(async (tx) => {
    // Add new items
    if (add?.length) {
      await tx.pantryItem.createMany({
        data: add.map(item => ({
          household_id: user.household_id,
          ingredient_id: item.ingredient_id,
          quantity: item.quantity,
          unit: item.unit,
          added_by: session.user.id
        }))
      })
    }

    // Update existing
    if (update?.length) {
      for (const item of update) {
        await tx.pantryItem.update({
          where: { id: item.id },
          data: { quantity: item.quantity, unit: item.unit }
        })
      }
    }

    // Delete items
    if (toDelete?.length) {
      await tx.pantryItem.deleteMany({
        where: { id: { in: toDelete } }
      })
    }
  })

  return Response.json({ success: true })
}
```

### Validation Schema

```typescript
export const pantryItemSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
})

export const bulkUpdateSchema = z.object({
  add: z.array(pantryItemSchema).optional(),
  update: z.array(pantryItemSchema.extend({ id: z.string().uuid() })).optional(),
  delete: z.array(z.string().uuid()).optional(),
})
```

## Dependencies

- [ ] #02 Database Schema (pantry_items, ingredients tables)
- [ ] #03 Authentication System
- [ ] #04 Household Management
- Ingredients seed data prepared

## Testing

- [ ] Test adding items to pantry
- [ ] Test autocomplete with various queries
- [ ] Test duplicate prevention
- [ ] Test bulk operations
- [ ] Test quantity updates
- [ ] Test item deletion
- [ ] Test household isolation
- [ ] Test fuzzy search accuracy
- [ ] Performance test autocomplete speed

## Resources

- PRD Section 3.3: Pantry Management
- Implementation Plan: Section 1.5 Simple Pantry Management
