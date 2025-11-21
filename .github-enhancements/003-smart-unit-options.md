# Enhancement: Smart Unit Options Based on Ingredient Type

## Status
🔴 Open

## Priority
Medium

## Description
Improve the user experience when selecting measurement units by displaying context-aware unit options based on the ingredient type. Show the most relevant units by default with an expand option to access all available units. This reduces scrolling and makes recipe entry faster and more intuitive.

## Current Implementation
Currently, all measurement units are likely shown in a single dropdown or list regardless of the ingredient being measured. Users must scroll through all options to find appropriate units (e.g., seeing "cups" when measuring eggs, or "items" when measuring flour).

## Required Changes

### 1. Ingredient Categorization

**Add unit category mapping:**
```typescript
enum IngredientCategory {
  LIQUID = 'liquid',
  DRY_GOODS = 'dry_goods',
  PRODUCE = 'produce',
  MEAT = 'meat',
  DAIRY = 'dairy',
  COUNT_BASED = 'count_based',
  SPICES = 'spices'
}

const categoryUnitMap = {
  [IngredientCategory.LIQUID]: ['cup', 'ml', 'l', 'fl oz', 'tbsp', 'tsp'],
  [IngredientCategory.DRY_GOODS]: ['cup', 'g', 'kg', 'oz', 'lb', 'tbsp', 'tsp'],
  [IngredientCategory.PRODUCE]: ['whole', 'cup', 'g', 'kg', 'oz', 'lb', 'bunch'],
  [IngredientCategory.MEAT]: ['lb', 'kg', 'g', 'oz', 'piece'],
  [IngredientCategory.DAIRY]: ['cup', 'ml', 'l', 'oz', 'g', 'tbsp', 'tsp'],
  [IngredientCategory.COUNT_BASED]: ['whole', 'piece', 'slice', 'clove'],
  [IngredientCategory.SPICES]: ['tsp', 'tbsp', 'g', 'oz', 'pinch']
};
```

### 2. Database Updates

**Option A: Add category to ingredients table:**
```sql
ALTER TABLE ingredients
ADD COLUMN category VARCHAR(50),
ADD COLUMN preferred_units JSONB;
```

**Option B: Maintain category mapping in application code:**
- Keep mapping in constants file
- Update as needed without migrations

### 3. UI Component Enhancement

**Smart Unit Selector Component:**
```tsx
interface SmartUnitSelectorProps {
  ingredient: Ingredient;
  selectedUnit: string;
  onChange: (unit: string) => void;
  showAll?: boolean;
}
```

**User Experience:**
1. Initially show 5-7 most relevant units based on ingredient
2. Display "Show all units" button/link
3. When expanded, show all available units organized by category
4. Remember user's preference if they consistently choose non-suggested units

**Visual Design:**
```
Suggested Units (based on ingredient type)
┌─────────────────────────────┐
│ ○ cup                       │
│ ○ tablespoon (tbsp)        │
│ ○ teaspoon (tsp)           │
│ ○ gram (g)                 │
│ ○ ounce (oz)               │
│                             │
│ [+ Show all units]          │
└─────────────────────────────┘

After expansion:
Suggested Units
┌─────────────────────────────┐
│ ○ cup                       │
│ ○ tablespoon (tbsp)        │
│ ...                         │
│                             │
│ Volume                      │
│ ○ milliliter (ml)          │
│ ○ liter (l)                │
│ ...                         │
│                             │
│ Weight                      │
│ ○ pound (lb)               │
│ ○ kilogram (kg)            │
│ ...                         │
│                             │
│ Other                       │
│ ○ whole                    │
│ ○ piece                    │
│                             │
│ [- Show fewer units]        │
└─────────────────────────────┘
```

### 4. Machine Learning Enhancement (Future)

Track which units users select for each ingredient:
```sql
CREATE TABLE ingredient_unit_usage (
  user_id UUID REFERENCES users(id),
  ingredient_id UUID REFERENCES ingredients(id),
  unit VARCHAR(50),
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, ingredient_id, unit)
);
```

Use this data to personalize suggested units per user over time.

### 5. Implementation Areas

**Recipe Entry/Edit:**
- Update ingredient input forms
- Apply smart units when adding ingredients

**Pantry Management:**
- Show relevant units when adding pantry items
- Consider typical storage units for ingredients

**Grocery Lists:**
- Smart unit selection when adding items
- Default to shopping-friendly units

## Benefits
- ✅ Faster recipe entry with fewer clicks
- ✅ Reduced cognitive load for users
- ✅ More intuitive and context-aware interface
- ✅ Better mobile experience (less scrolling)
- ✅ Encourages use of appropriate units
- ✅ Scalable to future machine learning personalization

## Risks
- ⚠️ Incorrect categorization may hide desired units
- ⚠️ Users may not discover the "Show all" option
- ⚠️ Added complexity in ingredient data management
- ⚠️ May need to recategorize ingredients over time
- ⚠️ Different regions prefer different units (metric vs imperial)

## Testing Checklist
After implementation, verify:
- [ ] Liquid ingredients show volume-appropriate units first
- [ ] Dry goods show weight and volume units
- [ ] Count-based ingredients (eggs, apples) show piece/whole units
- [ ] "Show all units" expands to complete list
- [ ] "Show fewer units" collapses back to suggested units
- [ ] All existing recipes still display correctly
- [ ] Unit selection works on mobile and desktop
- [ ] Keyboard navigation works properly
- [ ] Unit categories are organized logically in expanded view
- [ ] Edge cases handled (ingredient with no category, custom ingredients)
- [ ] Performance acceptable with large unit lists
- [ ] Accessibility maintained (screen readers, keyboard-only)

## References
- Current unit selection components
- Ingredient database schema
- Recipe input forms
- UX best practices for progressive disclosure

## Notes
- Consider regional preferences (metric vs imperial) as a user setting
- May want to allow users to customize their preferred units
- Could add tooltips showing unit conversions
- Consider adding quick conversion calculator in expanded view
- Integration with custom ingredients (#002) should inherit smart defaults
- Start with conservative categorization and refine based on user feedback
