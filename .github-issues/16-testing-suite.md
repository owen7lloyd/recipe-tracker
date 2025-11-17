# Comprehensive Testing Suite

**Phase:** 4 - Polish & Deploy
**Priority:** P0
**Estimate:** 7 days

## Description

Implement comprehensive test coverage including unit tests, integration tests, and end-to-end tests for all critical application features.

## Tasks

### Test Infrastructure Setup
- [ ] Configure Vitest for unit/integration tests
- [ ] Configure Playwright for E2E tests
- [ ] Set up test database
- [ ] Configure CI/CD test pipeline
- [ ] Set up code coverage reporting

### Unit Tests
- [ ] Recipe scaling logic
- [ ] Ingredient matching algorithm
- [ ] Grocery list generation logic
- [ ] Substitution logic
- [ ] Quantity formatting
- [ ] Unit conversions
- [ ] Validation schemas
- [ ] Utility functions

### Integration Tests
- [ ] All API endpoints
- [ ] Database operations
- [ ] Authentication flows
- [ ] Authorization checks
- [ ] Real-time sync
- [ ] File uploads

### E2E Tests (Critical Flows)
- [ ] User registration → household creation
- [ ] Login → dashboard access
- [ ] Create recipe → view → edit → delete
- [ ] Import recipe from URL → save
- [ ] Add pantry items → check "what can I cook?"
- [ ] Cook recipe → verify pantry updated
- [ ] Select recipes → generate grocery list → share
- [ ] Multi-user concurrent editing
- [ ] Household invitation flow

### Performance Tests
- [ ] API response times (< 500ms)
- [ ] Page load times (< 2s on 3G)
- [ ] Autocomplete speed (< 200ms)
- [ ] Recipe matching with 100+ recipes
- [ ] Grocery list with 100+ items
- [ ] Concurrent users (load testing)

### Security Tests
- [ ] SQL injection attempts
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Authentication bypass attempts
- [ ] Authorization checks
- [ ] Secure headers present

### Visual Regression Tests (Optional)
- [ ] Recipe card component
- [ ] Recipe detail page
- [ ] Grocery list view
- [ ] Form layouts

## Acceptance Criteria

- [ ] Test coverage > 80%
- [ ] All critical flows have E2E tests
- [ ] All API endpoints have integration tests
- [ ] Unit tests for all business logic
- [ ] Tests pass in CI/CD pipeline
- [ ] Performance benchmarks met
- [ ] Security tests pass
- [ ] No critical bugs found in testing

## Technical Details

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.config.ts',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Unit Test Examples

```typescript
// lib/recipe-scaling.test.ts
import { describe, it, expect } from 'vitest'
import { scaleRecipe, formatQuantity } from './recipe-scaling'

describe('Recipe Scaling', () => {
  it('should scale recipe quantities correctly', () => {
    const recipe = {
      id: '1',
      servings: 4,
      ingredients: [
        { id: '1', ingredient_id: '1', quantity: 2, unit: 'cups' },
        { id: '2', ingredient_id: '2', quantity: 1, unit: 'tbsp' },
      ]
    }

    const scaled = scaleRecipe(recipe, 8)

    expect(scaled.current_servings).toBe(8)
    expect(scaled.scale_factor).toBe(2)
    expect(scaled.ingredients[0].quantity).toBe(4)
    expect(scaled.ingredients[1].quantity).toBe(2)
  })

  it('should preserve non-numeric quantities', () => {
    const recipe = {
      servings: 4,
      ingredients: [
        { id: '1', ingredient_id: '1', name: 'Salt to taste' }
      ]
    }

    const scaled = scaleRecipe(recipe, 8)

    expect(scaled.ingredients[0].name).toBe('Salt to taste')
  })
})

describe('Quantity Formatting', () => {
  it('should format common fractions', () => {
    expect(formatQuantity(0.25)).toBe('¼')
    expect(formatQuantity(0.5)).toBe('½')
    expect(formatQuantity(0.75)).toBe('¾')
  })

  it('should handle mixed numbers', () => {
    expect(formatQuantity(1.5)).toBe('1 ½')
    expect(formatQuantity(2.25)).toBe('2 ¼')
  })

  it('should handle whole numbers', () => {
    expect(formatQuantity(3)).toBe('3')
    expect(formatQuantity(10)).toBe('10')
  })
})
```

### Integration Test Examples

