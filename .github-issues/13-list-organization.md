# Grocery List Organization

**Phase:** 3 - Grocery Lists
**Priority:** P0
**Estimate:** 4 days

## Description

Implement grocery list organization by store category, with customizable category ordering, check/uncheck functionality, and mobile-optimized shopping interface.

## Tasks

### Category System
- [ ] Define standard grocery store categories
- [ ] Auto-categorize items based on ingredient category
- [ ] Allow category customization per household
- [ ] Support custom category ordering

### Store Categories (from PRD)
1. Produce
2. Bakery
3. Dairy & Eggs
4. Meat & Seafood
5. Frozen Foods
6. Pantry/Dry Goods
7. Beverages
8. Snacks
9. Condiments & Sauces
10. Baking Supplies

### List Display
- [ ] Group items by category
- [ ] Show category headers
- [ ] Collapsible category sections
- [ ] Item count per category
- [ ] Show/hide checked items

### Check/Uncheck Functionality
- [ ] Tap/click to check items
- [ ] Visual strikethrough for checked items
- [ ] Track who checked each item
- [ ] Timestamp when checked
- [ ] Persist check state

### Category Management
- [ ] Drag-and-drop category reordering
- [ ] Save custom order per household
- [ ] Reset to default order
- [ ] Hide empty categories

### Mobile Optimizations
- [ ] Large touch targets (44x44pts minimum)
- [ ] Swipe gestures for checking items
- [ ] Bottom sheet for item details
- [ ] Sticky category headers while scrolling
- [ ] Offline support

### UI Components
- [ ] `GroceryListView` - Main organized list
- [ ] `CategorySection` - Collapsible category group
- [ ] `GroceryListItem` - Checkable item row
- [ ] `CategoryReorder` - Drag-and-drop interface
- [ ] `FilterControls` - Show/hide checked items

## Acceptance Criteria

- [ ] Items grouped by category
- [ ] Categories ordered logically (or custom order)
- [ ] Can check/uncheck items
- [ ] Checked items visually distinct
- [ ] Can show/hide checked items
- [ ] Can collapse/expand categories
- [ ] Category order customizable
- [ ] Touch-friendly on mobile
- [ ] Fast performance with 50+ items
- [ ] Works offline

## Technical Details

### Database Schema

```sql
-- Add to grocery_list_items table
ALTER TABLE grocery_list_items ADD COLUMN category VARCHAR(50);
ALTER TABLE grocery_list_items ADD COLUMN checked_by UUID REFERENCES users(id);
ALTER TABLE grocery_list_items ADD COLUMN checked_at TIMESTAMP;

-- Category ordering per household
CREATE TABLE household_category_order (
  household_id UUID PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  category_order JSONB NOT NULL DEFAULT '["produce", "bakery", "dairy", "meat", "frozen", "pantry", "beverages", "snacks", "condiments", "baking"]'
);
```

### Default Category Order

```typescript
export const DEFAULT_CATEGORIES = [
  { id: 'produce', name: 'Produce', icon: '🥬' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊' },
  { id: 'pantry', name: 'Pantry/Dry Goods', icon: '🥫' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
  { id: 'condiments', name: 'Condiments & Sauces', icon: '🍯' },
  { id: 'baking', name: 'Baking Supplies', icon: '🧁' },
  { id: 'other', name: 'Other', icon: '🛒' }
] as const
```

### Organized List Component

