# Enhancement: Implement Complete E2E Test Suite

**Status**: Proposed
**Priority**: P2 (Medium)
**Effort**: 4-6 days
**Dependencies**: Testing infrastructure (completed in #16)

## Overview

Implement comprehensive end-to-end tests for all critical user flows. Currently, skeleton E2E tests exist but are skipped due to requiring test user setup, authentication flows, and test data management.

## Current State

- ✅ Playwright is set up and configured
- ✅ Basic smoke tests passing (3 tests)
- ✅ Skeleton tests created for critical flows
- ❌ 14 tests are skipped with `test.skip()` or `describe.skip()`
- ❌ No test user management
- ❌ No authentication helper setup
- ❌ No test data seeding for E2E

## Test Breakdown

### Currently Passing (3 tests)
```
✓ Smoke Tests › should load the homepage
✓ Smoke Tests › should have working navigation
✓ Authentication Flow › should load the homepage
```

### Currently Skipped (14 tests)

**Authentication (3 tests)**
- Should register a new user
- Should login existing user
- Should reject invalid credentials

**Recipe CRUD (5 tests)**
- Should create a new recipe
- Should view recipe details
- Should edit recipe
- Should delete recipe
- Should scale recipe servings

**Grocery Lists (6 tests)**
- Should generate grocery list from recipes
- Should check off items in grocery list
- Should share grocery list
- Should view shared grocery list
- Should organize items by store categories
- Should complete grocery list

## Implementation Plan

### Phase 1: Test User Management (Day 1)

**Tasks**:
- [ ] Create test user fixture in Playwright
- [ ] Set up test user creation/deletion
- [ ] Implement login helper
- [ ] Add session management

**Files to create**:
```typescript
// e2e/fixtures/auth.ts
import { test as base } from '@playwright/test'

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Login before test
    await page.goto('/login')
    await page.fill('[name=email]', process.env.TEST_USER_EMAIL)
    await page.fill('[name=password]', process.env.TEST_USER_PASSWORD)
    await page.click('button[type=submit]')
    await page.waitForURL('/dashboard')

    await use(page)

    // Cleanup after test
  }
})
```

**Environment variables**:
```env
TEST_USER_EMAIL=e2e-test@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### Phase 2: Test Data Management (Day 2)

**Tasks**:
- [ ] Create test data seeding script
- [ ] Add cleanup scripts for test data
- [ ] Create recipe fixtures
- [ ] Create pantry item fixtures
- [ ] Create grocery list fixtures

**Example fixture**:
```typescript
// e2e/fixtures/recipes.ts
export const testRecipes = {
  basic: {
    title: 'E2E Test Recipe',
    category: 'dinner',
    servings: 4,
    ingredients: [
      { name: 'Flour', quantity: '2', unit: 'cups' },
      { name: 'Sugar', quantity: '1', unit: 'cup' }
    ],
    instructions: [
      'Mix ingredients',
      'Bake at 350°F for 30 minutes'
    ]
  },
  // More fixtures...
}
```

### Phase 3: Authentication Tests (Day 3)

**Tests to implement**:
- [ ] User registration flow
  - Fill registration form
  - Create household
  - Verify redirect to dashboard
  - Verify user can see their household
- [ ] User login flow
  - Login with existing credentials
  - Verify session persists
  - Verify can access protected routes
- [ ] Invalid credentials handling
  - Show error message
  - Don't create session
  - Stay on login page

**Implementation approach**:
```typescript
test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    const uniqueEmail = `e2e-${Date.now()}@example.com`

    await page.goto('/register')
    await page.fill('[name=email]', uniqueEmail)
    await page.fill('[name=password]', 'TestPassword123!')
    await page.fill('[name=name]', 'E2E Test User')
    await page.fill('[name=householdName]', 'E2E Household')

    await page.click('button[type=submit]')

    // Verify redirected to dashboard
    await expect(page).toHaveURL('/dashboard')

    // Verify household name is visible
    await expect(page.locator('text=E2E Household')).toBeVisible()

    // Cleanup: Delete test user
    // (implement cleanup logic)
  })
})
```

### Phase 4: Recipe CRUD Tests (Days 4-5)

**Tests to implement**:
- [ ] Create recipe
  - Fill form with all fields
  - Add multiple ingredients
  - Add multiple instructions
  - Upload image (optional)
  - Verify recipe saved
  - Verify appears in recipe list
- [ ] View recipe details
  - Navigate to recipe
  - Verify all fields displayed
  - Verify ingredients shown
  - Verify instructions shown
- [ ] Edit recipe
  - Update title
  - Add/remove ingredients
  - Update instructions
  - Verify changes saved
- [ ] Delete recipe
  - Click delete button
  - Confirm deletion
  - Verify removed from list
- [ ] Scale recipe
  - Change serving size
  - Verify quantities update
  - Verify fractions display correctly

**Setup approach**:
```typescript
test.describe('Recipe Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Already logged in via fixture
    await authenticatedPage.goto('/dashboard/recipes')
  })

  test('should create a new recipe', async ({ authenticatedPage: page }) => {
    await page.click('button:has-text("Add Recipe")')

    // Fill form
    await page.fill('[name=title]', 'E2E Test Recipe')
    // ... more form filling

    await page.click('button:has-text("Save Recipe")')

    // Verify
    await expect(page.locator('text=Recipe saved')).toBeVisible()
  })
})
```

### Phase 5: Grocery List Tests (Day 6)

**Tests to implement**:
- [ ] Generate grocery list
  - Select multiple recipes
  - Generate list
  - Verify ingredients combined
  - Verify pantry items deducted
- [ ] Check off items
  - Click checkbox
  - Verify item marked
  - Verify progress updates
- [ ] Share list
  - Click share button
  - Copy share link
  - Open in new context
  - Verify can view
- [ ] Real-time collaboration
  - Open same list in two contexts
  - Check item in one
  - Verify updates in other
- [ ] Category organization
  - Verify items grouped by category
  - Verify categories in order
- [ ] Complete list
  - Mark all items checked
  - Mark list complete
  - Verify moved to completed

### Phase 6: Additional E2E Tests (Future)

**Other flows to test**:
- [ ] Pantry management (add, update, delete items)
- [ ] Recipe import from URL
- [ ] Recipe matching (what can I cook?)
- [ ] Cook recipe flow (pantry deduction)
- [ ] Household management (invite, join, remove members)
- [ ] Settings and preferences
- [ ] Mobile responsive views
- [ ] Accessibility features

## Test Utilities Needed

### Authentication Helper
```typescript
// e2e/helpers/auth.ts
export async function loginAsTestUser(page: Page) {
  await page.goto('/login')
  await page.fill('[name=email]', TEST_USER_EMAIL)
  await page.fill('[name=password]', TEST_USER_PASSWORD)
  await page.click('button[type=submit]')
  await page.waitForURL('/dashboard')
}