```typescript
// app/api/recipes/route.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { POST, GET } from './route'
import { createTestUser, createTestSession } from '@/test/helpers'

describe('POST /api/recipes', () => {
  let user, session

  beforeEach(async () => {
    user = await createTestUser()
    session = await createTestSession(user)
  })

  it('should create a recipe', async () => {
    const request = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${session.token}`
      },
      body: JSON.stringify({
        title: 'Test Recipe',
        category: 'dinner',
        servings: 4,
        ingredients: [
          { ingredient_id: '1', quantity: 2, unit: 'cups' }
        ],
        instructions: ['Step 1', 'Step 2']
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Test Recipe')
    expect(data.household_id).toBe(user.household_id)
  })

  it('should reject unauthenticated requests', async () => {
    const request = new Request('http://localhost/api/recipes', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' })
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
  })

  it('should validate required fields', async () => {
    const request = new Request('http://localhost/api/recipes', {
      method: 'POST',
      headers: {
        'Cookie': `session=${session.token}`
      },
      body: JSON.stringify({ title: '' })
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
```

### E2E Test Examples

```typescript
// e2e/recipe-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Recipe Management Flow', () => {
  test('complete recipe lifecycle', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('[name=email]', 'test@example.com')
    await page.fill('[name=password]', 'password123')
    await page.click('button[type=submit]')

    await expect(page).toHaveURL('/dashboard')

    // Navigate to recipes
    await page.click('a[href="/recipes"]')
    await expect(page).toHaveURL('/recipes')

    // Create new recipe
    await page.click('button:has-text("Add Recipe")')
    await page.fill('[name=title]', 'E2E Test Recipe')
    await page.selectOption('[name=category]', 'dinner')
    await page.fill('[name=servings]', '4')

    // Add ingredient
    await page.click('button:has-text("Add Ingredient")')
    await page.fill('[data-testid=ingredient-search-0]', 'flour')
    await page.click('[data-testid=ingredient-option-flour]')
    await page.fill('[data-testid=ingredient-quantity-0]', '2')
    await page.selectOption('[data-testid=ingredient-unit-0]', 'cups')

    // Add instruction
    await page.fill('[data-testid=instruction-0]', 'Mix ingredients')

    // Save recipe
    await page.click('button:has-text("Save Recipe")')

    // Verify recipe created
    await expect(page.locator('text=Recipe saved!')).toBeVisible()
    await expect(page.locator('text=E2E Test Recipe')).toBeVisible()

    // View recipe detail
    await page.click('text=E2E Test Recipe')
    await expect(page.locator('h1:has-text("E2E Test Recipe")')).toBeVisible()
    await expect(page.locator('text=2 cups flour')).toBeVisible()

    // Edit recipe
    await page.click('button:has-text("Edit")')
    await page.fill('[name=title]', 'E2E Test Recipe (Updated)')
    await page.click('button:has-text("Save")')
    await expect(page.locator('h1:has-text("E2E Test Recipe (Updated)")')).toBeVisible()

    // Delete recipe
    await page.click('button:has-text("Delete")')
    await page.click('button:has-text("Confirm")')
    await expect(page).toHaveURL('/recipes')
    await expect(page.locator('text=E2E Test Recipe (Updated)')).not.toBeVisible()
  })
})

test.describe('Pantry to Cooking Flow', () => {
  test('add pantry items and cook recipe', async ({ page }) => {
    await page.goto('/login')
    // ... login

    // Add pantry items
    await page.goto('/pantry')
    await page.fill('[data-testid=add-ingredient]', 'flour')
    await page.click('[data-testid=ingredient-option-flour]')
    await page.fill('[data-testid=quantity]', '5')
    await page.selectOption('[data-testid=unit]', 'cups')
    await page.click('button:has-text("Add")')

    await expect(page.locator('text=5 cups flour')).toBeVisible()

    // Check what can I cook
    await page.goto('/recipes/available')
    await expect(page.locator('[data-testid=cookable-recipe]')).toBeVisible()

    // Cook a recipe
    const recipeCard = page.locator('[data-testid=cookable-recipe]').first()
    await recipeCard.click()

    await page.click('button:has-text("Cook This Recipe")')
    await expect(page.locator('text=This will deduct ingredients')).toBeVisible()
    await page.click('button:has-text("Confirm")')

    await expect(page.locator('text=Recipe cooked!')).toBeVisible()

    // Verify pantry updated
    await page.goto('/pantry')
    // Should have less flour now (depends on recipe)
    await expect(page.locator('text=5 cups flour')).not.toBeVisible()
  })
})
```

### Performance Test Example

```typescript
// Load testing with k6
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Error rate must be below 1%
  },
}

export default function () {
  const response = http.get('https://app.example.com/api/recipes')

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

### CI/CD Test Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Dependencies

- All Phase 1-3 features implemented
- Test database available

## Testing

- [ ] All tests pass locally
- [ ] All tests pass in CI
- [ ] Coverage report generated
- [ ] Performance benchmarks met

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- Implementation Plan: Section 4.3 Testing
