# Bug: Recipe Import Ingredient Field Mapping Issue

**Status:** 🔴 Open
**Priority:** High
**Component:** Recipe Import
**Affected Files:**
- `src/lib/recipe-scraper/ingredient-parser.ts`
- `src/components/recipes/ingredient-input.tsx`
- `src/components/recipes/recipe-import-modal.tsx`

## Description

When importing recipes from URLs, parsed ingredient data (quantity, unit, name) is not properly mapping to the correct form fields in the RecipeForm. Instead of populating the quantity and unit fields separately, the parsed values are appearing concatenated in the ingredient name field.

## Steps to Reproduce

1. Navigate to `/dashboard/recipes`
2. Click "Import from URL" button
3. Enter a recipe URL with unicode fractions (e.g., a recipe with "¼ teaspoon salt")
4. Import the recipe successfully
5. Observe the ingredient fields in the preview form

## Expected Behavior

Ingredients should be parsed into their respective fields:
- **Quantity field:** 0.25
- **Unit dropdown:** "teaspoon"
- **Name field:** "salt"

## Actual Behavior

All parsed data appears in the name field:
- **Quantity field:** (empty)
- **Unit dropdown:** (empty)
- **Name field:** ".25 teaspoon salt" or "0.25 teaspoon salt"

## Examples

| Original String | Expected | Actual |
|----------------|----------|--------|
| `¼ teaspoon salt` | qty: 0.25, unit: "teaspoon", name: "salt" | name: ".25 teaspoon salt" |
| `¾ cup brown sugar` | qty: 0.75, unit: "cup", name: "brown sugar" | name: ".75 cup brown sugar" |
| `½ cup butter` | qty: 0.5, unit: "cup", name: "butter" | name: ".5 cup butter" |
| `2 ⅓ cups mashed overripe bananas` | qty: 2.33, unit: "cup", name: "mashed overripe bananas" | name: ".3333332538605 cups mashed overripe bananas" |

## Investigation History

### Attempted Fix 1: Unicode Fraction Normalization
**Date:** 2025-11-18
**Commit:** `a54fc62`

Added unicode fraction support by converting unicode characters (½, ⅓, etc.) to ASCII fractions (1/2, 1/3) before parsing.

**Result:** Did not resolve the field mapping issue. Fractions are being parsed to decimal correctly, but still appearing in the wrong field.

### Attempted Fix 2: Whitespace Normalization
**Date:** 2025-11-18
**Commit:** `bdbffc9`

Added `.trim().replace(/\s+/g, ' ')` to normalize whitespace after unicode replacement, preventing leading spaces from breaking regex matching.

**Result:** Still not working. The parsed data is not reaching the correct form fields.

## Root Cause Analysis

### Parsing Layer (✓ Working)
The `parseIngredient()` function in `ingredient-parser.ts` appears to be parsing correctly based on the return values. The function returns a `ParsedIngredient` object with separate fields:
```typescript
{
  quantity: 0.25,
  unit: "teaspoon",
  name: "salt",
  notes: undefined,
  original: "¼ teaspoon salt"
}
```

### Mapping Layer (? Unknown)
The `mapIngredients()` function in `ingredient-matcher.ts` receives the parsed ingredients and maps them to `MappedIngredient` format:
```typescript
{
  ingredientId?: string,
  ingredientName: string,
  quantity?: number,
  unit?: string,
  notes?: string,
  optional?: boolean
}
```

### Form Layer (❌ Problem Area)
The issue appears to be in how the imported data is being passed to or handled by the `RecipeForm` component. The form expects ingredients in this format:
```typescript
{
  ingredientId: string,
  ingredientName?: string,
  quantity?: number | null,
  unit?: string | null,
  notes?: string | null,
  optional?: boolean
}
```

**Hypothesis:** The data structure returned from the import API may not match exactly what the form expects, or the `IngredientInput` component is not properly displaying the pre-populated values.

## Potential Issues to Investigate

1. **Data Flow Mismatch**
   - Check if `RecipeImportModal` is correctly passing the imported data to `RecipeForm`
   - Verify the structure of `importedRecipe.ingredients` matches what `RecipeForm.initialData` expects

2. **Component State Initialization**
   - `IngredientInput` component uses `searchQuery` state initialized from `value.ingredientName`
   - This may be displaying the name when it should show the matched ingredient
   - The quantity and unit fields may not be properly reading from `value.quantity` and `value.unit`

3. **Type Mismatches**
   - `MappedIngredient.ingredientName` vs `RecipeIngredient.ingredientName`
   - Number to string conversion issues for quantity field
   - Unit field expecting specific format

## Debug Steps Needed

1. Add console logging in `RecipeImportModal.handleImport()` to log the response data structure
2. Add console logging in `RecipeForm` to log `initialData.ingredients`
3. Add console logging in `IngredientInput` to log the `value` prop on mount
4. Verify the API response structure matches the form's expected structure
5. Check if `useFieldArray` in RecipeForm is properly initializing with the imported data

## Workaround

Users can manually enter ingredients after import:
1. Import the recipe
2. For each ingredient with incorrect field mapping:
   - Clear the name field
   - Search for the ingredient in the dropdown
   - Manually enter quantity and select unit
   - Add any notes

## Related Code Sections

### Import API Response
`src/app/api/recipes/import/route.ts:124-135`
```typescript
return NextResponse.json({
  recipe: {
    title: recipe.title,
    // ... other fields
    ingredients: mappedIngredients,
    instructions: recipe.instructions,
  },
  source: recipe.source,
});
```

### RecipeImportModal Data Handling
`src/components/recipes/recipe-import-modal.tsx:49-54`
```typescript
const data = await response.json();
setImportedRecipe(data.recipe);
setSource(data.source);
```

### RecipeForm Initialization
`src/components/recipes/recipe-form.tsx:48-62`
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch,
  setValue,
  control,
} = useForm({
  resolver: zodResolver(createRecipeSchema),
  defaultValues: initialData || {
    // ...
    ingredients: [],
    // ...
  },
});
```

## Testing URLs

To test with URLs that should work (not blocked):
- Search for: "wordpress recipe blog banana bread"
- Look for personal food blogs with schema.org data
- Avoid major commercial sites (AllRecipes, Food Network, etc.)

## Next Steps

1. Add detailed logging to trace data through the entire flow
2. Verify data structure compatibility between API response and form expectations
3. Test if the issue is in initial data population or in how the component renders the fields
4. Consider if the issue is specific to imported recipes or affects all recipe editing

## Additional Context

- Build passes: ✓
- TypeScript type checking passes: ✓
- Unicode fraction parsing works correctly in isolation
- The bug only manifests in the UI, not in the parsing logic itself
- Users can still successfully save recipes after manually fixing the fields

---

**Last Updated:** 2025-11-18
**Reporter:** User testing
**Assignee:** Unassigned
