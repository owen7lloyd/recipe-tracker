# Phase 1: Foundation - Parallel Execution Plan

**Duration:** 6 days (with parallelization)
**Issues:** #05 Recipe CRUD, #06 Pantry Management

## Overview

Phase 1 establishes the core data management features. Both issues can be worked on **completely in parallel** with minimal coordination needed.

## Parallel Workstreams

### Worker A: Recipe CRUD (#05)
- **Duration:** 6 days
- **Files:**
  - `app/api/recipes/**`
  - `app/(dashboard)/recipes/**`
  - `components/recipes/**`
  - `lib/validation/recipe-schema.ts`

### Worker B: Pantry Management (#06)
- **Duration:** 5 days
- **Files:**
  - `app/api/pantry/**`
  - `app/api/ingredients/**`
  - `app/(dashboard)/pantry/**`
  - `components/pantry/**`
  - `lib/validation/pantry-schema.ts`
  - `prisma/seeds/ingredients.ts`

## Shared Dependencies

Both workers will need:
- ✅ Database schema (completed in #02)
- ✅ Authentication system (completed in #03)
- ✅ Household management (completed in #04)

## Coordination Points

### 1. Shared Database Tables
Both workers will interact with the `ingredients` table:

**Agreement:**
- Worker B is responsible for seeding the ingredients table
- Worker B creates the ingredients autocomplete API
- Worker A will consume the ingredients API (not create it)

**Interface Contract:**
```typescript
// GET /api/ingredients/search?q=query
// Owned by: Worker B
// Used by: Worker A (for recipe ingredient selection)
{
  id: string
  name: string
  category: string
  common_units: string[]
}
```

### 2. Shared Components
Potential overlap in autocomplete components:

**Agreement:**
- Worker B creates `components/pantry/IngredientAutocomplete.tsx`
- Worker A can import and reuse it OR create a separate one
- No hard dependency - decide based on timing

### 3. Database Migrations
If either worker needs to modify shared tables:

**Process:**
1. Create migration in your branch
2. Post migration file to team chat
3. Other worker reviews and merges migration
4. Both pull latest migrations before continuing

### 4. Vercel Blob Storage Setup
Worker A needs Vercel Blob for image uploads:

**Agreement:**
- Worker A is responsible for:
  - Setting up Vercel Blob project
  - Adding credentials to `.env.local`
  - Sharing credentials with team
  - Creating image upload utility in `lib/upload.ts`

## Branch Strategy

```
main
├── claude/recipe-crud-05
└── claude/pantry-management-06
```

**Merge Order:** Either can merge first, no dependency.

## Integration Testing

Once both branches are complete:

**Worker A Tests:**
- [ ] Can create recipe using ingredients from Worker B's seed data
- [ ] Ingredient autocomplete works in recipe form
- [ ] Can filter recipes by ingredients

**Worker B Tests:**
- [ ] Can add pantry items using seeded ingredients
- [ ] Autocomplete returns relevant results
- [ ] Categories display correctly

## Definition of Done

### Worker A (Recipe CRUD):
- [ ] All API endpoints implemented and tested
- [ ] Recipe CRUD UI complete and functional
- [ ] Image upload working
- [ ] Form validation working
- [ ] Household isolation enforced
- [ ] Mobile responsive
- [ ] Can successfully create a recipe (E2E test passes)

### Worker B (Pantry Management):
- [ ] Ingredients seeded (200+ items)
- [ ] Pantry API endpoints complete
- [ ] Autocomplete API working (< 200ms response)
- [ ] Pantry UI complete
- [ ] Bulk operations working
- [ ] Household isolation enforced
- [ ] Mobile responsive
- [ ] Can add/remove pantry items (E2E test passes)

## Communication Protocol

**Daily Standup Items:**
- What did you complete yesterday?
- What are you working on today?
- Any blockers or coordination needs?

**Immediate Notification Required:**
- Database schema changes
- Shared API contract changes
- Blocking issues discovered

**Communication Channels:**
- Quick questions: Team chat
- Schema changes: Create PR for review
- Blockers: Tag project lead

## Handoff to Phase 2

Both workers must complete before Phase 2 can begin:

**Handoff Checklist:**
- [ ] Both branches merged to main
- [ ] All tests passing
- [ ] Ingredients database seeded
- [ ] Recipe CRUD fully functional
- [ ] Pantry management fully functional
- [ ] Integration tests pass
- [ ] Documentation updated

**What Phase 2 Workers Need:**
- Recipe API endpoints documented
- Pantry API endpoints documented
- Ingredient data model understood
- Recipe data model understood

## Risk Mitigation

**Risk:** Worker B finishes early, Worker A needs ingredients API
- **Mitigation:** Worker B can start #09 (Ingredient Substitutions) if finished early

**Risk:** Merge conflicts in shared files
- **Mitigation:** Pull from main daily, coordinate on schema changes

**Risk:** Ingredient autocomplete component duplication
- **Mitigation:** Quick sync call on Day 3 to decide on shared vs. separate components

## Quick Reference

### Worker A Key Files
```
app/api/recipes/route.ts          # List/Create recipes
app/api/recipes/[id]/route.ts     # Get/Update/Delete recipe
app/(dashboard)/recipes/page.tsx   # Recipe list view
app/(dashboard)/recipes/[id]/page.tsx # Recipe detail
app/(dashboard)/recipes/new/page.tsx  # Create recipe form
components/recipes/RecipeForm.tsx
components/recipes/RecipeCard.tsx
lib/upload.ts                      # Image upload utility
```

### Worker B Key Files
```
app/api/pantry/route.ts           # List pantry items
app/api/pantry/items/route.ts     # Add pantry item
app/api/pantry/bulk-update/route.ts # Bulk operations
app/api/ingredients/search/route.ts # Autocomplete
app/(dashboard)/pantry/page.tsx    # Pantry view
components/pantry/PantryList.tsx
components/pantry/IngredientAutocomplete.tsx
prisma/seeds/ingredients.ts        # Seed data
```

## Success Criteria

Phase 1 is complete when:
1. ✅ Users can create, view, edit, and delete recipes
2. ✅ Users can manage their pantry inventory
3. ✅ Ingredient autocomplete works smoothly
4. ✅ All tests pass
5. ✅ Both features are production-ready
6. ✅ Ready to hand off to Phase 2 workers
