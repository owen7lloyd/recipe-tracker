# Test Suite Documentation

This document describes the comprehensive testing suite for the Recipe Tracker application.

## Overview

The testing suite includes:
- **Unit Tests**: Testing individual functions and utilities
- **Integration Tests**: Testing API endpoints and database interactions
- **E2E Tests**: Testing complete user flows from UI to database
- **CI/CD Pipeline**: Automated testing on every push and pull request

## Test Structure

```
recipe-tracker/
├── src/
│   ├── lib/
│   │   ├── *.test.ts              # Unit tests for utilities
│   │   └── validations/
│   │       └── *.test.ts          # Validation schema tests
│   └── app/
│       └── api/
│           └── **/route.test.ts   # Integration tests for API routes
├── e2e/
│   ├── auth.spec.ts               # Authentication flows
│   ├── recipe-crud.spec.ts        # Recipe management
│   └── grocery-list.spec.ts       # Grocery list features
├── test/
│   ├── setup.ts                   # Test setup and mocks
│   └── helpers.ts                 # Test utility functions
├── vitest.config.ts               # Vitest configuration
└── playwright.config.ts           # Playwright configuration
```

## Running Tests

### All Tests
```bash
pnpm test
```

### Watch Mode (for development)
```bash
pnpm test:watch
```

### With Coverage
```bash
pnpm test:coverage
```

### E2E Tests
```bash
pnpm test:e2e
```

### E2E Tests with UI
```bash
pnpm test:e2e:ui
```

### Debug E2E Tests
```bash
pnpm test:e2e:debug
```

## Unit Tests

### Recipe Scaling Tests
**File**: `src/lib/recipe-scaling.test.ts`

Tests the recipe scaling functionality:
- Quantity formatting (fractions, decimals, whole numbers)
- Recipe scaling (doubling, halving, custom servings)
- Non-numeric quantity handling
- Scaling descriptions

**Coverage**: 20 tests

### Validation Tests
**File**: `src/lib/validations/recipe.test.ts`

Tests Zod validation schemas:
- Recipe ingredient validation
- Recipe creation validation
- Recipe update validation
- Field validation (title, category, servings, etc.)
- Default values and constraints

**Coverage**: 21 tests

### Utility Tests
**File**: `src/lib/utils.test.ts`

Tests utility functions:
- Class name merging (cn)
- Conditional classes
- Tailwind class conflict resolution

**Coverage**: 6 tests

## Integration Tests

### API Route Tests
**Files**: `src/app/api/**/route.test.ts`

Tests API endpoints with database interactions:
- Recipe CRUD operations
- Pantry management
- Grocery list generation
- Authentication and authorization
- Request validation
- Error handling

**Status**: Skeleton tests created (require database setup)

## E2E Tests

### Authentication Flow
**File**: `e2e/auth.spec.ts`

Tests:
- User registration
- User login
- Invalid credentials handling
- Session management

### Recipe CRUD
**File**: `e2e/recipe-crud.spec.ts`

Tests:
- Creating recipes with ingredients and instructions
- Viewing recipe details
- Editing recipes
- Deleting recipes
- Recipe scaling interface

### Grocery List Management
**File**: `e2e/grocery-list.spec.ts`

Tests:
- Generating grocery lists from recipes
- Checking off items
- Sharing lists
- Real-time collaboration
- Category organization
- List completion

## Test Configuration

### Vitest Configuration
**File**: `vitest.config.ts`

- Environment: jsdom (for React component testing)
- Coverage provider: v8
- Coverage threshold: 80%
- Test setup: `test/setup.ts`

### Playwright Configuration
**File**: `playwright.config.ts`

- Browsers: Chromium (default), Firefox, WebKit (configurable)
- Base URL: http://localhost:3000
- Retry: 2 times on CI, 0 locally
- Screenshots: On failure
- Trace: On first retry

## CI/CD Pipeline

### GitHub Actions Workflow
**File**: `.github/workflows/test.yml`

**Jobs**:
1. **test-unit**: Runs unit and integration tests
   - Sets up PostgreSQL database
   - Runs type checking
   - Runs linting
   - Runs unit tests with coverage
   - Uploads coverage to Codecov
   - Checks 80% coverage threshold

2. **test-e2e**: Runs E2E tests
   - Sets up PostgreSQL database
   - Installs Playwright browsers
   - Runs E2E tests
   - Uploads test reports

3. **test-summary**: Summarizes test results
   - Checks if all tests passed
   - Reports final status

**Triggers**:
- Push to `main`, `develop`, or `claude/**` branches
- Pull requests to `main` or `develop`

## Test Helpers

### Database Helpers
**File**: `test/helpers.ts`

Utilities for test data management:
- `cleanupTestData()`: Clean up test database
- `createTestHousehold()`: Create test household
- `createTestUser()`: Create test user with household
- `createTestRecipe()`: Create test recipe
- `createTestPantryItem()`: Create pantry item
- `createTestGroceryList()`: Create grocery list
- `mockRequest()`: Create mock HTTP request
- `expectError()`: Assert error response
- `expectSuccess()`: Assert success response

### Test Setup
**File**: `test/setup.ts`

- Automatic cleanup after each test
- Next.js router mocking
- Next Auth mocking
- Environment variable setup

## Coverage Goals

**Target**: 80% coverage across all code

**Priority Areas**:
1. Business logic (recipe scaling, matching, etc.)
2. API endpoints (all routes)
3. Validation schemas
4. Critical user flows (E2E)

**Excluded from Coverage**:
- Configuration files
- Type definitions
- Database seed data
- Middleware (requires special setup)

## Writing New Tests

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './my-module'

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction(input)
      expect(result).toBe(expected)
    })
  })
})
```

### Integration Test Example
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { cleanupTestData, createTestUser } from '@/test/helpers'

describe('POST /api/my-endpoint', () => {
  beforeEach(async () => {
    await cleanupTestData()
  })

  afterEach(async () => {
    await cleanupTestData()
  })

  it('should handle valid request', async () => {
    const { user, household } = await createTestUser()
    // Test implementation
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/my-page')
    await page.click('button:has-text("Click Me")')
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Descriptive Names**: Use clear test descriptions
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Mock External Dependencies**: Don't hit real APIs
6. **Test Edge Cases**: Cover error scenarios
7. **Fast Tests**: Keep tests quick to encourage frequent running
8. **Readable Assertions**: Use clear, specific assertions

## Troubleshooting

### Tests Timing Out
- Increase timeout in test or config
- Check for database connection issues
- Verify async operations complete

### Database Issues
- Ensure test database is running
- Check connection string
- Verify migrations are up to date

### E2E Tests Failing
- Check if dev server is running
- Verify base URL configuration
- Look at screenshots/traces for failures

### Coverage Issues
- Check excluded paths in vitest.config.ts
- Add tests for uncovered branches
- Review coverage report HTML

## Future Improvements

1. **Performance Tests**: Add load testing with k6
2. **Security Tests**: Automated security scanning
3. **Visual Regression**: Screenshot comparison tests
4. **Integration Test Database**: Dedicated test DB setup
5. **Test Data Factories**: More robust test data generation
6. **Accessibility Tests**: Automated a11y checks
7. **Mobile E2E Tests**: Test on mobile viewports
8. **API Contract Tests**: Schema validation for all endpoints

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [GitHub Actions](https://docs.github.com/en/actions)

## Maintenance

- Review and update tests when features change
- Keep dependencies up to date
- Monitor test execution time
- Archive obsolete tests
- Update documentation as needed

---

**Last Updated**: 2025-11-21
**Maintained By**: Development Team
