# Ingredient Substitution Service API Documentation

## Overview

The Ingredient Substitution Service provides functionality for managing and querying ingredient substitutions. This enables the recipe matching system to find recipes that can be cooked with available pantry items, even when exact ingredients are not available.

## Database Schema

The substitution system uses the `ingredient_substitutions` table:

```sql
CREATE TABLE ingredient_substitutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  substitute_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  ratio DECIMAL(5, 2) DEFAULT '1.00',
  notes TEXT
);
```

### Key Features

- **Bidirectional substitutions**: A→B automatically implies B→A with inverse ratio
- **Ratio support**: Handles quantity adjustments (e.g., 1 cup butter = 0.75 cup oil)
- **Transitive substitutions** (optional): A→B, B→C implies A→C is possible
- **100+ pre-seeded substitutions**: Common cooking substitutions ready to use

## API Endpoints

### 1. Get Substitutes for an Ingredient

**Endpoint**: `GET /api/ingredients/:id/substitutes`

**Description**: Returns all possible substitutes for a given ingredient, including bidirectional relationships.

**Authentication**: Required (user must be logged in)

**Response**:

```json
{
  "ingredientId": "uuid",
  "substitutes": [
    {
      "id": "uuid",
      "ingredientId": "uuid",
      "substitute": {
        "id": "uuid",
        "name": "Olive Oil",
        "category": "pantry",
        "commonUnits": ["cup", "tbsp", "tsp"]
      },
      "ratio": "0.75",
      "notes": "Use 3/4 cup oil for 1 cup butter in baking"
    }
  ],
  "count": 3
}
```

**Example**:

```bash
curl -X GET http://localhost:3000/api/ingredients/{ingredient-id}/substitutes \
  -H "Cookie: next-auth.session-token=..."
```

### 2. List All Substitutions (Admin)

**Endpoint**: `GET /api/substitutions`

**Description**: Returns all substitution mappings in the database (admin function for managing substitutions).

**Authentication**: Required (user must be logged in)

**Response**:

```json
{
  "substitutions": [
    {
      "id": "uuid",
      "ingredientId": "uuid",
      "substituteId": "uuid",
      "ratio": "1.00",
      "notes": "1:1 substitution"
    }
  ],
  "count": 100
}
```

**Example**:

```bash
curl -X GET http://localhost:3000/api/substitutions \
  -H "Cookie: next-auth.session-token=..."
```

### 3. Create a Substitution (Admin)

**Endpoint**: `POST /api/substitutions`

**Description**: Creates a new ingredient substitution mapping.

**Authentication**: Required (user must be logged in)

**Request Body**:

```json
{
  "ingredientId": "uuid",
  "substituteId": "uuid",
  "ratio": "1.00",
  "notes": "Optional substitution notes"
}
```

**Validation Rules**:

- `ingredientId`: Must be a valid UUID
- `substituteId`: Must be a valid UUID (cannot be same as ingredientId)
- `ratio`: Must be a decimal number (e.g., "1.00", "0.75", "3.00")
- `notes`: Optional string

**Response** (201 Created):

```json
{
  "id": "uuid",
  "ingredientId": "uuid",
  "substituteId": "uuid",
  "ratio": "1.00",
  "notes": "Optional notes"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data or ingredient = substitute
- `409 Conflict`: Substitution already exists
- `401 Unauthorized`: User not authenticated

**Example**:

```bash
curl -X POST http://localhost:3000/api/substitutions \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "ingredientId": "123e4567-e89b-12d3-a456-426614174000",
    "substituteId": "123e4567-e89b-12d3-a456-426614174001",
    "ratio": "0.75",
    "notes": "Use 3/4 cup for 1 cup"
  }'
```

### 4. Delete a Substitution (Admin)

**Endpoint**: `DELETE /api/substitutions/:id`

**Description**: Removes a substitution mapping from the database.

**Authentication**: Required (user must be logged in)

**Response** (200 OK):

```json
{
  "message": "Substitution deleted successfully",
  "deleted": {
    "id": "uuid",
    "ingredientId": "uuid",
    "substituteId": "uuid",
    "ratio": "1.00",
    "notes": "..."
  }
}
```

**Error Responses**:

- `404 Not Found`: Substitution doesn't exist
- `401 Unauthorized`: User not authenticated

**Example**:

```bash
curl -X DELETE http://localhost:3000/api/substitutions/{substitution-id} \
  -H "Cookie: next-auth.session-token=..."