```typescript
'use client'

interface OrganizedGroceryListProps {
  listId: string
}

export function OrganizedGroceryList({ listId }: OrganizedGroceryListProps) {
  const { data: list } = useQuery({
    queryKey: ['grocery-list', listId],
    queryFn: async () => {
      const res = await fetch(`/api/grocery-lists/${listId}`)
      return res.json()
    }
  })

  const { data: categoryOrder } = useQuery({
    queryKey: ['category-order'],
    queryFn: async () => {
      const res = await fetch('/api/household/category-order')
      return res.json()
    }
  })

  const [showChecked, setShowChecked] = useState(true)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const handleCheck = async (itemId: string, checked: boolean) => {
    // Optimistic update
    queryClient.setQueryData(['grocery-list', listId], (old: any) => ({
      ...old,
      items: old.items.map(item =>
        item.id === itemId ? { ...item, checked, checked_at: new Date() } : item
      )
    }))

    // Update server
    await fetch(`/api/grocery-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checked })
    })

    // Revalidate
    queryClient.invalidateQueries(['grocery-list', listId])
  }

  // Group items by category
  const itemsByCategory = useMemo(() => {
    if (!list?.items) return new Map()

    const groups = new Map<string, typeof list.items>()

    for (const item of list.items) {
      if (!showChecked && item.checked) continue

      const category = item.category || 'other'

      if (!groups.has(category)) {
        groups.set(category, [])
      }

      groups.get(category)!.push(item)
    }

    return groups
  }, [list?.items, showChecked])

  // Sort categories by custom order
  const orderedCategories = useMemo(() => {
    const order = categoryOrder?.order || DEFAULT_CATEGORIES.map(c => c.id)

    return order.filter(catId => itemsByCategory.has(catId))
  }, [categoryOrder, itemsByCategory])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{list?.name}</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showChecked}
            onChange={(e) => setShowChecked(e.target.checked)}
          />
          <span className="text-sm">Show checked items</span>
        </label>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {orderedCategories.map(categoryId => {
          const category = DEFAULT_CATEGORIES.find(c => c.id === categoryId)
          const items = itemsByCategory.get(categoryId) || []
          const isCollapsed = collapsedCategories.has(categoryId)

          return (
            <CategorySection
              key={categoryId}
              category={category}
              items={items}
              collapsed={isCollapsed}
              onToggleCollapse={() => {
                const newCollapsed = new Set(collapsedCategories)
                if (isCollapsed) {
                  newCollapsed.delete(categoryId)
                } else {
                  newCollapsed.add(categoryId)
                }
                setCollapsedCategories(newCollapsed)
              }}
              onCheckItem={handleCheck}
            />
          )
        })}
      </div>
    </div>
  )
}
```

### Category Section Component

```typescript
interface CategorySectionProps {
  category: { id: string; name: string; icon: string }
  items: GroceryListItem[]
  collapsed: boolean
  onToggleCollapse: () => void
  onCheckItem: (itemId: string, checked: boolean) => void
}

export function CategorySection({
  category,
  items,
  collapsed,
  onToggleCollapse,
  onCheckItem
}: CategorySectionProps) {
  const checkedCount = items.filter(i => i.checked).length

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggleCollapse}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <span className="font-semibold">{category.name}</span>
          <span className="text-sm text-gray-500">
            ({checkedCount}/{items.length})
          </span>
        </div>
        <ChevronIcon className={collapsed ? '' : 'rotate-180'} />
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="divide-y">
          {items.map(item => (
            <GroceryListItemRow
              key={item.id}
              item={item}
              onCheck={(checked) => onCheckItem(item.id, checked)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Item Row Component

```typescript
interface GroceryListItemRowProps {
  item: GroceryListItem
  onCheck: (checked: boolean) => void
}

export function GroceryListItemRow({ item, onCheck }: GroceryListItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
      <input
        type="checkbox"
        checked={item.checked}
        onChange={(e) => onCheck(e.target.checked)}
        className="w-5 h-5"
      />

      <div className="flex-1">
        <p className={cn(
          "font-medium",
          item.checked && "line-through text-gray-500"
        )}>
          {item.ingredient.name}
        </p>
        <p className="text-sm text-gray-600">
          {item.quantity} {item.unit}
        </p>
      </div>

      {item.recipe_sources && (
        <div className="text-xs text-gray-500">
          {item.recipe_sources.length} recipe{item.recipe_sources.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
```

### Category Reorder API

```typescript
// PUT /api/household/category-order
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { order } = await req.json()

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  await db.householdCategoryOrder.upsert({
    where: { household_id: user.household_id },
    create: {
      household_id: user.household_id,
      category_order: order
    },
    update: {
      category_order: order
    }
  })

  return Response.json({ success: true })
}
```

## Dependencies

- [ ] #12 Grocery List Generation
- Grocery list CRUD endpoints implemented

## Testing

- [ ] Test category grouping
- [ ] Test checking/unchecking items
- [ ] Test show/hide checked items
- [ ] Test category collapse/expand
- [ ] Test custom category ordering
- [ ] Test with empty categories
- [ ] Test performance with 100+ items
- [ ] Test on mobile devices
- [ ] Test offline functionality

## Resources

- PRD Section 3.4: Grocery List Generation (US-4.2)
- PRD Appendix C: Grocery Store Categories
- Implementation Plan: Section 3.2 List Organization
