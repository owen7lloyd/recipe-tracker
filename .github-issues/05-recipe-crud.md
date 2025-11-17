# Basic Recipe CRUD Operations

**Phase:** 1 - Foundation
**Priority:** P0
**Estimate:** 6 days

## Description

Implement complete recipe management system with create, read, update, delete operations, image upload, and a user-friendly recipe form and display interface.

## Tasks

### API Endpoints
- [ ] `GET /api/recipes` - List recipes with filters and pagination
- [ ] `POST /api/recipes` - Create new recipe
- [ ] `GET /api/recipes/:id` - Get single recipe with details
- [ ] `PUT /api/recipes/:id` - Update existing recipe
- [ ] `DELETE /api/recipes/:id` - Delete recipe (soft delete)

### Query Features
- [ ] Filter by category (breakfast, lunch, dinner, etc.)
- [ ] Filter by tags
- [ ] Search by title
- [ ] Search by ingredient
- [ ] Sort by: date added, rating, recently used, prep time
- [ ] Pagination (20 recipes per page)

### Recipe Form
- [ ] Recipe title input
- [ ] Description textarea
- [ ] Category selector (dropdown)
- [ ] Tags input (multi-select or comma-separated)
- [ ] Prep time input (minutes)
- [ ] Cook time input (minutes)
- [ ] Servings input
- [ ] Star rating (1-5 stars)
- [ ] Photo upload
- [ ] Ingredients list builder
- [ ] Instructions editor

### Ingredients List Builder
- [ ] Add ingredient row
- [ ] Remove ingredient row
- [ ] Reorder ingredients (drag-and-drop)
- [ ] Ingredient autocomplete
- [ ] Quantity input (decimal supported)
- [ ] Unit selector (cup, tbsp, tsp, oz, lb, g, kg, etc.)
- [ ] Notes field (optional)
- [ ] "Optional" checkbox

### Instructions Editor
- [ ] Step-by-step format
- [ ] Add/remove steps
- [ ] Reorder steps
- [ ] Rich text or plain text (decide)

### Image Upload
- [ ] Upload to Vercel Blob Storage
- [ ] Image preview before upload
- [ ] Image cropping (optional)
- [ ] Compress images
- [ ] Support JPEG, PNG, WebP
- [ ] Max size 5MB
- [ ] Delete old image when replacing

### Validation
- [ ] Title required (max 255 chars)
- [ ] At least 1 ingredient required
- [ ] At least 1 instruction step required
- [ ] Servings must be positive integer
- [ ] Times must be non-negative
- [ ] Rating must be 1-5 if provided
- [ ] Category must be valid enum value

### UI Components
- [ ] `RecipeForm` - Form for create/edit
- [ ] `RecipeList` - Grid or list view of recipes
- [ ] `RecipeCard` - Individual recipe card with image, title, time, rating
- [ ] `RecipeDetail` - Full recipe view
- [ ] `ImageUpload` - Image upload component
- [ ] `IngredientInputRow` - Single ingredient input
- [ ] `InstructionStepInput` - Single instruction step
- [ ] `RecipeFilters` - Sidebar or top filters
- [ ] `RecipeSearch` - Search bar

### Data Access Control
- [ ] Ensure all queries filter by household_id
- [ ] Users can only view their household's recipes
- [ ] Users can only edit/delete recipes in their household

## Acceptance Criteria

- [ ] Users can create recipes with all fields
- [ ] Images upload successfully
- [ ] Ingredients list is dynamic (add/remove rows)
- [ ] Instructions are numbered automatically
- [ ] Can search recipes by title
- [ ] Can filter by category
- [ ] Can filter by tags
- [ ] Can view recipe detail page
- [ ] Can edit existing recipes
- [ ] Can delete recipes
- [ ] Form validation works correctly
- [ ] Mobile responsive on all screens
- [ ] Images display properly on all devices
- [ ] Loading states shown during operations

## Technical Details

### API Implementation

```typescript
// GET /api/recipes
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { household_id: true }
  })

  let query = db.recipe.findMany({
    where: {
      household_id: user.household_id,
      ...(category && { category }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    },
    include: {
      recipe_ingredients: {
        include: {
          ingredient: true
        }
      }
    },
    orderBy: { created_at: 'desc' },
    take: limit,
    skip: offset
  })

  const recipes = await query
  return Response.json(recipes)
}
```

### Validation Schema

```typescript
import { z } from "zod"

export const recipeIngredientSchema = z.object({
  ingredient_id: z.string().uuid(),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  notes: z.string().optional(),
  optional: z.boolean().default(false),
})

export const recipeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  source_url: z.string().url().optional(),
  category: z.enum(['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage']),
  tags: z.array(z.string()).default([]),
  prep_time_minutes: z.number().int().nonnegative().optional(),
  cook_time_minutes: z.number().int().nonnegative().optional(),
  servings: z.number().int().positive(),
  rating: z.number().int().min(1).max(5).optional(),
  ingredients: z.array(recipeIngredientSchema).min(1),
  instructions: z.array(z.string()).min(1),
})
```

### Image Upload

```typescript
import { put } from '@vercel/blob'

export async function uploadRecipeImage(file: File): Promise<string> {
  const blob = await put(`recipes/${Date.now()}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return blob.url
}
```

## Dependencies

- [ ] #02 Database Schema (recipes, recipe_ingredients tables)
- [ ] #03 Authentication System
- [ ] #04 Household Management
- [ ] Vercel Blob Storage configured

## Testing

- [ ] Unit tests for validation schemas
- [ ] Integration tests for all API endpoints
- [ ] Test recipe creation with all fields
- [ ] Test recipe update
- [ ] Test recipe deletion
- [ ] Test search and filters
- [ ] Test image upload
- [ ] Test household isolation (users can't see other household recipes)
- [ ] E2E test: Create recipe → View → Edit → Delete

## Resources

- PRD Section 3.2: Recipe Management
- Implementation Plan: Section 1.4 Basic Recipe Management
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