```

## SubstitutionService Class

The `SubstitutionService` class in `/src/lib/substitution-service.ts` provides programmatic access to substitution functionality.

### Methods

#### `getSubstitutes(ingredientId: string): Promise<Substitution[]>`

Returns all substitutes for an ingredient, including reverse relationships.

```typescript
const service = new SubstitutionService();
const substitutes = await service.getSubstitutes('ingredient-uuid');
```

#### `areSubstitutable(ingredientId1: string, ingredientId2: string): Promise<SubstitutionCheck>`

Checks if two ingredients are substitutable and returns the ratio.

```typescript
const check = await service.areSubstitutable('uuid1', 'uuid2');
// Returns: { substitutable: true, ratio: 0.75 }
```

#### `getAllSubstitutions(): Promise<Substitution[]>`

Returns all substitutions in the database (admin function).

#### `addSubstitution(ingredientId: string, substituteId: string, ratio: string, notes?: string)`

Creates a new substitution mapping.

#### `deleteSubstitution(substitutionId: string)`

Deletes a substitution by ID.

#### `getTransitiveSubstitutes(ingredientId: string, maxDepth: number = 2): Promise<Substitution[]>`

Finds indirect substitutions (A→B→C). Optional advanced feature.

## Integration with Recipe Matching

The substitution service integrates with the recipe matching system (Issue #10) to enable the "What Can I Cook?" feature to consider substitutes when determining if a recipe can be cooked with available pantry items.

Example integration:

```typescript
async function isRecipeCookable(recipe: Recipe, pantry: PantryItem[]) {
  const substitutionService = new SubstitutionService();

  for (const ingredient of recipe.ingredients) {
    // Check exact match
    const hasExact = pantry.some((p) => p.ingredient_id === ingredient.id);
    if (hasExact) continue;

    // Check substitutes
    const substitutes = await substitutionService.getSubstitutes(ingredient.id);
    const hasSubstitute = substitutes.some((sub) =>
      pantry.some((p) => p.ingredient_id === sub.substitute.id)
    );

    if (!hasSubstitute) return false;
  }

  return true;
}
```

## Pre-seeded Substitutions

The system comes with 100+ pre-seeded substitutions covering:

- **Fats & Oils**: Butter ↔ Oil, Coconut Oil, Margarine
- **Milk & Dairy**: Whole Milk ↔ 2%, Skim, Almond, Oat, Soy
- **Sweeteners**: White Sugar ↔ Brown Sugar, Honey, Maple Syrup
- **Flours**: All-Purpose ↔ Bread, Whole Wheat, Cake Flour
- **Herbs**: Fresh ↔ Dried (1:3 ratio)
- **Cheeses**: Cheddar ↔ Monterey Jack, Mozzarella
- **Aromatics**: Garlic ↔ Garlic Powder, Onion ↔ Shallots
- **Broths**: Chicken ↔ Vegetable, Beef ↔ Vegetable
- **Rice**: White ↔ Brown, Jasmine, Basmati
- **Tomato Products**: Sauce ↔ Crushed, Diced, Paste
- And many more...

## Notes on Ratio Handling

Ratios represent the conversion from the original ingredient to the substitute:

- `ratio = 1.00`: Direct 1:1 substitution
- `ratio = 0.75`: Use 0.75 units of substitute for 1 unit of original
- `ratio = 3.00`: Use 3 units of substitute for 1 unit of original

For bidirectional lookups, the inverse ratio is automatically calculated:

- If A→B has ratio 0.75, then B→A has ratio 1.33 (1/0.75)

## Future Enhancements

Potential improvements for future iterations:

1. **Context-aware substitutions**: Different substitutions for baking vs. cooking
2. **Dietary restrictions**: Filter substitutions based on dietary needs (vegan, gluten-free)
3. **User custom substitutions**: Allow users to add their own preferred substitutions
4. **Confidence scores**: Rate substitutions by how well they work
5. **Recipe-specific overrides**: Allow recipes to specify preferred substitutes
6. **ML-based suggestions**: Learn from successful substitutions

## Related Documentation

- [Recipe Matching API](./RECIPE_MATCHING_API.md) (Issue #10)
- [Pantry Management](./PANTRY_MANAGEMENT.md) (Issue #06)
- [Database Schema](../DATABASE_SETUP.md)
