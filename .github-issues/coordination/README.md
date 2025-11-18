# Recipe Tracker - Parallel Development Coordination Guide

This directory contains coordination documents for parallel development of the Recipe Tracker application.

## 📋 Quick Start

1. Read this README
2. Review the phase you're assigned to
3. Follow the coordination plan
4. Communicate with your team
5. Ship great features!

---

## 🎯 Project Overview

**Total Duration:** ~9 weeks (with optimal parallelization)
**Total Issues:** 13 (Issues #05-17)
**Completed:** Issues #01-04 (Project setup, Database, Auth, Household Management)

---

## 📊 Phase Summary

| Phase | Duration | Issues | Parallelization | Workers |
|-------|----------|--------|-----------------|---------|
| **Phase 1** | 6 days | #05, #06 | ✅ Full parallel | 2 |
| **Phase 2** | 11 days | #07-11 | ⚠️ Partial (2 tiers) | 3-5 |
| **Phase 3** | 15 days | #12-14 | ❌ Sequential only | 1 |
| **Phase 4** | 11 days | #15-17 | ✅ Partial (2 + 1) | 2-3 |
| **Total** | **~43 days** | **13 issues** | — | **2-5 workers** |

---

## 📚 Phase Documentation

### [Phase 1: Foundation](./PHASE-1-FOUNDATION.md)
**Duration:** 6 days | **Parallelization:** Full

**Issues:**
- #05 Recipe CRUD (6 days) - Worker A
- #06 Pantry Management (5 days) - Worker B

**Coordination:** Minimal - both workers can work completely independently

**Key Deliverables:**
- Recipe management system
- Pantry inventory system
- Ingredient autocomplete
- Image upload

---

### [Phase 2: Core Features](./PHASE-2-CORE-FEATURES.md)
**Duration:** 11 days | **Parallelization:** Partial (2 tiers)

**Tier 1 (4 days):**
- #08 Recipe Scaling (3 days) - Worker A
- #09 Ingredient Substitutions (4 days) - Worker B

**Tier 2 (7 days):**
- #07 Recipe Web Import (6 days) - Worker C
- #10 Recipe Matching (5 days) - Worker D (needs #09)
- #11 Cook Recipe Feature (4 days) - Worker E (needs #08)

**Coordination:** Moderate - handoffs between tiers, API contracts

**Key Deliverables:**
- Recipe scaling algorithm
- Ingredient substitution system
- Recipe web import/scraping
- "What Can I Cook?" feature
- Cook recipe (pantry deduction)

---

### [Phase 3: Grocery Lists](./PHASE-3-GROCERY-LISTS.md)
**Duration:** 15 days | **Parallelization:** None (sequential)

**Sequential Chain:**
1. #12 Grocery List Generation (5 days)
2. #13 List Organization (4 days) - BLOCKS on #12
3. #14 Real-time Sync (6 days) - BLOCKS on #13

**Coordination:** High - structured handoffs required

**Key Deliverables:**
- Grocery list generation from recipes
- List organization by store category
- Real-time sync between users
- Shareable lists

---

### [Phase 4: Polish & Deploy](./PHASE-4-POLISH-DEPLOY.md)
**Duration:** 11 days | **Parallelization:** Partial

**Parallel Work (7 days):**
- #15 UI/UX Polish (5 days) - Worker A
- #16 Testing Suite (7 days) - Worker B

**Sequential (4 days):**
- #17 Deployment (4 days) - Worker C (needs #15 + #16)

**Coordination:** Low initially, high for deployment

**Key Deliverables:**
- Polished user experience
- Comprehensive test coverage
- Production deployment
- Monitoring and analytics

---

## 👥 Worker Role Assignments

### Option 1: Maximum Parallelization (5 Workers)

| Worker | Phase 1 | Phase 2 Tier 1 | Phase 2 Tier 2 | Phase 3 | Phase 4 |
|--------|---------|----------------|----------------|---------|---------|
| **Worker 1** | #05 (6d) | #08 (3d) | — | — | #15 (5d) |
| **Worker 2** | #06 (5d) | #09 (4d) | — | #12→13→14 (15d) | — |
| **Worker 3** | — | — | #07 (6d) | — | #16 (7d) |
| **Worker 4** | — | — | #10 (5d) | — | — |
| **Worker 5** | — | — | #11 (4d) | — | #17 (4d) |

**Total Duration:** ~9 weeks

### Option 2: Medium Parallelization (3 Workers)

| Worker | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| **Worker 1** | #05 (6d) | #08 (3d) → #11 (4d) | #12→13→14 (15d) | #15 (5d) |
| **Worker 2** | #06 (5d) | #09 (4d) → #10 (5d) | — | #16 (7d) |
| **Worker 3** | — | #07 (6d) | — | #17 (4d) |

**Total Duration:** ~11 weeks

### Option 3: Minimal Parallelization (2 Workers)

| Worker | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| **Worker 1** | #05 (6d) | #08→#11→#07 (13d) | #12→13→14 (15d) | #15 (5d) |
| **Worker 2** | #06 (5d) | #09→#10 (9d) | — | #16→#17 (11d) |

**Total Duration:** ~13 weeks

---

## 🔄 Workflow

### For Each Phase

1. **Read phase documentation**
   - Understand issues and dependencies
   - Review coordination points
   - Check your assigned role

2. **Attend kickoff meeting**
   - Meet your team
   - Clarify assignments
   - Discuss timeline

3. **Daily coordination**
   - Brief standup (15 min)
   - Update shared tracker
   - Communicate blockers

4. **Complete your issues**
   - Follow issue specifications
   - Write tests
   - Document your work

5. **Handoff to next phase**
   - Demo your work
   - Document APIs
   - Support integration

### Branch Naming Convention

```
claude/<issue-name>-<issue-number>

Examples:
claude/recipe-crud-05
claude/pantry-management-06
claude/recipe-scaling-08
```

### Merge Strategy

- Create PR when issue is complete
- Request review from other phase workers
- Merge only when approved + tests pass
- Delete branch after merge

---

## 📞 Communication

### Daily Standups
- **When:** 9:00 AM daily
- **Duration:** 15 minutes
- **Format:** Each worker shares:
  - What I did yesterday
  - What I'm doing today
  - Any blockers

### Handoff Meetings
- **When:** Between phases
- **Duration:** 1 hour
- **Format:**
  - Demo completed work
  - Walk through code/APIs
  - Q&A session
  - Confirm next phase ready

### Async Communication
- **Quick questions:** Team chat (Slack/Discord)
- **Complex topics:** Schedule 1:1
- **Code discussions:** PR comments
- **Blockers:** Immediate notification

### Status Updates
- Update shared tracker daily
- Flag blockers immediately
- Share wins and progress

---

## 🚧 Handling Blockers

### Level 1: Minor Issue (< 2 hours)
- Try to resolve yourself
- Search documentation
- Check with team in chat

### Level 2: Blocking Issue (2-4 hours)
- Post in team channel
- Tag relevant team member
- Update status tracker

### Level 3: Critical Blocker (> 4 hours)
- Notify project lead immediately
- Schedule sync meeting
- Consider workaround
- May affect timeline

---

## 🎯 Quality Standards

### Code Quality
- Follow existing code style
- TypeScript strict mode
- No `any` types without justification
- ESLint/Prettier compliant

### Testing
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical flows
- Coverage > 80%

### Documentation
- Document all APIs
- Add README for complex features
- Comment non-obvious code
- Update docs when changing APIs

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast compliance (WCAG AA)
- Screen reader tested

---

## 📝 Definition of Done

For each issue to be considered complete:

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No P0 bugs
- [ ] Mobile responsive
- [ ] Accessibility compliant
- [ ] Merged to main

---

## 🔍 Key Interfaces & Contracts

### Shared Between Phases

**Ingredient Model** (Phase 1 → All)
```typescript
interface Ingredient {
  id: string
  name: string
  category: string
  common_units: string[]
}
```

**Recipe Model** (Phase 1 → All)
```typescript
interface Recipe {
  id: string
  title: string
  servings: number
  ingredients: RecipeIngredient[]
  instructions: string[]
  // ... other fields
}
```

**Pantry Item Model** (Phase 1 → Phase 2, 3)
```typescript
interface PantryItem {
  id: string
  ingredient_id: string
  quantity?: number
  unit?: string
  household_id: string
}
```

**Scaling Service** (Phase 2 #08 → Phase 2 #11, Phase 3)
```typescript
function scaleRecipe(recipe: Recipe, servings: number): ScaledRecipe
```

**Substitution Service** (Phase 2 #09 → Phase 2 #10, Phase 3)
```typescript
class SubstitutionService {
  async getSubstitutes(ingredientId: string): Promise<Substitution[]>
  async areSubstitutable(id1: string, id2: string): Promise<boolean>
}
```

---

## 📈 Progress Tracking

### Recommended Tools
- GitHub Projects for issue tracking
- Shared Google Doc for daily updates
- Slack/Discord for real-time communication
- Figma for design collaboration (if needed)

### Metrics to Track
- Issues completed
- Test coverage percentage
- Deployment status
- Blocker count
- Timeline adherence

---

## 🎓 Onboarding New Workers

### First Day Checklist
- [ ] Read overall project README
- [ ] Read your phase documentation
- [ ] Clone repository and run locally
- [ ] Review completed issues (#01-04)
- [ ] Meet your team
- [ ] Attend kickoff meeting
- [ ] Set up development environment
- [ ] Run existing tests
- [ ] Ask questions!

### Getting Help
1. Check phase documentation
2. Review issue specifications
3. Search codebase for examples
4. Ask in team chat
5. Schedule 1:1 with team member

---

## 🏆 Success Metrics

### Project Complete When:
1. ✅ All 13 issues complete (#05-17)
2. ✅ All tests passing (> 80% coverage)
3. ✅ Application deployed to production
4. ✅ Zero P0 bugs
5. ✅ Documentation complete
6. ✅ Monitoring active
7. ✅ Team retrospective held

### Celebration Criteria:
- Ship to production ✨
- Users can create recipes 🍳
- Users can manage pantry 🥫
- Users can generate grocery lists 🛒
- Features work smoothly 🎯
- Team is proud of the work 💪

---

## 📞 Questions?

If you have questions about:
- **Your specific phase:** Check phase documentation
- **Overall project:** Check main README
- **Technical setup:** Check developer docs
- **Coordination:** Ask project lead
- **Blockers:** Notify team immediately

---

## 🚀 Let's Build Something Great!

Remember:
- Communication is key
- Ask questions early
- Help each other succeed
- Write quality code
- Test thoroughly
- Ship with confidence

**Good luck, team! 🎉**
