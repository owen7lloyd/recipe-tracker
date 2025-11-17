# Implementation Plan
## Recipe & Pantry Tracker Application

**Version:** 1.0
**Based on:** recipe-pantry-tracker-PRD.md
**Last Updated:** November 2025

---

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Setup](#project-setup)
4. [Phase 1: Foundation](#phase-1-foundation)
5. [Phase 2: Core Features](#phase-2-core-features)
6. [Phase 3: Grocery Lists](#phase-3-grocery-lists)
7. [Phase 4: Polish & Deploy](#phase-4-polish--deploy)
8. [Phase 5: Mobile & Enhancements](#phase-5-mobile--enhancements)
9. [Testing Strategy](#testing-strategy)
10. [Deployment Strategy](#deployment-strategy)

---

## Overview

This implementation plan breaks down the Recipe & Pantry Tracker application into actionable development phases. Each phase builds upon the previous, allowing for iterative development and early testing.

### Development Approach
- **Agile/Iterative**: Build in small increments with frequent testing
- **API-First**: Design and implement backend endpoints before frontend
- **Test-Driven**: Write tests alongside features
- **Mobile-Friendly**: Responsive web design from day one

### Timeline Summary
- **Phase 1**: Weeks 1-3 (Foundation)
- **Phase 2**: Weeks 4-6 (Core Features)
- **Phase 3**: Weeks 7-8 (Grocery Lists)
- **Phase 4**: Weeks 9-10 (Polish & Deploy)
- **Phase 5**: Weeks 11-14 (Mobile & Enhancements)

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router with TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)

### Backend
- **Platform**: Vercel (Serverless Functions)
- **Database**: PostgreSQL via Vercel Postgres or Supabase
- **ORM**: Drizzle ORM or Prisma
- **Authentication**: NextAuth.js v5
- **File Storage**: Vercel Blob Storage
- **Real-time**: Supabase Realtime or Pusher

### Development Tools
- **Version Control**: Git + GitHub
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Vitest (unit), Playwright (E2E)
- **CI/CD**: GitHub Actions

### Third-Party Services
- **Recipe Scraping**: Custom implementation with cheerio + recipe-schema parser
- **Email**: Resend or SendGrid (for invitations)
- **Analytics**: Vercel Analytics (optional)

---

## Project Setup

### Initial Setup Tasks
1. **Repository & Environment**
   - Initialize Next.js 14 project with TypeScript
   - Configure Tailwind CSS
   - Set up ESLint & Prettier
   - Configure environment variables (.env.local, .env.example)
   - Set up Git hooks with Husky

2. **Database Setup**
   - Choose between Vercel Postgres or Supabase
   - Initialize ORM (Drizzle/Prisma)
   - Create initial schema file
   - Set up migrations system

3. **Project Structure**
   ```
   /src
     /app                 # Next.js app router pages
       /(auth)            # Auth pages (login, register)
       /(dashboard)       # Protected dashboard routes
       /api               # API routes
     /components          # React components
       /ui                # shadcn/ui components
       /features          # Feature-specific components
     /lib                 # Utilities & helpers
       /db                # Database client & queries
       /auth              # Auth configuration
       /validations       # Zod schemas
     /hooks               # Custom React hooks
     /types               # TypeScript type definitions
     /store               # Zustand stores
   /public                # Static assets
   /prisma or /drizzle    # Database schema & migrations
   ```

4. **Development Workflow**
   - Set up GitHub Issues templates
   - Create PR template
   - Configure GitHub Actions for CI
   - Set up local development database

---

## Phase 1: Foundation (Weeks 1-3)

**Goal**: Establish core infrastructure with authentication, household management, basic recipe CRUD, and simple pantry management.

### 1.1 Database Schema Setup

**Tasks:**
- Design and implement database schema based on PRD models
- Create migration files
- Seed initial data (ingredient categories, common ingredients)

**Database Tables:**
```sql
-- Core tables
users
households
household_members (junction table)
recipes
recipe_ingredients
ingredients
pantry_items
grocery_lists
grocery_list_items

-- Supporting tables
ingredient_substitutions
sessions (for auth)
```

**Key Indexes:**
- `recipes.household_id`
- `pantry_items.household_id`
- `ingredients.name` (for autocomplete)
- `recipe_ingredients.recipe_id`

### 1.2 Authentication System

**Tasks:**
- Configure NextAuth.js with credentials provider
- Implement user registration endpoint
- Implement login/logout functionality
- Create protected route middleware
- Build auth UI components (login, register forms)

**API Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

**Components:**
- `LoginForm`
- `RegisterForm`
- `AuthGuard` (HOC or middleware)

**Security:**
- Password hashing with bcrypt
- Session management with JWT
- CSRF protection
- Rate limiting on auth endpoints

### 1.3 Household Management

**Tasks:**
- Create household CRUD operations
- Implement household creation during registration
- Build invite system (generate unique codes/links)
- Create join household functionality
- Implement household member management UI

**API Endpoints:**
- `POST /api/households`
- `GET /api/households/:id`
- `PUT /api/households/:id`
- `POST /api/households/:id/invite`
- `POST /api/households/join`
- `DELETE /api/households/:id/members/:userId`

**Components:**
- `HouseholdSettings`
- `InviteMemberModal`
- `MembersList`
- `JoinHouseholdForm`

**Business Logic:**
- Generate unique 8-character invite codes
- Invite links expire after 7 days
- Validate user can only belong to one household
- Household creator becomes admin

### 1.4 Basic Recipe Management

**Tasks:**
- Implement recipe CRUD API endpoints
- Create recipe form validation schemas
- Build recipe creation/edit form
- Create recipe list view
- Build recipe detail view
- Implement image upload for recipes

**API Endpoints:**
- `GET /api/recipes` (list with filters)
- `POST /api/recipes`
- `GET /api/recipes/:id`
- `PUT /api/recipes/:id`
- `DELETE /api/recipes/:id`

**Components:**
- `RecipeForm` (create/edit)
- `RecipeList`
- `RecipeCard`
- `RecipeDetail`
- `ImageUpload`

**Features:**
- Form validation with Zod
- Support all recipe fields from PRD
- Image upload to Vercel Blob
- Rich text editor for instructions (or simple textarea)
- Tags and categories

### 1.5 Simple Pantry Management

**Tasks:**
- Implement pantry CRUD operations
- Build ingredient autocomplete system
- Create pantry list UI
- Implement quick add functionality
- Build bulk edit/delete features

**API Endpoints:**
- `GET /api/pantry`
- `POST /api/pantry/items`
- `PUT /api/pantry/items/:id`
- `DELETE /api/pantry/items/:id`
- `POST /api/pantry/bulk-update`
- `GET /api/ingredients/search?q=`

**Components:**
- `PantryList`
- `PantryItemForm`
- `IngredientAutocomplete`
- `BulkEditModal`

**Business Logic:**
- Ingredient autocomplete with fuzzy search
- Optional quantity/unit tracking
- Default to "available" if no quantity specified
- Prevent duplicate ingredients in pantry

### Phase 1 Deliverables
- [ ] Working authentication system
- [ ] Users can create/join households
- [ ] Users can create, edit, delete recipes manually
- [ ] Users can manage pantry inventory
- [ ] Basic responsive UI
- [ ] All features work on mobile browsers

---

## Phase 2: Core Features (Weeks 4-6)

**Goal**: Implement recipe web scraping, scaling, pantry-recipe matching with substitutions, and "cook recipe" functionality.

### 2.1 Recipe Web Import/Scraping

**Tasks:**
- Implement recipe scraper for schema.org JSON-LD
- Add fallback HTML parsing for common recipe sites
- Create import preview/edit flow
- Handle parsing errors gracefully
- Add URL validation and sanitization

**API Endpoints:**
- `POST /api/recipes/import`
  - Input: `{ url: string }`
  - Output: `{ recipe: ParsedRecipe, source: 'schema' | 'html' }`

**Components:**
- `RecipeImportModal`
- `ImportPreview` (editable form with parsed data)

**Implementation Details:**
- Use cheerio for HTML parsing
- Try schema.org JSON-LD first (most reliable)
- Fallback to Open Graph tags
- Fallback to common CSS selectors for popular sites
- Extract: title, ingredients, instructions, times, servings, image
- Normalize ingredient formats (quantity, unit, name)

**Error Handling:**
- Invalid URL
- URL not accessible
- No recipe data found
- Partial data found (allow manual completion)

### 2.2 Recipe Scaling

**Tasks:**
- Implement scaling algorithm
- Add serving size selector to recipe view
- Update ingredient quantities dynamically
- Persist scaled quantities through grocery list generation
- Handle edge cases (fractions, ranges, text quantities)

**API Endpoints:**
- `GET /api/recipes/:id/scale?servings=6`
  - Returns scaled recipe

**Components:**
- `ServingScaler` (stepper component)
- Update `RecipeDetail` to show scaled quantities

**Business Logic:**
- Calculate scale factor: `newServings / originalServings`
- Multiply all ingredient quantities by factor
- Format fractions nicely (1.5 → 1 ½)
- Handle "to taste" and other non-numeric quantities
- Round to reasonable precision

### 2.3 Ingredient Substitution System

**Tasks:**
- Create substitution rules database
- Implement substitution matching logic
- Build substitution configuration UI (admin)
- Display substitutions in recipe matching

**Database:**
```sql
CREATE TABLE ingredient_substitutions (
  id UUID PRIMARY KEY,
  ingredient_id UUID REFERENCES ingredients(id),
  substitute_id UUID REFERENCES ingredients(id),
  ratio DECIMAL DEFAULT 1.0,
  notes TEXT
);
```

**Seed Data:**
- Butter ↔ Oil (1:1)
- Milk types (whole ↔ 2% ↔ skim ↔ oat ↔ almond)
- Sugar types (white ↔ brown ↔ honey)
- Flour types
- Egg substitutes
- Fresh ↔ dried herbs (1:3)

**API Endpoints:**
- `GET /api/ingredients/:id/substitutes`

**Business Logic:**
- Bidirectional substitutions
- Apply ratio when calculating quantities
- Consider substitution chains (A→B, B→C means A→C)

### 2.4 Recipe Matching ("What Can I Cook?")

**Tasks:**
- Implement recipe matching algorithm
- Create "What Can I Cook?" view
- Add visual indicators for cookable recipes
- Filter recipes by availability
- Consider substitutions in matching

**API Endpoints:**
- `GET /api/recipes/available`
  - Returns recipes cookable with current pantry

**Components:**
- `AvailableRecipes` page/view
- `AvailabilityBadge` (on recipe cards)

**Algorithm:**
```typescript
function isRecipeCookable(recipe: Recipe, pantry: PantryItem[]): boolean {
  for (const recipeIngredient of recipe.ingredients) {
    if (recipeIngredient.optional) continue;

    const hasIngredient = pantry.some(item =>
      item.ingredient_id === recipeIngredient.ingredient_id &&
      (!item.quantity || item.quantity >= recipeIngredient.quantity)
    );

    if (!hasIngredient) {
      const hasSubstitute = checkSubstitutes(recipeIngredient, pantry);
      if (!hasSubstitute) return false;
    }
  }
  return true;
}
```

**Features:**
- Show all cookable recipes
- Sort by: newest, rating, recently cooked
- Filter by category, prep time
- Show "missing X ingredients" for near-matches

### 2.5 Cook Recipe Feature

**Tasks:**
- Implement "cook recipe" endpoint
- Update pantry quantities automatically
- Handle partial quantities
- Add confirmation modal
- Track cooking history (optional)

**API Endpoints:**
- `POST /api/recipes/:id/cook`
  - Input: `{ servings?: number, adjustments?: IngredientAdjustment[] }`
  - Output: `{ success: boolean, pantryUpdates: PantryUpdate[] }`

**Components:**
- `CookRecipeButton`
- `CookConfirmationModal` (shows what will be deducted)

**Business Logic:**
```typescript
function cookRecipe(recipe: Recipe, servings: number) {
  const scaleFactor = servings / recipe.servings;

  for (const ingredient of recipe.ingredients) {
    const quantityNeeded = ingredient.quantity * scaleFactor;
    const pantryItem = findPantryItem(ingredient.ingredient_id);

    if (pantryItem.quantity) {
      pantryItem.quantity -= quantityNeeded;
      if (pantryItem.quantity <= 0) {
        removePantryItem(pantryItem);
      } else {
        updatePantryItem(pantryItem);
      }
    }
  }
}
```

**Edge Cases:**
- Not enough quantity in pantry (warn user)
- Pantry item has no quantity tracked (don't remove)
- Allow manual adjustments before confirming

### Phase 2 Deliverables
- [ ] Users can import recipes from URLs
- [ ] Recipe scaling works accurately
- [ ] "What Can I Cook?" shows correct results
- [ ] Substitutions work in recipe matching
- [ ] Cooking a recipe updates pantry
- [ ] All features tested with real data

---

## Phase 3: Grocery Lists (Weeks 7-8)

**Goal**: Implement grocery list generation from recipes, organization by category, household sharing, and real-time sync.

### 3.1 Grocery List Generation

**Tasks:**
- Implement list generation algorithm
- Create recipe selection interface
- Build grocery list view
- Add manual item addition/removal
- Implement quantity combining logic

**API Endpoints:**
- `POST /api/grocery-lists/generate`
  - Input: `{ recipeIds: string[], servings?: Record<string, number> }`
  - Output: `{ list: GroceryList }`
- `GET /api/grocery-lists`
- `POST /api/grocery-lists`
- `GET /api/grocery-lists/:id`
- `PUT /api/grocery-lists/:id`
- `DELETE /api/grocery-lists/:id`

**Components:**
- `RecipeSelector` (multi-select recipes)
- `GroceryListView`
- `GroceryListItem`
- `AddManualItem`

**Algorithm:**
```typescript
function generateGroceryList(recipes: Recipe[], pantry: PantryItem[]) {
  const needed = new Map<string, GroceryListItem>();

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const pantryItem = findPantryItem(ingredient.ingredient_id);
      const inPantry = pantryItem?.quantity || 0;
      const required = ingredient.quantity;
      const stillNeeded = Math.max(0, required - inPantry);

      if (stillNeeded > 0) {
        if (needed.has(ingredient.ingredient_id)) {
          // Combine quantities
          const existing = needed.get(ingredient.ingredient_id);
          existing.quantity += stillNeeded;
        } else {
          needed.set(ingredient.ingredient_id, {
            ingredient_id: ingredient.ingredient_id,
            quantity: stillNeeded,
            unit: ingredient.unit,
            category: getIngredientCategory(ingredient.ingredient_id),
            checked: false,
            recipe_sources: [recipe.id]
          });
        }
      }
    }
  }

  return Array.from(needed.values());
}
```

**Features:**
- Exclude items already in pantry
- Combine quantities for shared ingredients
- Track which recipes need each ingredient
- Allow manual additions

### 3.2 List Organization

**Tasks:**
- Implement category-based sorting
- Add custom category ordering
- Create drag-and-drop reordering
- Implement check/uncheck functionality
- Add category filters

**Components:**
- `GroceryListCategories`
- `CategorySection`
- `DraggableListItem`

**Categories (from PRD Appendix C):**
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

**Features:**
- Auto-categorize based on ingredient category
- Allow custom category order per household
- Persist checked state
- Show/hide checked items

### 3.3 List Sharing & Real-time Sync

**Tasks:**
- Implement real-time sync with Supabase or Pusher
- Create shareable link generation
- Build read-only shared view
- Add real-time updates for household members
- Track who checked items

**API Endpoints:**
- `POST /api/grocery-lists/:id/share`
  - Output: `{ shareLink: string, token: string }`
- `GET /api/grocery-lists/shared/:token` (public)

**Real-time Setup:**
```typescript
// Using Supabase Realtime
supabase
  .channel(`grocery_list:${listId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'grocery_list_items',
    filter: `grocery_list_id=eq.${listId}`
  }, (payload) => {
    updateLocalState(payload);
  })
  .subscribe();
```

**Components:**
- `ShareListButton`
- `ShareLinkModal`
- `SharedListView` (read-only for non-members)

**Features:**
- Generate unique shareable token
- Expire shared links after 30 days
- Show who checked each item
- Real-time updates for all household members
- Optimistic UI updates

### 3.4 List Management

**Tasks:**
- Implement list archive/delete
- Add list templates (common items)
- Create list history
- Build "add to new list" from recipe

**Features:**
- Save lists for reuse
- Duplicate lists
- Clear all checked items
- Add remaining items to pantry after shopping

### Phase 3 Deliverables
- [ ] Generate grocery lists from recipes
- [ ] Lists organized by category
- [ ] Real-time sync between household members
- [ ] Shareable links work
- [ ] Check/uncheck items with attribution
- [ ] Mobile-optimized shopping experience

---

## Phase 4: Polish & Deploy (Weeks 9-10)

**Goal**: Refine UI/UX, optimize performance, comprehensive testing, and deploy to production.

### 4.1 UI/UX Refinements

**Tasks:**
- Conduct usability testing
- Improve mobile responsiveness
- Add loading states and skeletons
- Implement error boundaries
- Add toast notifications
- Create empty states
- Improve form validation feedback
- Add keyboard shortcuts
- Implement dark mode (optional)

**Components to Polish:**
- `RecipeCard` - better image handling, loading states
- `RecipeDetail` - better layout, print-friendly
- `PantryList` - better bulk actions
- `GroceryListView` - swipe actions on mobile

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast
- Touch target sizes (44x44pts minimum)

### 4.2 Performance Optimization

**Tasks:**
- Implement code splitting
- Optimize images (Next.js Image)
- Add database query optimization
- Implement caching strategy
- Add CDN for static assets
- Optimize bundle size
- Implement lazy loading
- Add service worker for PWA

**Performance Targets:**
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- API responses < 500ms

**Optimizations:**
- Database indexes on all foreign keys
- Redis cache for frequent queries (optional)
- Image optimization and lazy loading
- Route prefetching
- Static generation where possible

### 4.3 Testing

**Tasks:**
- Write unit tests for business logic
- Create integration tests for API endpoints
- Implement E2E tests for critical flows
- Add visual regression tests (optional)
- Perform load testing
- Security audit

**Unit Tests (Vitest):**
- Recipe scaling logic
- Ingredient matching algorithm
- Grocery list generation
- Substitution logic
- Unit conversions

**Integration Tests:**
- Auth endpoints
- Recipe CRUD
- Pantry operations
- Grocery list generation

**E2E Tests (Playwright):**
1. User registration → create household → invite member
2. Add recipe → view → edit → delete
3. Import recipe from URL → save
4. Add pantry items → check "what can I cook?" → cook recipe
5. Select recipes → generate list → share → check items
6. Concurrent editing by two household members

**Test Coverage Target:** 80%+

### 4.4 Deployment

**Tasks:**
- Set up production database
- Configure environment variables
- Set up Vercel project
- Configure domain (if custom)
- Set up SSL certificates
- Configure CI/CD pipeline
- Set up error tracking (Sentry)
- Configure analytics
- Create backup strategy

**Vercel Configuration:**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "NEXTAUTH_URL": "@nextauth-url"
  }
}
```

**CI/CD Pipeline (GitHub Actions):**
- Run tests on PR
- Type checking
- Linting
- Build verification
- Auto-deploy to preview on PR
- Deploy to production on merge to main

**Monitoring:**
- Error tracking with Sentry
- Performance monitoring with Vercel Analytics
- Database monitoring
- Uptime monitoring

### 4.5 Documentation

**Tasks:**
- Write user documentation
- Create API documentation
- Document deployment process
- Create contributing guidelines
- Write troubleshooting guide

**Documentation Files:**
- `README.md` - Project overview, setup instructions
- `CONTRIBUTING.md` - Development guidelines
- `API.md` - API endpoint documentation
- `DEPLOYMENT.md` - Deployment procedures
- `USER_GUIDE.md` - End-user documentation

### Phase 4 Deliverables
- [ ] Production-ready application
- [ ] All tests passing
- [ ] Performance targets met
- [ ] Deployed to Vercel
- [ ] Error tracking configured
- [ ] Documentation complete
- [ ] Ready for user onboarding

---

## Phase 5: Mobile & Enhancements (Weeks 11-14)

**Goal**: Build iOS application and implement nice-to-have features.

### 5.1 iOS Application

**Decision Point:** React Native vs Native Swift
- **React Native**: Faster development, code sharing with web
- **Native Swift**: Better performance, native feel

**Recommended:** Start with PWA, then React Native if needed

**PWA Tasks:**
- Add manifest.json
- Implement service worker
- Add offline functionality
- Add install prompt
- Test on iOS Safari
- Optimize for iOS gestures

**React Native Tasks (if pursued):**
- Set up React Native project
- Set up shared code (API layer, business logic)
- Implement navigation
- Build core screens
- Implement native features (camera, notifications)
- Test on iOS devices
- Submit to App Store

### 5.2 Barcode Scanning

**Tasks:**
- Integrate Open Food Facts API
- Implement barcode scanner (react-native-camera or web API)
- Add product lookup
- Map products to ingredients
- Quick add to pantry from scan

**API Integration:**
```typescript
async function lookupBarcode(barcode: string) {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
  );
  const data = await response.json();
  return {
    name: data.product.product_name,
    brand: data.product.brands,
    category: data.product.categories,
    image: data.product.image_url
  };
}
```

### 5.3 Recipe Photo Import

**Tasks:**
- Implement image upload
- Integrate OCR service (Tesseract.js or cloud service)
- Parse recipe text from image
- Use AI to structure data (optional: GPT-4 Vision)
- Allow manual editing of extracted data

**Implementation:**
- Use GPT-4 Vision API for best results
- Fallback to Tesseract.js for cost savings
- Extract: title, ingredients, instructions
- Present in editable form

### 5.4 Meal Planning Calendar

**Tasks:**
- Create calendar component
- Implement recipe scheduling
- Add drag-and-drop planning
- Generate shopping lists from calendar
- Add notifications/reminders

**Components:**
- `MealCalendar`
- `CalendarDayView`
- `RecipeDragItem`

**Features:**
- Weekly/monthly view
- Drag recipes to days
- Multiple meals per day
- Generate shopping list for week
- Copy previous weeks

### 5.5 Additional Enhancements

**Shopping History:**
- Track purchased items over time
- Suggest frequently bought items
- Auto-add staples to lists

**Nutritional Information:**
- Calculate nutrition from ingredients
- Use USDA nutrition database
- Display per serving
- Track daily nutrition goals

**Cost Tracking:**
- Add prices to ingredients
- Estimate recipe costs
- Track spending over time
- Budget alerts

### Phase 5 Deliverables
- [ ] iOS app published (or PWA optimized for iOS)
- [ ] Barcode scanning working
- [ ] Recipe photo import functional
- [ ] Meal planning calendar complete
- [ ] At least 2 additional enhancements shipped
- [ ] User feedback collected and prioritized

---

## Testing Strategy

### Unit Testing
**Framework:** Vitest

**Test Coverage:**
- All utility functions
- Business logic functions
- Data transformations
- Validation schemas

**Example Tests:**
```typescript
describe('Recipe Scaling', () => {
  it('should scale recipe quantities correctly', () => {
    const recipe = createRecipe({ servings: 4 });
    const scaled = scaleRecipe(recipe, 6);
    expect(scaled.ingredients[0].quantity).toBe(1.5);
  });
});

describe('Recipe Matching', () => {
  it('should find cookable recipes', () => {
    const recipes = [recipe1, recipe2];
    const pantry = [item1, item2];
    const cookable = findCookableRecipes(recipes, pantry);
    expect(cookable).toContain(recipe1);
  });
});
```

### Integration Testing
**Framework:** Vitest + Supertest

**Test Coverage:**
- All API endpoints
- Database operations
- Authentication flows
- Authorization checks

**Example Tests:**
```typescript
describe('POST /api/recipes', () => {
  it('should create a recipe', async () => {
    const response = await request(app)
      .post('/api/recipes')
      .set('Cookie', authCookie)
      .send(recipeData);
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Recipe');
  });

  it('should reject unauthenticated requests', async () => {
    const response = await request(app)
      .post('/api/recipes')
      .send(recipeData);
    expect(response.status).toBe(401);
  });
});
```

### E2E Testing
**Framework:** Playwright

**Critical Flows:**
1. **User Onboarding**
   - Register → Create household → Invite member → Accept invite

2. **Recipe Management**
   - Import recipe → Edit → Scale → Delete

3. **Pantry to Cooking**
   - Add pantry items → View cookable recipes → Cook → Verify pantry updated

4. **Shopping Flow**
   - Select recipes → Generate list → Share → Check items on mobile

5. **Concurrent Editing**
   - Two users edit same grocery list simultaneously

**Example Test:**
```typescript
test('complete shopping flow', async ({ page, context }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name=email]', 'user@example.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');

  // Select recipes
  await page.goto('/recipes');
  await page.click('[data-recipe-id="1"] input[type=checkbox]');
  await page.click('[data-recipe-id="2"] input[type=checkbox]');

  // Generate list
  await page.click('button:has-text("Generate Shopping List")');
  await expect(page.locator('.grocery-list-item')).toHaveCount(12);

  // Check items
  await page.click('.grocery-list-item:first-child input[type=checkbox]');
  await expect(page.locator('.grocery-list-item.checked')).toHaveCount(1);
});
```

### Performance Testing
**Tools:** k6 or Artillery

**Scenarios:**
- 100 concurrent users browsing recipes
- 50 users generating grocery lists simultaneously
- Real-time sync with 10 household members

**Example k6 Test:**
```javascript
export default function () {
  const response = http.get('https://app.example.com/api/recipes');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

---

## Deployment Strategy

### Environments

1. **Development** (`localhost:3000`)
   - Local development
   - Local database
   - Hot reload

2. **Preview** (Vercel preview deployments)
   - Auto-deployed on PR
   - Preview database
   - Full feature testing

3. **Staging** (`staging.example.com`)
   - Mirror of production
   - Production-like database (anonymized data)
   - Final testing before production

4. **Production** (`app.example.com`)
   - Live application
   - Production database
   - Monitoring and alerts

### Deployment Process

**Automated via GitHub Actions:**

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migrations

**Strategy:** Automated migrations with manual approval for production

```bash
# Development
pnpm db:migrate

# Production (via GitHub Actions)
# Requires manual approval
pnpm db:migrate:production
```

### Rollback Plan

1. **Code Rollback:**
   - Vercel instant rollback to previous deployment
   - One-click from Vercel dashboard

2. **Database Rollback:**
   - Maintain migration rollback scripts
   - Daily automated backups
   - Point-in-time recovery available

3. **Disaster Recovery:**
   - Database backups stored for 30 days
   - Full application restore procedure documented
   - RTO (Recovery Time Objective): < 1 hour
   - RPO (Recovery Point Objective): < 15 minutes

### Monitoring & Alerts

**Tools:**
- Error tracking: Sentry
- Performance: Vercel Analytics
- Uptime: UptimeRobot or Pingdom
- Logs: Vercel Logs

**Alerts:**
- Error rate > 1% → Slack notification
- Response time > 2s → Email notification
- Uptime < 99.9% → SMS alert
- Database connection issues → Immediate alert

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] 100% of auth tests passing
- [ ] Users can create and join households
- [ ] 10+ recipes added manually
- [ ] 20+ pantry items tracked
- [ ] Mobile responsive on 3 devices tested

### Phase 2 Success Criteria
- [ ] Successfully import 10 recipes from different sources
- [ ] Recipe scaling accurate to 2 decimal places
- [ ] "What Can I Cook?" shows correct results in 95% of test cases
- [ ] Substitution logic works for 10+ common substitutions
- [ ] Pantry updates correctly after cooking

### Phase 3 Success Criteria
- [ ] Generate shopping lists in < 2 seconds
- [ ] Real-time sync latency < 1 second
- [ ] Shared links accessible without login
- [ ] Mobile shopping experience rated 4+ stars

### Phase 4 Success Criteria
- [ ] Lighthouse score > 90
- [ ] Test coverage > 80%
- [ ] Zero critical bugs in production
- [ ] Successful deployment with zero downtime
- [ ] 5+ users actively testing

### Phase 5 Success Criteria
- [ ] iOS app approved and published (or PWA install rate > 30%)
- [ ] Barcode scanning success rate > 85%
- [ ] Photo import success rate > 70%
- [ ] User retention > 60% week-over-week

---

## Risk Mitigation

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Recipe scraping breaks | High | High | Multiple parser strategies, manual fallback, regular monitoring |
| Real-time sync conflicts | Medium | Medium | Implement CRDT or last-write-wins with conflict UI |
| Database performance | Low | High | Proper indexing, query optimization, caching layer |
| Third-party API limits | Medium | Medium | Rate limiting, fallback options, cost monitoring |
| Mobile Safari compatibility | Low | Medium | Extensive iOS testing, PWA best practices |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low user adoption | Medium | High | Focus on single killer feature (recipe matching), early user feedback |
| Complex UX confuses users | Medium | High | User testing at each phase, simple defaults |
| Data loss concerns | Low | High | Automatic backups, export functionality, clear data retention policy |
| Privacy concerns | Low | Medium | Clear privacy policy, household-only data sharing, no selling data |

---

## Next Steps

### Immediate Actions
1. Set up development environment
2. Create GitHub repository
3. Initialize Next.js project
4. Set up database
5. Begin Phase 1 development

### Weekly Milestones
- **Week 1:** Project setup + Auth + Database
- **Week 2:** Household management + Basic recipe CRUD
- **Week 3:** Pantry management + Phase 1 testing
- **Week 4:** Recipe scraping + Scaling
- **Week 5:** Substitutions + Recipe matching
- **Week 6:** Cook recipe feature + Phase 2 testing
- **Week 7:** Grocery list generation
- **Week 8:** List sharing + Real-time sync + Phase 3 testing
- **Week 9:** UI/UX polish + Performance optimization
- **Week 10:** Testing + Deployment + Documentation
- **Weeks 11-14:** Mobile app + Enhancements

### Decision Points

**Week 3:** Evaluate Phase 1 progress
- Go/no-go for Phase 2
- Adjust timeline if needed

**Week 6:** Evaluate Phase 2 progress
- Assess recipe scraping success rate
- Decide on Phase 3 approach

**Week 8:** MVP readiness check
- Assess if ready for limited user testing
- Plan beta testing program

**Week 10:** Production readiness
- Final go/no-go decision
- Plan user onboarding

---

## Conclusion

This implementation plan provides a detailed roadmap for building the Recipe & Pantry Tracker application. By following the phased approach, we can:

1. Deliver value incrementally
2. Test early and often
3. Adjust based on user feedback
4. Maintain high code quality
5. Deploy with confidence

Each phase builds upon the previous, allowing for course corrections while maintaining momentum toward the final product vision outlined in the PRD.

**Remember:** This plan is a living document. Update it as you learn from development and user feedback. The goal is shipping a product users love, not rigidly following a plan.
