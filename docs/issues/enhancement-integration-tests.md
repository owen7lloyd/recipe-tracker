# Enhancement: Implement Integration Tests for API Endpoints

**Status**: Proposed
**Priority**: P2 (Medium)
**Effort**: 3-5 days
**Dependencies**: Testing infrastructure (completed in #16)

## Overview

Implement comprehensive integration tests for all API endpoints. Currently, skeleton integration tests exist but are skipped due to requiring database setup and Next.js API route context mocking.

## Current State

- ✅ Test infrastructure is set up (Vitest, test helpers)
- ✅ Skeleton tests created in `src/app/api/**/route.test.ts`
- ❌ Tests are skipped with `describe.skip()`
- ❌ Database mocking not configured
- ❌ Next.js API route context not properly mocked

## Goals

1. Enable integration tests for all API endpoints
2. Achieve test coverage for API layer
3. Test authentication and authorization
4. Test database interactions
5. Test error handling and edge cases

## Implementation Plan

### Phase 1: Database Setup (Day 1)

**Tasks**:
- [ ] Set up dedicated test database
- [ ] Configure test database migrations
- [ ] Add database seeding for test data
- [ ] Implement proper cleanup between tests

**Files to create**:
```
test/
├── db-setup.ts           # Test database configuration
├── db-seed.ts            # Test data seeding
└── db-cleanup.ts         # Cleanup utilities
```

**Environment variables**:
```env
TEST_DATABASE_URL=postgresql://localhost:5432/recipe_tracker_test
```

### Phase 2: Next.js API Route Mocking (Day 2)

**Tasks**:
- [ ] Create utilities for mocking Next.js Request objects
- [ ] Mock Next Auth `getServerSession`
- [ ] Mock cookies and headers
- [ ] Create test request builders

**Example implementation**:
```typescript
// test/api-helpers.ts
import { NextRequest } from 'next/server'

export function createMockRequest(options: {
  url: string
  method?: string
  body?: unknown
  session?: { user: { id: string; householdId: string } }
}) {
  const request = new NextRequest(options.url, {
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // Mock session
  vi.mock('next-auth/next', () => ({
    getServerSession: vi.fn(() => options.session || null)
  }))

  return request
}
```

### Phase 3: Recipe API Tests (Days 3-4)

**Endpoints to test**:
- [ ] `POST /api/recipes` - Create recipe
- [ ] `GET /api/recipes` - List recipes
- [ ] `GET /api/recipes/[id]` - Get recipe
- [ ] `PUT /api/recipes/[id]` - Update recipe
- [ ] `DELETE /api/recipes/[id]` - Delete recipe
- [ ] `POST /api/recipes/[id]/scale` - Scale recipe
- [ ] `POST /api/recipes/[id]/cook` - Cook recipe
- [ ] `POST /api/recipes/import` - Import recipe from URL
- [ ] `GET /api/recipes/available` - Get cookable recipes

**Test scenarios per endpoint**:
- ✅ Success case with valid data
- ❌ Authentication required (401)
- ❌ Authorization check (403)
- ❌ Validation errors (400)
- ❌ Not found errors (404)
- ❌ Database constraint violations
- ❌ Edge cases (empty data, special characters, etc.)

**Example test**:
```typescript
describe('POST /api/recipes', () => {
  let testUser: User
  let testHousehold: Household

  beforeEach(async () => {
    await cleanupTestData()
    const { user, household } = await createTestUser()
    testUser = user
    testHousehold = household
  })

  it('should create a recipe with valid data', async () => {
    const { POST } = await import('@/app/api/recipes/route')

    const request = createMockRequest({
      url: 'http://localhost/api/recipes',
      method: 'POST',
      body: {
        title: 'Test Recipe',
        category: 'dinner',
        servings: 4,
        ingredients: [
          { ingredientId: 'flour-id', quantity: 2, unit: 'cups' }
        ],
        instructions: ['Mix ingredients', 'Bake at 350F']
      },
      session: {
        user: {
          id: testUser.id,
          householdId: testHousehold.id
        }
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Test Recipe')
    expect(data.householdId).toBe(testHousehold.id)
  })

  it('should reject unauthenticated requests', async () => {
    const { POST } = await import('@/app/api/recipes/route')

    const request = createMockRequest({
      url: 'http://localhost/api/recipes',
      method: 'POST',
      body: { title: 'Test' },
      session: null  // No session
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
```

### Phase 4: Additional API Tests (Day 5)

**Endpoints to test**:
- [ ] Pantry API (`/api/pantry/*`)
- [ ] Grocery List API (`/api/grocery-lists/*`)
- [ ] Ingredients API (`/api/ingredients/*`)
- [ ] Substitutions API (`/api/substitutions/*`)
- [ ] Household API (`/api/households/*`)
- [ ] Auth API (`/api/auth/*`)
- [ ] Upload API (`/api/upload`)

### Phase 5: CI/CD Integration (Day 5)

**Tasks**:
- [ ] Update GitHub Actions workflow
- [ ] Add test database service to CI
- [ ] Run integration tests in CI pipeline
- [ ] Update coverage thresholds
- [ ] Add integration test badge to README

**CI configuration update**:
```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: recipe_tracker_test
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
```

## Test Coverage Goals

| Category | Target Coverage |
|----------|----------------|
| API Routes | > 90% |
| Database Operations | > 85% |
| Error Handling | 100% |
| Authorization Checks | 100% |

## Files to Modify

### New Files
```
test/
├── api-helpers.ts        # API request mocking utilities
├── db-setup.ts           # Database setup for tests
├── db-seed.ts            # Test data seeding
└── db-cleanup.ts         # Cleanup between tests
```

### Modified Files
```
src/app/api/
├── recipes/route.test.ts           # Remove .skip, implement tests
├── pantry/route.test.ts            # Create and implement
├── grocery-lists/route.test.ts     # Create and implement
└── [other routes]/route.test.ts    # Create and implement

.github/workflows/test.yml          # Add integration tests
vitest.config.ts                    # Update for integration tests
```

## Acceptance Criteria

- [ ] All API endpoints have integration tests
- [ ] Tests run against real test database
- [ ] Authentication and authorization tested
- [ ] Error cases fully covered
- [ ] Tests pass in CI/CD pipeline
- [ ] No `describe.skip()` in integration tests
- [ ] Coverage reports include integration tests
- [ ] Documentation updated with integration test examples

## Dependencies

### Required
- Testing infrastructure (#16) ✅
- PostgreSQL test database instance

### Optional
- Test data factories for easier test setup
- Database migration rollback for cleanup

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Test database conflicts | Use isolated test DB with unique name |
| Slow test execution | Use database transactions for rollback |
| Flaky tests | Ensure proper cleanup and isolation |
| CI/CD failures | Add retry logic, ensure DB is ready |

## Success Metrics

- ✅ All API integration tests passing
- ✅ > 85% coverage on API layer
- ✅ CI/CD pipeline runs integration tests
- ✅ Test execution time < 2 minutes
- ✅ Zero skipped integration tests

## Future Enhancements

After initial implementation:
- Add contract testing for API schemas
- Add API performance benchmarks
- Add mutation testing
- Add load testing for endpoints
- Add WebSocket/real-time testing

## Related Issues

- #16 - Testing Suite (completed)
- Future deployment issues may depend on this

## Notes

The skeleton tests created in #16 provide a good starting point. The main work is setting up the database mocking and Next.js API context properly. Once the infrastructure is in place, adding tests for each endpoint should be straightforward.

## Estimated Timeline

- Day 1: Database setup and configuration
- Day 2: Next.js API mocking utilities
- Day 3-4: Recipe API comprehensive tests
- Day 5: Additional APIs and CI integration

**Total**: 5 days

## Priority Justification

**P2 (Medium)** because:
- ✅ Unit tests already provide good coverage for business logic
- ✅ E2E tests cover critical user flows
- ⚠️ Integration tests would add confidence in API layer
- ⚠️ Not blocking deployment but valuable for maintenance
- ⚠️ Should be done before major refactoring of APIs

## Assignment

Suggested for: Backend/Full-stack developer familiar with:
- Vitest/Jest testing frameworks
- Next.js API routes
- PostgreSQL and database testing
- CI/CD pipelines
