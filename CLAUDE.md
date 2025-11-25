# CLAUDE.md - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working on the Recipe & Pantry Tracker codebase.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Design System](#design-system)
4. [Project Structure](#project-structure)
5. [Database Architecture](#database-architecture)
6. [Authentication System](#authentication-system)
7. [API Patterns](#api-patterns)
8. [Component Organization](#component-organization)
9. [Key Business Logic](#key-business-logic)
10. [Testing Guidelines](#testing-guidelines)
11. [Development Workflow](#development-workflow)
12. [Deployment](#deployment)
13. [Code Conventions](#code-conventions)
14. [Common Patterns](#common-patterns)
15. [Important Notes](#important-notes)

---

## Project Overview

A full-stack Next.js application for household recipe management, pantry tracking, and intelligent grocery list generation.

### Core Features
- **Recipe Management**: Create, edit, import recipes from websites
- **Pantry Tracking**: Track ingredient inventory
- **Smart Matching**: "What Can I Cook?" feature matches recipes to available ingredients
- **Ingredient Search**: Search recipes by selecting multiple ingredients with "any/all" modes and ingredient exclusion
- **Grocery Lists**: Auto-generate shopping lists from recipes, subtract pantry items
- **Household Sharing**: Multi-user households with invite system
- **Real-time Sync**: Live updates for grocery lists (optional Supabase integration)
- **Public Sharing**: Share grocery lists via time-limited tokens

### Architecture Principles
- **Multi-tenancy**: All data scoped to households
- **Server-first**: Server components by default, client components only when needed
- **Type-safe**: Strict TypeScript, Zod validation
- **Progressive Enhancement**: Works without JavaScript where possible
- **Real-time Optional**: Gracefully degrades without Supabase

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router, React 19)
- **TypeScript** (strict mode)
- **Tailwind CSS** (utility-first styling)
- **shadcn/ui** (Radix UI primitives)
- **React Hook Form** (form management)
- **Zod** (schema validation)
- **TanStack Query** (data fetching, caching)

### Backend
- **Next.js API Routes** (serverless)
- **PostgreSQL** (primary database via Supabase)
- **Drizzle ORM** (type-safe database queries)
- **NextAuth.js v5** (authentication)
- **Supabase** (real-time sync only, NOT primary database)
- **Vercel Blob** (image storage)

### Development
- **pnpm** (package manager)
- **Vitest** (unit tests)
- **Playwright** (E2E tests)
- **ESLint + Prettier** (code quality)
- **Husky + lint-staged** (pre-commit hooks)
- **Framer Motion** (animations & transitions)

---

## Design System

### Visual Theme: "Warm, Organic Garden"

The application features a nature-inspired aesthetic with earthy tones, rounded forms, and a cozy, welcoming feel.

### Color Palette

| Color Name | Hex Value | Usage |
|-----------|-----------|--------|
| Primary Green | `#2d5016` | Main brand color, headers, primary buttons |
| Secondary Green | `#6b8e23` | Badges, secondary elements |
| Accent Gold | `#d4a574` | Hover states, accents, highlights |
| Light Background | `#faf8f3` | Page backgrounds, light surfaces |
| Card Background | `#ffffff` | Card backgrounds, modals |
| Text Dark | `#2c2415` | Primary text content |
| Text Light | `#6b6250` | Secondary text, descriptions |
| Border Color | `#e8dcc8` | Card borders, dividers |

### Typography

**Display Font: Merriweather** (serif)
- Used for all headings (h1, h2, h3, h4, h5, h6)
- Font weights: 400 (regular), 700 (bold)
- Letter spacing: -0.5px
- Sizes: h1 uses `clamp(1.8rem, 5vw, 2.8rem)`, h2 uses `clamp(1.3rem, 4vw, 1.8rem)`

**Body Font: Poppins** (sans-serif)
- Used for body text, buttons, UI elements
- Font weights: 300 (light), 500 (medium), 600 (semibold), 700 (bold)
- Line height: 1.6 for body text

### Component Styling Guidelines

- **Rounded Corners**: 20px for cards (`rounded-2xl`), 50px for buttons (`rounded-full`)
- **Shadows**: Soft shadows with `rgba(45, 80, 22, 0.15)` for organic feel
- **Transitions**: 0.3s ease for all interactive elements
- **Hover Effects**: Lift effect with `-translate-y-2` and enhanced shadows
- **Focus States**: Ring with offset for accessibility

### CSS Custom Properties

The design system is implemented via CSS variables in `/src/app/globals.css`:

```css
:root {
  --primary: #2d5016;
  --secondary: #6b8e23;
  --accent: #d4a574;
  --light-bg: #faf8f3;
  --card-bg: #ffffff;
  --text-dark: #2c2415;
  --text-light: #6b6250;
  --border: #e8dcc8;
}
```

### Component Updates

All UI components have been updated to use the organic garden aesthetic:

- **Cards**: `rounded-2xl` border, `border-[#e8dcc8]`, hover `border-[#d4a574]`
- **Buttons**: Gradient green (`from-[#2d5016] to-[#3d6b1f]`), rounded-full, smooth transitions
- **Inputs**: `rounded-xl` borders, `border-[#e8dcc8]`, gold focus states
- **Badges**: Secondary green background with white text, rounded-full
- **Dashboard Nav**: Green gradient header with organic colors

### Key Files

- `/src/app/globals.css` - Design system implementation and typography
- `/src/components/ui/card.tsx` - Card component with organic styling
- `/src/components/ui/button.tsx` - Button variants with gradients and hover effects
- `/src/components/ui/input.tsx` - Input styling with rounded borders
- `/src/components/landing/` - Landing page components with design system colors
- `/src/components/dashboard/dashboard-nav.tsx` - Navigation with gradient header
- `/src/components/recipes/recipe-card.tsx` - Recipe cards with organic styling

---

## Project Structure

```
/src
  /app                          # Next.js App Router
    /api                        # API routes (serverless functions)
      /auth
        /[...nextauth]          # NextAuth handler
        /register               # User registration
      /recipes                  # Recipe CRUD + features
        /[id]                   # Single recipe operations
        /search                 # Search by ingredients
        /available              # "What Can I Cook?"
        /import                 # Web scraping
      /pantry                   # Pantry management
      /grocery-lists            # Grocery list CRUD
        /[id]/items             # List items
        /generate               # Auto-generate from recipes
        /shared/[token]         # Public access
      /households               # Household management
      /ingredients              # Ingredient search/substitutes
      /upload                   # Image upload to Vercel Blob
    /dashboard                  # Protected app pages
      /recipes
        /[id]/edit              # Edit recipe
        /[id]/cook              # Cooking mode
        /search                 # Search by ingredients page
        /available              # "What Can I Cook?" page
      /pantry
      /grocery-lists
      /settings
    /login                      # Public auth pages
    /register
    /join/[code]                # Accept household invite
    /shared/[token]             # Public grocery list view
    layout.tsx                  # Root layout
    page.tsx                    # Landing page

  /components
    /ui                         # shadcn/ui components
    /auth                       # Login/register forms
    /recipes                    # Recipe-specific components
    /pantry                     # Pantry components
    /grocery-lists              # Grocery list components
    /household                  # Household management
    /dashboard                  # Dashboard layout components
    /providers                  # React context providers

  /lib
    /db
      schema.ts                 # **DATABASE SCHEMA** (Drizzle)
      index.ts                  # Database client
      /seed                     # Seed data
    /auth
      config.ts                 # NextAuth config (Node.js)
      config.edge.ts            # NextAuth config (Edge)
      index.ts                  # Auth helpers (getSession)
    /validations                # Zod schemas
    /api
      utils.ts                  # API helpers (requireAuth, errors)
    /recipe
      helpers.ts                # Recipe database helpers
    /recipe-scraper             # Web import system
      ingredient-parser.ts      # Parse "2 cups flour"
      ingredient-matcher.ts     # Match to DB ingredients
      schema-org.ts             # JSON-LD parsing
      html-parser.ts            # HTML fallback
    /supabase                   # Real-time sync
    /constants                  # Enums, constants
    /hooks                      # Custom React hooks
    recipe-matching.ts          # "What Can I Cook?" logic
    recipe-scaling.ts           # Scale servings
    grocery-list-generator.ts   # Generate lists from recipes
    substitution-service.ts     # Ingredient substitutions
    utils.ts                    # Utility functions (cn, etc.)

  /types
    next-auth.d.ts              # NextAuth type extensions

/drizzle                        # Database migrations
/e2e                            # Playwright E2E tests
/test                           # Test setup and utilities
/docs                           # API documentation
```

---

## Database Architecture

### ⚠️ CRITICAL: Database Management

**The database is managed through Supabase with existing tables.**

- **Schema Definition**: `/src/lib/db/schema.ts` (for TypeScript types and Drizzle ORM)
- **Schema Changes**: ALL schema changes MUST be done through the **Supabase SQL Editor**
- **DO NOT** use Drizzle migrations (`pnpm db:generate`, `pnpm db:migrate`) for schema changes
- **DO NOT** use `pnpm db:push` to push schema changes
- Drizzle schema file should be updated to REFLECT the Supabase schema, not drive it

### Database Tables

#### **users**
```typescript
id: uuid (PK)
email: text (unique)
name: text
passwordHash: text
householdId: uuid (FK -> households.id)
createdAt, updatedAt: timestamp
```

#### **households**
```typescript
id: uuid (PK)
name: text
createdBy: uuid (FK -> users.id)
createdAt, updatedAt: timestamp
```

#### **householdInvites**
```typescript
id: uuid (PK)
householdId: uuid (FK -> households.id, CASCADE)
code: text (unique) - invite link code
createdBy: uuid (FK -> users.id)
expiresAt: timestamp
usedBy: uuid (FK -> users.id, nullable)
usedAt: timestamp (nullable)
createdAt: timestamp
```

#### **ingredients**
```typescript
id: uuid (PK)
name: text (unique)
category: enum (produce, dairy, meat, seafood, pantry, frozen, bakery, other)
commonUnits: text[] (nullable)
createdAt: timestamp
```

#### **ingredientSubstitutions**
```typescript
id: uuid (PK)
ingredientId: uuid (FK -> ingredients.id, CASCADE)
substituteId: uuid (FK -> ingredients.id, CASCADE)
ratio: decimal(5,2) default 1.00
notes: text (nullable)
```

#### **recipes**
```typescript
id: uuid (PK)
householdId: uuid (FK -> households.id, CASCADE)
title: text
description: text (nullable)
imageUrl: text (nullable)
sourceUrl: text (nullable)
category: enum (breakfast, lunch, dinner, dessert, snack, beverage)
tags: text[] (nullable)
prepTimeMinutes: integer (nullable)
cookTimeMinutes: integer (nullable)
servings: integer (default 4)
rating: integer (nullable, 1-5)
instructions: text[] - array of step strings
createdBy: uuid (FK -> users.id)
createdAt, updatedAt: timestamp
```

#### **recipeIngredients**
```typescript
id: uuid (PK)
recipeId: uuid (FK -> recipes.id, CASCADE)
ingredientId: uuid (FK -> ingredients.id)
quantity: decimal(10,2) (nullable)
unit: text (nullable)
notes: text (nullable) - "chopped", "to taste"
optional: boolean (default false)
substitutionGroup: text (nullable)
```

#### **pantryItems**
```typescript
id: uuid (PK)
householdId: uuid (FK -> households.id, CASCADE)
ingredientId: uuid (FK -> ingredients.id)
quantity: decimal(10,2) (nullable)
unit: text (nullable)
addedBy: uuid (FK -> users.id)
purchaseDate: timestamp (nullable)
updatedAt: timestamp
```

#### **recipeHistory**
```typescript
id: uuid (PK)
recipeId: uuid (FK -> recipes.id, CASCADE)
householdId: uuid (FK -> households.id, CASCADE)
cookedBy: uuid (FK -> users.id)
servings: integer
cookedAt: timestamp (default now)
```

#### **groceryLists**
```typescript
id: uuid (PK)
householdId: uuid (FK -> households.id, CASCADE)
name: text
shareToken: text (unique, nullable) - public sharing
shareExpiresAt: timestamp (nullable)
createdBy: uuid (FK -> users.id)
createdAt, updatedAt: timestamp
```

#### **groceryListItems**
```typescript
id: uuid (PK)
groceryListId: uuid (FK -> groceryLists.id, CASCADE)
ingredientId: uuid (FK -> ingredients.id)
quantity: decimal(10,2)
unit: text (nullable)
category: enum (same as ingredient categories)
store: text (nullable)
checked: boolean (default false)
checkedBy: uuid (FK -> users.id, nullable)
checkedAt: timestamp (nullable)
recipeIds: uuid[] (nullable) - tracks source recipes
```

#### **householdCategoryOrder**
```typescript
householdId: uuid (PK, FK -> households.id, CASCADE)
categoryOrder: text[] - ordered list of categories
updatedAt: timestamp
```

### Key Database Patterns

1. **Household Scoping**: All user data filtered by `householdId`
2. **Cascade Deletes**: Most foreign keys CASCADE on delete
3. **Nullable Quantities**: Ingredients without specific amounts (e.g., "salt to taste")
4. **Decimal Storage**: Quantities stored as strings, converted to numbers in code
5. **Array Columns**: Instructions, tags, recipe IDs stored as PostgreSQL arrays

---

## Authentication System

### NextAuth v5 Configuration

**Files:**
- `/src/lib/auth/config.ts` - Main config (Node.js runtime)
- `/src/lib/auth/config.edge.ts` - Edge runtime config
- `/src/lib/auth/index.ts` - Exports and custom `getSession()`
- `/src/app/api/auth/[...nextauth]/route.ts` - API handler with Vercel workaround

### Session Structure

```typescript
interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    householdId: string | null;
  };
}
```

### Important Authentication Patterns

#### ⚠️ Custom `getSession()` Function

**USE THIS** instead of `auth()` in server components and pages:

```typescript
import { getSession } from '@/lib/auth';

const session = await getSession();
if (!session?.user) {
  redirect('/login');
}
```

**Why?** NextAuth v5 beta has URL construction bugs on Vercel. The custom `getSession()` directly decodes the JWT cookie to avoid these issues.

#### API Route Authentication

```typescript
import { auth } from '@/lib/auth';

const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

#### Household Authorization

Always check household membership:

```typescript
const householdId = session.user.householdId;
if (!householdId) {
  return NextResponse.json(
    { error: 'User not assigned to a household' },
    { status: 403 }
  );
}
```

### Cookie Names

- **Development**: `authjs.session-token`
- **Production**: `__Secure-authjs.session-token`

---

## API Patterns

### Standard API Route Structure

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { mySchema } from '@/lib/validations/my-schema';

export async function POST(request: Request) {
  try {
    // 1. Authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Household authorization
    const householdId = session.user.householdId;
    if (!householdId) {
      return NextResponse.json(
        { error: 'User not assigned to household' },
        { status: 403 }
      );
    }

    // 3. Parse and validate input
    const body = await request.json();
    const validatedData = mySchema.parse(body);

    // 4. Business logic
    const result = await db
      .insert(myTable)
      .values({
        ...validatedData,
        householdId,
        createdBy: session.user.id,
      })
      .returning();

    // 5. Return response
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    // 6. Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Helper Functions

Located in `/src/lib/api/utils.ts`:

```typescript
// Reusable auth check
const userIdOrError = await requireAuth();
if (userIdOrError instanceof NextResponse) {
  return userIdOrError; // Return error response
}
const userId = userIdOrError;

// Standardized error responses
return createErrorResponse(
  'User-facing error message',
  400,
  'Console log message',
  error
);
```

### Key API Endpoints

#### Recipes
- `GET /api/recipes` - List with filters (search, category, tags, ingredients)
- `POST /api/recipes` - Create
- `GET/PUT/DELETE /api/recipes/[id]` - Single recipe operations
- `GET /api/recipes/search` - Search by ingredients (any/all modes, exclusion, sorting)
- `GET /api/recipes/available` - "What Can I Cook?" feature
- `POST /api/recipes/import` - Import from URL
- `POST /api/recipes/[id]/cook` - Mark as cooked
- `POST /api/recipes/[id]/scale` - Scale servings

#### Pantry
- `GET /api/pantry` - List all items
- `POST /api/pantry/items` - Add/update item
- `PUT/DELETE /api/pantry/items/[id]` - Update/remove item
- `POST /api/pantry/bulk-update` - Batch operations

#### Grocery Lists
- `GET/POST /api/grocery-lists` - List/create
- `POST /api/grocery-lists/generate` - Auto-generate from recipes
- `GET/PUT/DELETE /api/grocery-lists/[id]` - Single list operations
- `POST /api/grocery-lists/[id]/items` - Add item
- `PUT/DELETE /api/grocery-lists/[id]/items/[itemId]` - Update/remove item
- `POST /api/grocery-lists/[id]/share` - Generate share token
- `GET /api/grocery-lists/shared/[token]` - Public view (no auth)

#### Households
- `GET/PUT /api/households/[id]` - Get/update household
- `POST /api/households/[id]/invite` - Generate invite code
- `GET /api/households/[id]/invites` - List active invites
- `POST /api/households/join` - Join via invite code
- `DELETE /api/households/[id]/members/[userId]` - Remove member

---

## Component Organization

### UI Components (`/src/components/ui/`)

shadcn/ui components based on Radix UI primitives. To add new components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

### Feature Components

#### Recipes (`/src/components/recipes/`)
- `recipe-form.tsx` - Create/edit form with validation
- `recipe-list.tsx` - Paginated list with filters
- `recipe-card.tsx` - Card view for list display
- `recipe-detail.tsx` - Full recipe view
- `ingredient-input.tsx` - Autocomplete ingredient selector
- `ingredient-picker.tsx` - Multi-select ingredient picker for search
- `ingredient-search-page.tsx` - Search recipes by ingredients page
- `cook-recipe-view.tsx` - Step-by-step cooking mode
- `serving-scaler.tsx` - Adjust servings with live updates

#### Pantry (`/src/components/pantry/`)
- `pantry-list.tsx` - List with edit/delete
- `add-pantry-item-form.tsx` - Add/update pantry item
- `ingredient-autocomplete.tsx` - Search and select

#### Grocery Lists (`/src/components/grocery-lists/`)
- `GroceryListWithRealtime.tsx` - Wrapper with Supabase real-time
- `OrganizedGroceryList.tsx` - Grouped by category
- `category-section.tsx` - Collapsible category sections
- `grocery-list-item.tsx` - Checkable item
- `recipe-selector.tsx` - Multi-select for generation
- `ShareListModal.tsx` - Generate/share public link

### Component Patterns

#### Client vs Server Components

**Use Server Components (default) when:**
- No interactivity needed
- Fetching data
- Accessing backend directly

**Use Client Components (`'use client'`) when:**
- Event handlers (onClick, onChange)
- React hooks (useState, useEffect)
- Browser APIs
- Forms with React Hook Form

#### Form Pattern

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema } from '@/lib/validations/my-schema';

export function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm({
    resolver: zodResolver(mySchema),
    defaultValues: {},
  });

  const onSubmit = async (data) => {
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    // Handle response
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('fieldName')} />
      {errors.fieldName && <span>{errors.fieldName.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

---

## Key Business Logic

### Recipe Matching (`/src/lib/recipe-matching.ts`)

**Function:** `findCookableRecipes(householdId, options)`

Matches recipes against pantry inventory:

1. Fetch all household recipes with ingredients
2. Fetch all pantry items
3. For each recipe:
   - Check exact ingredient matches in pantry
   - Check substitutes if no exact match
   - Calculate match percentage
   - Mark as cookable if all required ingredients available
4. Return sorted by cookability

**Options:**
- `includePartialMatches: boolean` - Include recipes missing some ingredients
- `minMatchPercentage: number` - Minimum % match for partial matches

### Recipe Search by Ingredients (`/src/lib/recipe/helpers.ts`)

**Function:** `searchRecipesByIngredients(householdId, ingredientIds, options)`

Search recipes by selecting multiple ingredients with advanced filtering:

1. Query recipes containing selected ingredients
2. Calculate match count for each recipe
3. Filter by match mode:
   - `any`: Recipes with at least one ingredient (OR)
   - `all`: Recipes with all selected ingredients (AND)
4. Exclude recipes containing excluded ingredients
5. Calculate match percentage (matched ingredients / total ingredients)
6. Sort by relevance, rating, cook time, or prep time
7. Apply pagination

**Options:**
- `matchMode: 'any' | 'all'` - Match any or all ingredients (default: 'any')
- `excludeIngredients: string[]` - Ingredient IDs to exclude
- `limit: number` - Results per page (default: 20, max: 100)
- `offset: number` - Pagination offset (default: 0)
- `sortBy: 'relevance' | 'rating' | 'cookTime' | 'prepTime'` - Sort order (default: 'relevance')

**Returns:**
- Array of recipes with `matchCount`, `totalIngredients`, and `matchPercentage` fields

### Recipe Scaling (`/src/lib/recipe-scaling.ts`)

**Function:** `scaleRecipe(recipe, targetServings)`

Scales all ingredient quantities proportionally:

```typescript
scaleFactor = targetServings / recipe.servings;
newQuantity = originalQuantity * scaleFactor;
```

Handles nullable quantities gracefully.

### Grocery List Generation (`/src/lib/grocery-list-generator.ts`)

**Function:** `generateGroceryList(request, householdId, userId)`

1. Fetch selected recipes with ingredients
2. Scale recipes to target servings
3. Fetch current pantry inventory
4. Calculate needed quantities:
   - Combine duplicate ingredients (same ID + unit)
   - Subtract pantry quantities
   - Track source recipe IDs
5. Group by category
6. Create grocery list with items
7. Throw error if nothing needed

### Ingredient Parser (`/src/lib/recipe-scraper/ingredient-parser.ts`)

Parses natural language ingredient strings:

```typescript
Input:  "2 ½ cups all-purpose flour, sifted"
Output: {
  quantity: 2.5,
  unit: "cup",
  name: "all-purpose flour",
  notes: "sifted"
}
```

Features:
- Unicode fractions (½, ¼, ⅓, ¾)
- Mixed numbers (1 1/2, 2 3/4)
- Unit normalization (tbsp → tablespoon)
- Notes extraction (after comma)

### Recipe Web Scraper (`/src/lib/recipe-scraper/`)

Import recipes from websites:

1. Fetch URL content
2. Try JSON-LD schema.org extraction (structured data)
3. Fallback to HTML parsing if needed
4. Parse ingredient strings
5. Match ingredients to database
6. Return structured recipe data

**Files:**
- `schema-org.ts` - JSON-LD Recipe schema parsing
- `html-parser.ts` - HTML fallback extraction
- `ingredient-matcher.ts` - Match scraped text to DB ingredients

---

## Testing Guidelines

### Unit Tests (Vitest)

**Config:** `/vitest.config.ts`

**Run Tests:**
```bash
pnpm test              # Run once
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage report
pnpm test:ui           # Vitest UI
```

**Test File Convention:**
- Place next to source: `my-file.test.ts`
- Or in `__tests__` directory

**Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from './my-file';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

**Mocking:**
```typescript
// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));
```

### E2E Tests (Playwright)

**Config:** `/playwright.config.ts`

**Run Tests:**
```bash
pnpm test:e2e          # Headless
pnpm test:e2e:ui       # UI mode
pnpm test:e2e:debug    # Debug mode
```

**Test File Convention:**
- Located in `/e2e` directory
- Named `*.spec.ts`

**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('user can create recipe', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  await page.goto('/dashboard/recipes/new');
  await page.fill('input[name="title"]', 'Test Recipe');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/dashboard\/recipes\/[a-z0-9-]+$/);
});
```

### CI/CD (GitHub Actions)

**File:** `/.github/workflows/test.yml`

Runs on every push and PR:
1. Type checking (`tsc --noEmit`)
2. Linting (`pnpm lint`)
3. Unit tests with coverage
4. E2E tests
5. Fails if coverage < 80%

---

## Development Workflow

### Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Database is managed via Supabase
# Do NOT run migrations locally

# Start dev server
pnpm dev
```

### Available Scripts

```bash
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript checking
pnpm test             # Run unit tests
pnpm test:e2e         # Run E2E tests
```

### Git Workflow

1. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes** (pre-commit hooks run automatically):
   - Prettier formats code
   - ESLint fixes auto-fixable issues
   - Type checks run

3. **Commit** (use conventional commits):
   ```bash
   git commit -m "feat: add recipe scaling feature"
   git commit -m "fix: resolve pantry item duplication"
   git commit -m "chore: update dependencies"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Adding UI Components

```bash
# Add shadcn/ui component
pnpm dlx shadcn@latest add dialog

# List available components
pnpm dlx shadcn@latest add
```

---

## Deployment

### Vercel Configuration

**Deployment:** Automatic on push to `main`

**Environment Variables Required:**
```bash
DATABASE_URL               # Supabase PostgreSQL connection string
NEXTAUTH_SECRET           # Generate: openssl rand -base64 32
NEXTAUTH_URL              # Auto-set by Vercel
BLOB_READ_WRITE_TOKEN     # Vercel Blob storage
NEXT_PUBLIC_SUPABASE_URL  # Optional: real-time sync
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Optional: real-time sync
```

### Build Configuration

**File:** `/next.config.ts` (minimal config, uses Next.js defaults)

### Database Setup on Vercel

1. **Use Supabase** for PostgreSQL database
2. Set `DATABASE_URL` in Vercel environment variables
3. Schema is managed in Supabase SQL Editor
4. NO migrations needed on deployment

### Important Deployment Notes

1. **NEXTAUTH_URL Handling**: Custom handler in API route sets URL dynamically for preview deployments
2. **Edge Runtime**: Some routes use Edge runtime (fast, globally distributed)
3. **Image Uploads**: Uses Vercel Blob Storage (requires token)
4. **Real-time Features**: Optional, check if Supabase configured before using

---

## Code Conventions

### TypeScript

- **Strict mode enabled**
- **Path alias:** `@/*` → `./src/*`
- **No explicit `any`** (use `unknown` if type truly unknown)
- **Arrow functions preferred** for consistency

### Naming Conventions

- **Components**: PascalCase (`RecipeForm.tsx`)
- **Files**: kebab-case (`recipe-form.tsx`)
- **Functions**: camelCase (`getRecipeById`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_SERVINGS`)
- **Types/Interfaces**: PascalCase (`Recipe`, `CreateRecipeInput`)

### File Organization

```typescript
// 1. Imports (external first, then internal)
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 3. Constants
const DEFAULT_VALUE = 10;

// 4. Component/Function
export function MyComponent({ title }: MyComponentProps) {
  // ...
}
```

### Styling with Tailwind

- **Mobile-first**: Start with base styles, add responsive modifiers
- **Utility classes**: Use Tailwind utilities, avoid custom CSS
- **cn() helper**: Merge classes conditionally

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className // Accept className prop for composability
)} />
```

### Code Quality Tools

**ESLint:**
```bash
pnpm lint
```

**Prettier:**
```bash
pnpm prettier --write .
```

**Type Checking:**
```bash
pnpm type-check
```

---

## Common Patterns

### Protected Page

```typescript
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.householdId) {
    redirect('/dashboard?error=no-household');
  }

  // Render page
  return <div>Protected content</div>;
}
```

### Database Query (Drizzle ORM)

```typescript
import { db } from '@/lib/db';
import { recipes, recipeIngredients, ingredients } from '@/lib/db/schema';
import { eq, and, like } from 'drizzle-orm';

// Single record
const [recipe] = await db
  .select()
  .from(recipes)
  .where(eq(recipes.id, recipeId))
  .limit(1);

// With join
const recipeWithIngredients = await db
  .select()
  .from(recipeIngredients)
  .innerJoin(
    ingredients,
    eq(recipeIngredients.ingredientId, ingredients.id)
  )
  .where(eq(recipeIngredients.recipeId, recipeId));

// Insert with returning
const [newRecipe] = await db
  .insert(recipes)
  .values({
    title: 'New Recipe',
    householdId,
    servings: 4,
    instructions: ['Step 1', 'Step 2'],
    createdBy: userId,
  })
  .returning();

// Update
await db
  .update(recipes)
  .set({ title: 'Updated Title', updatedAt: new Date() })
  .where(eq(recipes.id, recipeId));

// Delete
await db
  .delete(recipes)
  .where(eq(recipes.id, recipeId));
```

### Client Component with Form

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { mySchema } from '@/lib/validations/my-schema';
import type { z } from 'zod';

type FormData = z.infer<typeof mySchema>;

export function MyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(mySchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch('/api/my-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      toast({
        title: 'Success',
        description: 'Data saved successfully',
      });

      router.push('/success-page');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register('fieldName')} placeholder="Enter value" />
        {errors.fieldName && (
          <span className="text-sm text-red-500">
            {errors.fieldName.message}
          </span>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

### Real-time Subscription (Supabase)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export function GroceryListWithRealtime({ listId }: { listId: string }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchItems();

    // Subscribe to changes
    const channel = supabase
      .channel(`grocery-list-${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'grocery_list_items',
          filter: `grocery_list_id=eq.${listId}`,
        },
        (payload) => {
          console.log('Change received!', payload);
          fetchItems(); // Refresh data
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [listId]);

  const fetchItems = async () => {
    const response = await fetch(`/api/grocery-lists/${listId}`);
    const data = await response.json();
    setItems(data.items);
  };

  return <div>{/* Render items */}</div>;
}
```

---

## Important Notes

### 1. Database Schema Changes

**⚠️ CRITICAL: Do NOT use Drizzle migrations for schema changes!**

- Schema is managed in **Supabase SQL Editor**
- `/src/lib/db/schema.ts` should **reflect** the Supabase schema, not drive it
- Update the schema file manually after making changes in Supabase
- This ensures consistency and avoids migration conflicts

### 2. NextAuth v5 Beta Issues

- Uses NextAuth v5 (beta) which has URL construction bugs on Vercel
- Custom `getSession()` implementation works around these issues
- **Always use `getSession()` from `/src/lib/auth` in pages**
- Use `auth()` in API routes (works fine there)

### 3. Household-Based Multi-Tenancy

- **ALL queries MUST filter by `householdId`**
- Never expose data across households
- Check household membership before any operation
- Users belong to ONE household

### 4. Real-time Features are Optional

- Supabase real-time is optional (app works without it)
- Only used for grocery list live updates
- Check if configured before using:
  ```typescript
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Enable real-time features
  }
  ```

### 5. Quantities are Nullable

- Recipe ingredients may not have quantities ("salt to taste")
- Pantry items may be tracked without specific amounts
- Always handle `null` quantities gracefully
- Decimal quantities stored as strings in DB

### 6. Recipe Instructions as Array

- Stored as PostgreSQL text array
- NOT a single text field
- Each step is a separate array element
- Allows for step-by-step cooking mode

### 7. Image Upload Flow

1. Client uploads to `/api/upload` (Vercel Blob)
2. API returns public URL
3. Client includes URL in recipe creation/update
4. URL stored in `imageUrl` field

### 8. Ingredient Autocomplete

- Use `/api/ingredients/search?q=query` endpoint
- Returns matching ingredients from database
- Always reference by `ingredientId`, not free text
- Ensures consistency across recipes and pantry

### 9. Error Handling Patterns

- Zod validation errors → 400 with details
- Authentication failures → 401
- Authorization failures → 403
- Not found → 404
- Unexpected errors → 500 (log but don't expose details)

### 10. Testing Best Practices

- Mock external dependencies (database, auth)
- Test business logic in isolation
- E2E tests for critical user flows
- Maintain 80%+ code coverage
- Use test database for E2E tests

---

## Quick Reference

### Key Files

```
Database Schema:       /src/lib/db/schema.ts
Auth Config:           /src/lib/auth/config.ts
Custom getSession:     /src/lib/auth/index.ts
API Helpers:           /src/lib/api/utils.ts
Recipe Helpers:        /src/lib/recipe/helpers.ts (includes search)
Recipe Matching:       /src/lib/recipe-matching.ts
Grocery Generator:     /src/lib/grocery-list-generator.ts
Ingredient Parser:     /src/lib/recipe-scraper/ingredient-parser.ts
Validations:           /src/lib/validations/
Constants:             /src/lib/constants/
Test Setup:            /test/setup.ts
```

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."

# Optional
NEXTAUTH_URL="http://localhost:3000"  # Auto-set on Vercel
BLOB_READ_WRITE_TOKEN="..."
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Common Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Build production
pnpm test             # Unit tests
pnpm test:e2e         # E2E tests
pnpm lint             # Lint code
pnpm type-check       # TypeScript check
```

---

## Getting Help

- **Documentation**: See `/docs` directory for API docs
- **PRD**: See `recipe-pantry-tracker-PRD.md` for product requirements
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md`
- **Issues**: Check `.github-issues/` directory for known issues

---

**Last Updated:** 2025-11-24

This documentation is maintained for AI assistants working on this codebase. When making significant changes, please update this file to keep it current.