export async function createTestUser() {
  // Create user via API or UI
  const email = `test-${Date.now()}@example.com`
  // ...
  return { email, password, userId, householdId }
}
```

### Data Helpers
```typescript
// e2e/helpers/data.ts
export async function createTestRecipe(page: Page, recipe: RecipeInput) {
  await page.goto('/dashboard/recipes/new')
  // Fill form and save
  return recipeId
}

export async function cleanupTestData(householdId: string) {
  // Delete test data for household
}
```

### Assertion Helpers
```typescript
// e2e/helpers/assertions.ts
export async function expectRecipeVisible(page: Page, title: string) {
  await expect(page.locator(`[data-testid=recipe-card]:has-text("${title}")`)).toBeVisible()
}

export async function expectToast(page: Page, message: string) {
  await expect(page.locator(`[role=status]:has-text("${message}")`)).toBeVisible()
}
```

## Configuration Updates

### Playwright Config
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',

    // Take screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on retry
    video: 'retain-on-failure',

    // Trace on failure
    trace: 'retain-on-failure',
  },

  // Global setup/teardown
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),
})
```

### Global Setup
```typescript
// e2e/global-setup.ts
export default async function globalSetup() {
  // Create test user
  // Seed test data
  // Set up test database
}
```

### Global Teardown
```typescript
// e2e/global-teardown.ts
export default async function globalTeardown() {
  // Delete test user
  // Clean up test data
}
```

