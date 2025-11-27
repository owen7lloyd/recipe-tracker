# Bug: Missing Unit Conversion When Deducting Recipe Ingredients from Pantry

**Status:** 🔴 Open
**Priority:** High
**Component:** Recipe Cooking / Pantry Management
**Severity:** Critical - Data Integrity Issue

**Affected Files:**
- `src/app/api/recipes/[id]/cook/route.ts`
- `src/lib/constants/units.ts`

## Description

When a recipe is cooked and ingredients are deducted from the pantry, the system performs direct arithmetic subtraction of quantities without converting units. If a pantry item is stored in one unit (e.g., pounds) but the recipe requires it in a different unit (e.g., cups), the system incorrectly subtracts the numeric values without unit conversion, leading to nonsensical pantry quantities.

## Impact

- **Severity:** Critical
- **Affected Feature:** Recipe cooking and pantry inventory management
- **User Experience:** Pantry quantities become incorrect after cooking recipes, leading to:
  - Inaccurate inventory tracking
  - Incorrect availability calculations for future recipes
  - User confusion and loss of trust in the system
  - Potential food waste or shopping errors

## Technical Root Cause

In `src/app/api/recipes/[id]/cook/route.ts:131-132`, the code performs direct subtraction without unit checking:

```typescript
const currentQuantity = parseFloat(pantryItem.quantity);
const remainingQuantity = currentQuantity - quantityNeeded;
```

