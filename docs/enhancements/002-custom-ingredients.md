# Enhancement: Custom Ingredients

## Status
🔴 Open

## Priority
High

## Description
Allow users to create and manage custom ingredients that can be used across the application in recipes, pantry tracking, and grocery lists. This gives users flexibility to add ingredients that may not be in the default ingredient database.

## Current Implementation
The application currently uses a predefined set of ingredients. Users are limited to selecting from this existing list when:
- Creating or editing recipes
- Adding items to their pantry
- Creating grocery lists

## Required Changes

### 1. Database Schema
Add a new table for custom ingredients:

```sql
CREATE TABLE custom_ingredients (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  default_unit VARCHAR(50),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### 2. API Endpoints

**Create Custom Ingredient:**
- `POST /api/ingredients/custom`
- Body: `{ name, default_unit?, category? }`

**List Custom Ingredients:**
- `GET /api/ingredients/custom`
- Returns all custom ingredients for authenticated user

**Update Custom Ingredient:**
- `PATCH /api/ingredients/custom/:id`
- Body: `{ name?, default_unit?, category? }`

**Delete Custom Ingredient:**
- `DELETE /api/ingredients/custom/:id`
- Should handle cascading updates/deletes for recipes/lists using it

### 3. UI Components

**Custom Ingredient Manager:**
- New page or modal for managing custom ingredients
- List view showing all custom ingredients
- Form for adding new custom ingredients
- Edit/delete actions for existing custom ingredients

**Ingredient Selector Enhancement:**
- Update ingredient dropdowns to show both default and custom ingredients
- Visual indicator to distinguish custom ingredients (e.g., tag or icon)
- Quick "Add custom ingredient" option in dropdowns

### 4. Integration Points

**Recipes:**
- Allow custom ingredients in recipe ingredient lists
- Store reference to custom ingredient or copy name at time of creation

**Pantry:**
- Include custom ingredients in pantry item selection
- Track custom ingredients in pantry inventory

**Grocery Lists:**
- Support custom ingredients in grocery list items
- Ensure custom ingredients sync properly in shared lists

### 5. Data Handling

**Deletion Strategy:**
When a custom ingredient is deleted, decide on approach:
- Option A: Soft delete (mark as deleted but keep in existing recipes)
- Option B: Replace with plain text in existing uses
- Option C: Prevent deletion if in use (recommended)

**Naming Conflicts:**
- Prevent duplicate custom ingredient names per user
- Handle case-insensitive matching
- Provide clear error messages

## Benefits
- ✅ Increased flexibility for users with unique ingredients
- ✅ Supports international/regional ingredients
- ✅ Accommodates specialized diets and products
- ✅ Better user satisfaction and app utility
- ✅ Reduces feature requests for missing ingredients

## Risks
- ⚠️ Increased database storage per user
- ⚠️ Potential for duplicate/inconsistent ingredient names
- ⚠️ Complexity in search and filtering across default + custom ingredients
- ⚠️ May complicate shared recipes if recipient doesn't have custom ingredient

## Testing Checklist
After implementation, verify:
- [ ] Users can create custom ingredients with valid data
- [ ] Duplicate ingredient names are prevented per user
- [ ] Custom ingredients appear in recipe ingredient selectors
- [ ] Custom ingredients work in pantry tracking
- [ ] Custom ingredients work in grocery lists
- [ ] Custom ingredients display correctly with visual indicator
- [ ] Editing custom ingredients updates across all uses
- [ ] Deletion handling works as intended (prevent if in use)
- [ ] Custom ingredients are properly scoped to user (not visible to others)
- [ ] Shared recipes handle custom ingredients gracefully
- [ ] API endpoints validate permissions correctly
- [ ] Performance remains acceptable with many custom ingredients

## References
- Ingredient database schema
- Recipe ingredient selection components
- Pantry management system
- Grocery list components

## Notes
- Consider adding import/export functionality for custom ingredients
- May want to suggest adding custom ingredients to global database after certain usage threshold
- Could include optional fields like nutritional info, allergen tags, or photos
- Consider syncing custom ingredients across shared lists with permission
