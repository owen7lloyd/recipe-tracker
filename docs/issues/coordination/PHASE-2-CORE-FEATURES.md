# Phase 2: Core Features - Parallel Execution Plan

**Duration:** 11 days (with parallelization)
**Issues:** #07, #08, #09, #10, #11

## Overview

Phase 2 is split into two tiers due to dependencies:

**Tier 1 (4 days):** #08 Recipe Scaling + #09 Ingredient Substitutions (parallel)
**Tier 2 (7 days):** #07 Recipe Import + #10 Recipe Matching + #11 Cook Recipe (partial parallel)

## Tier 1: Parallel Workstreams (Days 1-4)

### Worker A: Recipe Scaling (#08)
- **Duration:** 3 days
- **Dependencies:** Completed Phase 1 (#05)
- **Files:**
  - `app/api/recipes/[id]/scale/route.ts`
  - `lib/recipe-scaling.ts`
  - `components/recipes/ServingScaler.tsx`

### Worker B: Ingredient Substitutions (#09)
- **Duration:** 4 days
- **Dependencies:** Completed Phase 1 (#02, #06)
- **Files:**
  - `prisma/migrations/*_ingredient_substitutions.sql`
  - `prisma/seeds/substitutions.ts`
  - `app/api/ingredients/[id]/substitutes/route.ts`
  - `app/api/substitutions/route.ts`
  - `lib/substitution-service.ts`

### Tier 1 Coordination

**No direct dependencies** - these can run completely in parallel.

**Shared Understanding:**
- Worker A focuses on quantity calculations
- Worker B focuses on ingredient relationships
- No file conflicts expected

**Handoff:** Both must complete before Tier 2 can start.

---

## Tier 2: Parallel Workstreams (Days 5-11)

### Worker C: Recipe Web Import (#07)
- **Duration:** 6 days (Days 5-10)
- **Dependencies:** Phase 1 (#05, #06)
- **Files:**
  - `app/api/recipes/import/route.ts`
  - `lib/recipe-scraper/schema-org.ts`
  - `lib/recipe-scraper/html-parser.ts`
  - `lib/recipe-scraper/ingredient-parser.ts`
  - `components/recipes/RecipeImportModal.tsx`

### Worker D: Recipe Matching (#10)
- **Duration:** 5 days (Days 5-9)
- **Dependencies:** Phase 1 (#05, #06) + **Tier 1 (#09)**
- **Files:**
  - `app/api/recipes/available/route.ts`
  - `app/(dashboard)/recipes/available/page.tsx`
  - `lib/recipe-matching.ts`
  - `components/recipes/AvailableRecipes.tsx`
  - `components/recipes/AvailabilityBadge.tsx`

### Worker E: Cook Recipe Feature (#11)
- **Duration:** 4 days (Days 7-10)
- **Dependencies:** Phase 1 (#05, #06) + **Tier 1 (#08)**
- **Start Date:** Day 7 (after Worker A finishes scaling)
- **Files:**
  - `app/api/recipes/[id]/cook/route.ts`
  - `components/recipes/CookRecipeModal.tsx`
  - `prisma/migrations/*_recipe_history.sql` (optional)

### Tier 2 Coordination

**Critical Dependency Chain:**
```
Tier 1 Complete (Day 4)
    ├─→ Worker C starts #07 (Day 5)
    ├─→ Worker D starts #10 (Day 5) ← needs #09
    └─→ Worker A transitions to Worker E for #11 (Day 7) ← needs #08

Worker E can start Day 7 because Worker A finishes #08 on Day 4
```

**Parallel Execution:**
- Days 5-6: Workers C + D (2 parallel)
- Days 7-9: Workers C + D + E (3 parallel)
- Day 10: Workers C + E (2 parallel)

---

## Coordination Points

### 1. Scaling Integration (#08 → #11)

Worker A/E must ensure scaling logic is available for Cook Recipe:

**Interface Contract:**
```typescript
// lib/recipe-scaling.ts
// Created by: Worker A (#08)
// Used by: Worker E (#11)

export function scaleRecipe(
  recipe: Recipe,
  newServings: number
): ScaledRecipe

export function formatQuantity(quantity: number): string
```

**Coordination:**
- Worker A documents the scaling API on Day 3
- Worker E reviews documentation before starting on Day 7
- Worker E can ask Worker A questions Days 7-10

### 2. Substitution Integration (#09 → #10)

Worker B must provide substitution service for Recipe Matching:

**Interface Contract:**
```typescript
// lib/substitution-service.ts
// Created by: Worker B (#09)
// Used by: Worker D (#10)

class SubstitutionService {
  async getSubstitutes(ingredientId: string): Promise<Substitution[]>
  async areSubstitutable(id1: string, id2: string): Promise<{
    substitutable: boolean
    ratio?: number
  }>
}
```

**Coordination:**
- Worker B commits substitution service by Day 4
- Worker B seeds substitution data by Day 4
- Worker D starts using the service on Day 5
- Worker B available for questions Days 5-9

### 3. Recipe Import Integration (#07)

Worker C must integrate with existing Recipe CRUD:

**Interface Contract:**
```typescript
// POST /api/recipes/import
// Creates: Parsed recipe object
// Returns: Same format as POST /api/recipes

// Worker C must use existing recipe creation logic
// Import endpoint returns preview, user confirms, then saves via existing API
```

**Coordination:**
- Worker C uses Recipe CRUD API from Phase 1
- Worker C may enhance ingredient parser
- Worker C coordinates with Worker D if ingredient matching logic overlaps

### 4. Recipe Matching + Cook Recipe Integration (#10 + #11)

These features work together in the user flow:

**User Flow:**
1. View "What Can I Cook?" (Worker D)
2. Select a recipe
3. Click "Cook This Recipe" (Worker E)
4. Pantry updated
5. "What Can I Cook?" refreshes (Worker D)

**Coordination:**
- Worker D creates availability badge component
- Worker E adds "Cook" button to recipe detail page
- Both workers test the complete flow together on Day 10

---

## Branch Strategy

```
main
├── claude/recipe-scaling-08        (Worker A, Days 1-3)
├── claude/ingredient-subs-09       (Worker B, Days 1-4)
├── claude/recipe-import-07         (Worker C, Days 5-10)
├── claude/recipe-matching-10       (Worker D, Days 5-9)
└── claude/cook-recipe-11           (Worker E, Days 7-10)
```

**Merge Order:**
1. Day 4: Merge #08 and #09 (either order, independent)
2. Day 9: Merge #10 (depends on #09)
3. Day 10: Merge #07 (independent)
4. Day 11: Merge #11 (depends on #08)

---

## Worker Assignments & Timeline

| Worker | Days 1-3 | Day 4 | Days 5-6 | Days 7-10 | Day 11 |
|--------|----------|-------|----------|-----------|--------|
| **Worker A** | #08 Scaling | Finish #08, docs | — | — | — |
| **Worker B** | #09 Substitutions | Finish #09, seed data | Support Worker D | — | — |
| **Worker C** | — | — | #07 Import (start) | #07 Import (finish) | — |
| **Worker D** | — | Wait | #10 Matching (start) | #10 Matching (finish) | — |
| **Worker E** | — | — | — | #11 Cook Recipe | Testing |

**Note:** Worker A can transition to Worker E role, or Worker E can be a new person who starts Day 7.

---

## Daily Coordination Schedule

### Day 1 (Tier 1 Start)
- **Worker A:** Start Recipe Scaling
- **Worker B:** Start Ingredient Substitutions
- **Sync:** Brief kickoff call, confirm no blockers

### Day 3
- **Worker A:** Complete Recipe Scaling, write documentation
- **Worker B:** Continue Substitutions
- **Sync:** Worker A shares scaling API docs

### Day 4 (Tier 1 → Tier 2 Transition)
- **Worker A:** Merge #08
- **Worker B:** Complete Substitutions, seed data, merge #09
- **Worker C:** Prepare to start #07
- **Worker D:** Review substitution service, prepare to start #10
- **Sync:** Handoff meeting
  - Worker B demos substitution service
  - Worker A demos scaling service
  - Confirm Tier 2 workers are ready

### Day 5
- **Worker C:** Start Recipe Import
- **Worker D:** Start Recipe Matching (using Worker B's substitution service)
- **Sync:** Quick check-in on any blockers

### Day 7 (Worker E Joins)
- **Worker E:** Start Cook Recipe (using Worker A's scaling service)
- **Worker C:** Continue Import
- **Worker D:** Continue Matching
- **Sync:** Worker E reviews scaling docs with Worker A (if needed)

### Day 9
- **Worker D:** Complete Recipe Matching, merge #10
- **Worker C:** Continue Import
- **Worker E:** Continue Cook Recipe
- **Sync:** Worker D and E discuss integration flow

### Day 10
- **Worker C:** Complete Recipe Import, merge #07
- **Worker E:** Complete Cook Recipe
- **Sync:** Integration testing planning

### Day 11
- **Worker E:** Merge #11
- **All Workers:** Integration testing
- **Sync:** Phase 2 retrospective, prepare for Phase 3 handoff

---

## Testing & Integration

### Tier 1 Integration Tests (Day 4)
- [ ] Recipe scaling calculations correct
- [ ] Substitution queries return valid results
- [ ] Both features work independently

### Tier 2 Integration Tests (Day 11)
- [ ] Recipe import creates valid recipe in system
- [ ] Recipe matching correctly identifies cookable recipes
- [ ] Recipe matching considers substitutions (D + B integration)
- [ ] Cook recipe correctly scales quantities (E + A integration)
- [ ] Complete flow: Import → Check matching → Cook → Verify pantry

### Critical Integration Scenarios
1. **Import + Matching:** Import recipe, check if cookable
2. **Matching + Cook:** Find cookable recipe, cook it, verify pantry updated
3. **Scaling + Cook:** Scale recipe to 8 servings, cook it, verify correct deductions
4. **Substitutions + Matching:** Recipe needs butter, pantry has oil, matches correctly

---

## Definition of Done

### Tier 1 Complete (Day 4)
- [ ] Recipe scaling working (#08)
- [ ] Ingredient substitutions seeded and queryable (#09)
- [ ] Both features tested independently
- [ ] Documentation written for APIs
- [ ] Branches merged to main

### Tier 2 Complete (Day 11)
- [ ] Recipe import from URLs working (#07)
- [ ] "What Can I Cook?" feature functional (#10)
- [ ] Cook recipe feature deducts from pantry (#11)
- [ ] All integrations tested
- [ ] All branches merged to main
- [ ] Phase 2 complete

---

## Communication Protocol

**Daily Standups:**
- 15 minutes, 9:00 AM
- Each worker: Yesterday/Today/Blockers
- Focus on coordination needs

**Immediate Notifications:**
- API contract changes
- Blocking dependencies
- Discovered issues affecting other workers

**Code Review:**
- Workers review each other's PRs
- Especially important for shared interfaces
- Required: +1 from at least one other Phase 2 worker

**Documentation:**
- Each worker documents their APIs in `docs/api/`
- Update documentation when contracts change
- Include examples for other workers

---

## Risk Mitigation

**Risk:** Worker D blocked waiting for Worker B (#09)
- **Mitigation:** Worker D can start building UI while Worker B finishes service
- **Mitigation:** Worker B prioritizes service API over admin UI

**Risk:** Worker E blocked waiting for Worker A (#08)
- **Mitigation:** Worker E can work on UI/modal while scaling finishes
- **Mitigation:** Worker A delivers documentation early (Day 3)

**Risk:** Integration testing reveals issues
- **Mitigation:** Daily check-ins catch issues early
- **Mitigation:** Reserve Day 11 for integration fixes

**Risk:** Recipe import overlaps with ingredient parsing from #09
- **Mitigation:** Workers B and C sync on Day 5 about ingredient parsing
- **Mitigation:** Reuse logic where possible

---

## Handoff to Phase 3

Phase 2 complete checklist:

- [ ] All 5 issues merged to main
- [ ] Integration tests passing
- [ ] Recipe scaling API documented
- [ ] Substitution service documented
- [ ] Recipe matching API documented
- [ ] Cook recipe API documented
- [ ] Import functionality working
- [ ] E2E user flows tested
- [ ] Ready for Phase 3 (Grocery Lists)

**What Phase 3 Workers Need:**
- Recipe data model and APIs
- Pantry data model and APIs
- Scaling service (for grocery list generation)
- All recipe features working end-to-end

---

## Quick Reference

### Worker A/E Key Responsibilities
- Implement scaling algorithm
- Fraction formatting
- Cook recipe modal and API
- Pantry deduction logic

### Worker B Key Responsibilities
- Database schema for substitutions
- Seed 30+ substitution rules
- Substitution service API
- Support Worker D integration

### Worker C Key Responsibilities
- Schema.org parser
- HTML fallback parser
- Ingredient string parser
- Import preview UI

### Worker D Key Responsibilities
- Recipe matching algorithm
- "What Can I Cook?" page
- Substitution integration
- Availability badges

---

## Success Criteria

Phase 2 is complete when:
1. ✅ Recipes can be scaled to any serving size
2. ✅ Ingredient substitutions are defined and queryable
3. ✅ Recipes can be imported from URLs
4. ✅ Users can see what they can cook with current pantry
5. ✅ Cooking a recipe updates the pantry
6. ✅ All features integrate correctly
7. ✅ Tests pass
8. ✅ Ready for Phase 3