**The Problem:**
1. `pantryItem.quantity` is stored with `pantryItem.unit` (e.g., "2" with unit "lb")
2. `quantityNeeded` comes from `ingredient.scaledQuantity` with `ingredient.unit` (e.g., "1.5" with unit "cup")
3. No comparison of `pantryItem.unit` vs `ingredient.unit` occurs
4. No unit conversion is performed before subtraction
5. Result: `2 - 1.5 = 0.5` (mathematically correct but semantically wrong - you can't subtract cups from pounds)

### Code Location

`src/app/api/recipes/[id]/cook/route.ts:114-165`

The problematic section:

```typescript
// Find pantry item
const [pantryItem] = await tx
  .select()
  .from(pantryItems)
  .where(
    and(
      eq(pantryItems.householdId, householdId),
      eq(pantryItems.ingredientId, ingredient.ingredientId)
    )
  )
  .limit(1);

if (!pantryItem) continue;

// Skip if no quantity tracked
if (!pantryItem.quantity) continue;

const currentQuantity = parseFloat(pantryItem.quantity);
const remainingQuantity = currentQuantity - quantityNeeded; // ❌ NO UNIT CONVERSION

if (remainingQuantity <= 0) {
  // Remove item from pantry
  await tx.delete(pantryItems).where(eq(pantryItems.id, pantryItem.id));
  // ...
} else {
  // Update quantity
  await tx
    .update(pantryItems)
    .set({
      quantity: remainingQuantity.toString(), // ❌ STORES INCORRECT VALUE
      updatedAt: new Date(),
    })
    .where(eq(pantryItems.id, pantryItem.id));
  // ...
}
```

## Reproduction Steps

1. Add flour to pantry: **2 pounds**
2. Create a recipe that requires: **1.5 cups of flour**
3. Cook the recipe
4. Check pantry: flour now shows **0.5 pounds** (should be ~1.67 pounds, since 1.5 cups ≈ 0.33 lb)

### Detailed Example

**Scenario:** Cooking banana bread

**Pantry Before:**
- Flour: 2 lb
- Sugar: 500 g
- Butter: 1 lb

**Recipe Requirements:**
- Flour: 2 cups (~0.44 lb or ~200g)
- Sugar: 1 cup (~200g)
- Butter: 0.5 cup (~0.25 lb or ~113g)

**Current (Buggy) Behavior:**
- Flour: 2 - 2 = 0 lb ❌ (treated as "2 lb - 2 cups")
- Sugar: 500 - 1 = 499 g ❌ (treated as "500g - 1 cup")
- Butter: 1 - 0.5 = 0.5 lb ❌ (treated as "1 lb - 0.5 cups")

**Expected Behavior:**
- Flour: 2 lb - 0.44 lb = 1.56 lb ✓
- Sugar: 500 g - 200 g = 300 g ✓
- Butter: 1 lb - 0.25 lb = 0.75 lb ✓

## Current System State

### Supported Units

The system defines 60+ units in `src/lib/constants/units.ts`:

**Volume (Imperial):** tsp, tbsp, fl oz, cup, pint, quart, gallon
**Volume (Metric):** ml, liter
**Weight (Imperial):** oz, lb
**Weight (Metric):** g, kg
**Count:** whole, piece, slice, clove, head, bunch, etc.
**Packaging:** can, jar, bottle, bag, box, etc.
**Special:** pinch, dash, drop, scoop, serving

### Missing Components

❌ No unit conversion library or functions
❌ No unit compatibility checking
❌ No standardization to base units
❌ No validation that pantry and recipe units match

## Potential Solutions

### Option 1: Implement Unit Conversion Library (Recommended)

Create a comprehensive unit conversion system with standardized base units.

**Implementation approach:**

1. **Create conversion utility** (`src/lib/units/converter.ts`):
   ```typescript
   // Convert all measurements to standardized base units
   type BaseUnit = 'ml' | 'g' | 'count';

   interface ConversionResult {
     value: number;
     baseUnit: BaseUnit;
     convertible: boolean;
   }

   function convertToBaseUnit(quantity: number, unit: string): ConversionResult {
     // Volume conversions (all to ml)
     const volumeToMl = {
       'tsp': 4.92892,
       'tbsp': 14.7868,
       'fl oz': 29.5735,
       'cup': 236.588,
       'pint': 473.176,
       'quart': 946.353,
       'gallon': 3785.41,
       'ml': 1,
       'liter': 1000,
     };

     // Weight conversions (all to g)
     const weightToG = {
       'oz': 28.3495,
       'lb': 453.592,
       'g': 1,
       'kg': 1000,
     };

     // Count units (no conversion possible)
     const countUnits = ['whole', 'piece', 'slice', 'clove', ...];

     // Implement conversion logic...
   }

   function canConvert(unit1: string, unit2: string): boolean {
     // Check if units are in the same measurement system
   }

   function convertBetweenUnits(
     fromQuantity: number,
     fromUnit: string,
     toUnit: string
   ): number | null {
     // Convert via base units
   }
   ```

2. **Update cook route** to use conversion:
   ```typescript
   // Before subtraction, convert units
   if (pantryItem.unit && ingredient.unit) {
     if (!canConvert(pantryItem.unit, ingredient.unit)) {
       // Log warning: incompatible units
       continue; // Skip this ingredient
     }

     const convertedQuantity = convertBetweenUnits(
       quantityNeeded,
       ingredient.unit,
       pantryItem.unit
     );

     if (convertedQuantity === null) {
       continue; // Conversion failed
     }

     quantityNeeded = convertedQuantity;
   }

   const currentQuantity = parseFloat(pantryItem.quantity);
   const remainingQuantity = currentQuantity - quantityNeeded; // Now correct!
   ```

3. **Add unit compatibility validation**:
   - Warn users when adding ingredients to recipes with incompatible units
   - Suggest standard units for common ingredients
   - Provide UI feedback when units don't match

**Pros:**
- ✅ Accurate inventory tracking
- ✅ Works across all unit types
- ✅ Reusable for other features (grocery lists, recipe scaling)
- ✅ User-friendly (supports mixed unit systems)

**Cons:**
- ❌ Moderate implementation effort
- ❌ Need to handle edge cases (density conversions like cups to grams vary by ingredient)

### Option 2: Require Unit Standardization

Force all pantry items to use the same unit as recipes, or require users to choose a "canonical unit" per ingredient.

**Implementation:**
- Add `preferredUnit` field to ingredients table
- When adding to pantry, enforce or suggest the preferred unit
- Display unit compatibility warnings in UI

**Pros:**
- ✅ Simple implementation
- ✅ No conversion math needed

**Cons:**
- ❌ Poor UX (users can't use their preferred units)
- ❌ Doesn't solve existing data
- ❌ Inflexible

### Option 3: Same-Unit Matching Only

Only deduct from pantry if units exactly match; skip otherwise.

**Implementation:**
```typescript
if (pantryItem.unit !== ingredient.unit) {
  // Log mismatch, skip deduction
  continue;
}
```

**Pros:**
- ✅ Quick fix
- ✅ Prevents incorrect calculations

**Cons:**
- ❌ Poor UX (ingredients won't be deducted even when they should be)
- ❌ Doesn't solve the underlying problem
- ❌ Users will be confused why some ingredients aren't tracked

### Option 4: Hybrid Approach - Exact Match + Simple Conversions

Implement exact matching with a subset of common conversions.

**Phase 1:** Only convert within the same measurement system:
- Volume: tsp ↔ tbsp ↔ cup ↔ quart (Imperial/US)
- Volume: ml ↔ liter (Metric)
- Weight: oz ↔ lb (Imperial)
- Weight: g ↔ kg (Metric)

**Phase 2:** Add cross-system conversions (ml ↔ cup, g ↔ oz)

**Phase 3:** Add ingredient-specific density conversions (cups flour ↔ grams flour)

**Pros:**
- ✅ Incremental implementation
- ✅ Immediate value from Phase 1
- ✅ Can expand over time

**Cons:**
- ❌ Still incomplete coverage initially

## Recommended Solution

**Option 1 (Full Unit Conversion)** with **Option 4's incremental approach**:

1. **Immediate fix:** Implement same-unit matching (Option 3) to prevent incorrect calculations
2. **Phase 1:** Add within-system conversions (tsp→cup, g→kg, etc.)
3. **Phase 2:** Add cross-system conversions (ml→cup, oz→g)
4. **Phase 3:** Add ingredient-specific density tables for advanced conversions

## Additional Considerations

### Ingredient-Specific Conversions

Some conversions require ingredient density data:
- 1 cup flour ≈ 120-130g (varies by type and packing)
- 1 cup sugar ≈ 200g
- 1 cup butter ≈ 227g

**Recommendation:** Store density data in ingredients table for common ingredients.

### User Preferences

Consider allowing users to:
- Set preferred measurement system (metric/imperial)
- Auto-convert displays to their preference
- Choose whether to enforce strict unit matching

### Testing Strategy

1. **Unit tests** for conversion functions:
   - Test all volume conversions
   - Test all weight conversions
   - Test incompatible units return null/error
   - Test edge cases (zero, negative, very large numbers)

2. **Integration tests** for cook route:
   - Same unit (should work)
   - Compatible units (should convert)
   - Incompatible units (should skip or warn)
   - Missing units (should handle gracefully)

3. **E2E tests**:
   - Cook recipe with matching units
   - Cook recipe with convertible units
   - Cook recipe with incompatible units

## Related Issues

- Grocery list completion may have the same issue
- Recipe scaling might need unit conversion
- Ingredient search/matching should consider unit compatibility
- Available recipes calculation may incorrectly mark recipes as available

## Files That May Need Changes

**Core conversion:**
- `src/lib/units/converter.ts` (new file)
- `src/lib/units/conversions.ts` (new file - conversion tables)
- `src/lib/constants/units.ts` (add metadata: type, system, etc.)

**Pantry operations:**
- `src/app/api/recipes/[id]/cook/route.ts` ⭐ **Primary fix location**
- `src/app/api/pantry/items/route.ts`
- `src/app/api/pantry/bulk-update/route.ts`

**Related features:**
- `src/app/api/grocery-lists/[id]/complete/route.ts`
- `src/app/api/recipes/available/route.ts`
- `src/lib/recipe-scaling.ts`

**Database schema:**
- `src/lib/db/schema.ts` (possibly add preferredUnit to ingredients)

**UI components:**
- `src/components/pantry/add-pantry-item-form.tsx` (show unit warnings)
- `src/components/recipes/ingredient-input.tsx` (validate unit compatibility)

## Priority Justification

**High Priority** because:
1. Causes silent data corruption in pantry
2. Affects core functionality (cooking recipes)
3. Users cannot trust their inventory
4. Compounds over time (multiple recipes = multiple errors)
5. No workaround available
6. May cause users to abandon the feature

## Next Steps

1. ✅ Document bug (this file)
2. ⏸️ Implement quick fix: prevent mixed-unit deductions (Option 3)
3. ⏸️ Design unit conversion system architecture
4. ⏸️ Implement conversion library with tests
5. ⏸️ Update cook route to use conversions
6. ⏸️ Add UI warnings for unit mismatches
7. ⏸️ Test with real-world scenarios
8. ⏸️ Consider adding to grocery list completion flow
9. ⏸️ Update documentation with unit best practices

---

**Reported:** 2025-11-21
**Reporter:** User testing
**Assignee:** Unassigned
