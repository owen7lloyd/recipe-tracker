# Enhancement: Smart Unit Options Based on Ingredient Type

## Status

🟡 In Progress (Partially Implemented)

## Priority

Medium

## Description

Improve the user experience when selecting measurement units by displaying context-aware unit options based on the ingredient type. Show the most relevant units by default with an expand option to access all available units. This reduces scrolling and makes recipe entry faster and more intuitive.

## Implementation Status

### ✅ Completed

1. **Category-to-Unit Mapping** (`/src/lib/constants/units.ts`)
   - Added `CATEGORY_UNIT_MAP` with intelligent suggestions per ingredient category
   - Created `getSuggestedUnits()` function to get category-specific units
   - Created `getOrganizedUnits()` function to group units by type
   - Added category property to all COOKING_UNITS (volume, weight, count, packaging, other)

2. **SmartUnitSelector Component** (`/src/components/ui/smart-unit-selector.tsx`)
   - Created component with horizontal layout (dropdown + toggle button)
   - Toggle button switches between suggested and all units
   - Filters out duplicate units between suggested and categorized sections
   - Auto-expands if selected unit isn't in suggested list

3. **Integration Areas**
   - ✅ Recipe ingredient input (`/src/components/recipes/ingredient-input.tsx`)
   - ✅ Pantry add form (`/src/components/pantry/add-pantry-item-form.tsx`)
   - ✅ Grocery list manual add (`/src/components/grocery-lists/add-manual-item.tsx`)
   - ✅ Grocery list item editing (`/src/components/grocery-lists/grocery-list-item.tsx`)

4. **Grid Layout Adjustments**
   - Recipe input: Adjusted column spans to accommodate toggle button
   - Grocery list editor: Changed to grid-cols-12 layout
   - Pantry form: Changed to grid-cols-5 for better proportions

### ❌ Known Issues

#### 1. Toggle Button Visibility

- **Grocery List**: ✅ Button visible and working
- **Pantry View**: ❌ Button overflows container and is covered by 'Your Pantry' panel
- **Recipe View**: ❌ Button covered by notes field

**Root Cause**: Grid layout proportions still need adjustment in some views to properly accommodate the toggle button width.

#### 2. Confusing Toggle Button Behavior

The current toggle button design is counterintuitive:

- When button shows "Suggested", dropdown actually shows **all units** (opposite of what you'd expect)
- When button shows "All Units", dropdown actually shows **suggested units only** (opposite of what you'd expect)
- Button text represents what you'll switch TO, not what's currently shown

**Expected Behavior**: Button should show the current state, not the next action.

#### 3. Disabled State Handling

When a non-suggested unit is selected:

- The dropdown auto-expands to show all units (correct)
- The toggle button does nothing when clicked (confusing)
- **Issue**: Button should be disabled in this state to indicate it's locked to "all units" view

### 🔧 Remaining Work

#### High Priority Fixes

1. **Fix Toggle Button Visibility**
   - Adjust grid layouts in recipe and pantry views
   - Ensure button has sufficient space in all containers
   - Test on mobile and desktop breakpoints

2. **Redesign Toggle Button Logic**
   - Reverse the button text to show current state, not next action
   - Options:
     - Show "Suggested ✓" when in suggested mode, "All Units ✓" when showing all
     - Or use a different UI pattern (radio buttons, tabs, etc.)

3. **Add Disabled State**
   - Disable toggle button when non-suggested unit is selected
   - Add visual indicator (opacity, cursor, tooltip) explaining why it's disabled
   - Only allow toggling when no unit is selected or a suggested unit is selected

#### Medium Priority Improvements

4. **Better Visual Design**
   - Consider using tabs instead of toggle button
   - Add visual indicators for current mode
   - Improve accessibility with aria-labels

5. **Unit Categorization Refinement**
   - Review category-to-unit mappings based on real usage
   - Consider adding more categories or refining existing ones

## Original Implementation Spec

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
  SPICES = 'spices',
}

const categoryUnitMap = {
  [IngredientCategory.LIQUID]: ['cup', 'ml', 'l', 'fl oz', 'tbsp', 'tsp'],
  [IngredientCategory.DRY_GOODS]: ['cup', 'g', 'kg', 'oz', 'lb', 'tbsp', 'tsp'],
  [IngredientCategory.PRODUCE]: [
    'whole',
    'cup',
    'g',
    'kg',
    'oz',
    'lb',
    'bunch',
  ],
  [IngredientCategory.MEAT]: ['lb', 'kg', 'g', 'oz', 'piece'],
  [IngredientCategory.DAIRY]: ['cup', 'ml', 'l', 'oz', 'g', 'tbsp', 'tsp'],
  [IngredientCategory.COUNT_BASED]: ['whole', 'piece', 'slice', 'clove'],
  [IngredientCategory.SPICES]: ['tsp', 'tbsp', 'g', 'oz', 'pinch'],
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