## Test Data Strategy

### Option 1: Database Seeding
- Seed database before tests
- Use known test data
- Fast and predictable
- Requires database access

### Option 2: UI-Based Setup
- Create data through UI
- More realistic
- Slower
- Tests entire flow

### Option 3: API-Based Setup
- Create data via API calls
- Fast
- Requires API helpers
- Good middle ground

**Recommended**: Combination of API (for setup) + UI (for verification)

## CI/CD Integration

Update `.github/workflows/test.yml`:
```yaml
test-e2e:
  name: E2E Tests
  runs-on: ubuntu-latest

  steps:
    # ... setup steps

    - name: Create test user
      run: pnpm run test:e2e:setup

    - name: Run E2E tests
      run: pnpm test:e2e

    - name: Upload Playwright report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

## Acceptance Criteria

- [ ] All 14 skipped tests are implemented and passing
- [ ] No `test.skip()` or `describe.skip()` in E2E tests
- [ ] Tests run in CI/CD pipeline
- [ ] Test user management automated
- [ ] Test data cleanup works reliably
- [ ] Screenshots/videos on failure
- [ ] Tests complete in < 5 minutes
- [ ] Documentation updated with E2E examples

## Success Metrics

- ✅ 0 skipped E2E tests (currently 14)
- ✅ All critical user flows tested
- ✅ Tests pass consistently (no flaky tests)
- ✅ Test execution time < 5 minutes
- ✅ Visual artifacts (screenshots/videos) on failure

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Flaky tests | Use proper waits, not timeouts |
| Slow execution | Run in parallel, optimize setup |
| Test data conflicts | Unique identifiers per test run |
| Authentication issues | Robust login helper with retries |
| Real-time sync timing | Use waitFor with proper conditions |

## Files to Create/Modify

### New Files
```
e2e/
├── fixtures/
│   ├── auth.ts           # Authentication fixtures
│   ├── recipes.ts        # Recipe test data
│   └── grocery.ts        # Grocery list test data
├── helpers/
│   ├── auth.ts           # Login/logout helpers
│   ├── data.ts           # Test data creation
│   └── assertions.ts     # Custom assertions
├── global-setup.ts       # Global test setup
└── global-teardown.ts    # Global test cleanup
```

### Modified Files
```
e2e/
├── auth.spec.ts          # Remove .skip, implement tests
├── recipe-crud.spec.ts   # Remove .skip, implement tests
└── grocery-list.spec.ts  # Remove .skip, implement tests

playwright.config.ts      # Add global setup/teardown
.github/workflows/test.yml # Update E2E job
package.json              # Add setup scripts
```

## Dependencies

### Required
- Testing infrastructure (#16) ✅
- Test database or test user accounts
- Playwright installed ✅

### Optional
- Visual regression baseline images
- Performance benchmarks

## Estimated Timeline

- Day 1: Test user and authentication setup
- Day 2: Test data fixtures and helpers
- Day 3: Authentication E2E tests (3 tests)
- Days 4-5: Recipe CRUD E2E tests (5 tests)
- Day 6: Grocery list E2E tests (6 tests)

**Total**: 6 days

## Priority Justification

**P2 (Medium)** because:
- ✅ Basic smoke tests are passing
- ✅ Unit tests cover business logic
- ⚠️ Full E2E coverage would catch integration issues
- ⚠️ Not blocking deployment
- ⚠️ Should be done before major UI refactoring

## Related Issues

- #16 - Testing Suite (completed)
- Enhancement: Integration Tests (proposed)

## Notes

The skeleton E2E tests from #16 provide good examples of what should be tested. The main work is setting up:
1. Test user management
2. Authentication helpers
3. Test data fixtures
4. Reliable cleanup

Once infrastructure is in place, implementing the actual tests should be straightforward as the test cases are already outlined.

## Future Enhancements

After initial implementation:
- Add visual regression tests
- Add performance monitoring
- Add accessibility checks (axe-core)
- Test on multiple browsers (Firefox, WebKit)
- Add mobile viewport testing
- Add cross-browser testing

---

**Estimated Effort**: 4-6 days
**Priority**: P2 (Medium)
**Assigned**: TBD
