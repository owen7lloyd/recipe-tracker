# Phase 3: Grocery Lists - Sequential Execution Plan

**Duration:** 15 days
**Issues:** #12, #13, #14

## ⚠️ Important: No Parallelization Possible

Phase 3 issues **must be completed sequentially**. Each issue is a complete blocker for the next:

```
#12 Grocery List Generation (5 days)
    ↓ BLOCKS
#13 List Organization (4 days)
    ↓ BLOCKS
#14 Real-time Sync (6 days)
```

**Reason:** Each issue builds directly on top of the previous one. You cannot organize lists that don't exist, and you cannot sync lists that aren't organized.

---

## Sequential Workstream

### Issue #12: Grocery List Generation (Days 1-5)

**Worker:** Single developer
**Dependencies:** Phase 1 (#05, #06) + Phase 2 (#08)

**Core Deliverables:**
1. Grocery list data model
2. Generation algorithm (from selected recipes)
3. Pantry exclusion logic
4. Quantity combining for shared ingredients
5. Basic CRUD API for lists
6. Recipe selection UI
7. Basic list view

**Files:**
```
prisma/migrations/*_grocery_lists.sql
app/api/grocery-lists/generate/route.ts
app/api/grocery-lists/route.ts
app/api/grocery-lists/[id]/route.ts
app/(dashboard)/grocery-lists/page.tsx
app/(dashboard)/grocery-lists/new/page.tsx
app/(dashboard)/grocery-lists/[id]/page.tsx
components/grocery-lists/RecipeSelector.tsx
components/grocery-lists/GroceryListView.tsx
lib/grocery-list-generator.ts
```

**Definition of Done:**
- [ ] Database schema created
- [ ] Can select multiple recipes
- [ ] List generation algorithm working
- [ ] Pantry items excluded correctly
- [ ] Shared ingredients combined
- [ ] Can view generated list
- [ ] Can manually add/remove items
- [ ] Tests passing
- [ ] Branch merged to main

**DO NOT START #13 until #12 is 100% complete and merged**

---

### Issue #13: List Organization (Days 6-9)

**Worker:** Single developer (can be same or different)
**Dependencies:** #12 (COMPLETE)

**Core Deliverables:**
1. Category system for grocery items
2. Auto-categorization logic
3. Grouped/organized list view
4. Check/uncheck functionality
5. Collapsible categories
6. Category reordering (optional)
7. Mobile-optimized shopping interface

**Files:**
```
prisma/migrations/*_add_categories.sql
app/api/grocery-lists/[id]/items/[itemId]/route.ts
app/api/household/category-order/route.ts
app/(dashboard)/grocery-lists/[id]/page.tsx (enhanced)
components/grocery-lists/OrganizedGroceryList.tsx
components/grocery-lists/CategorySection.tsx
components/grocery-lists/GroceryListItem.tsx
lib/constants/categories.ts
```

**Key Integration Points:**

Must work with #12's data structures:
```typescript
// From #12 - DO NOT CHANGE without coordination
interface GroceryListItem {
  id: string
  grocery_list_id: string
  ingredient_id: string
  quantity: number
  unit: string
  checked: boolean
  // #13 ADDS:
  category?: string        // New field
  checked_by?: string      // New field
  checked_at?: Date        // New field
}
```

**Coordination with #12 Worker:**
- Review #12's data model before starting
- Understand list generation logic
- Ensure category additions don't break generation
- Migration must be backward compatible

**Definition of Done:**
- [ ] Categories defined and seeded
- [ ] Items auto-categorized on creation
- [ ] List view shows items grouped by category
- [ ] Can check/uncheck items
- [ ] Categories collapsible
- [ ] Mobile-friendly touch targets
- [ ] Show/hide checked items works
- [ ] Tests passing
- [ ] Branch merged to main

**DO NOT START #14 until #13 is 100% complete and merged**

---

### Issue #14: Real-time Sync & Sharing (Days 10-15)

**Worker:** Single developer (can be same or different)
**Dependencies:** #12 (COMPLETE) + #13 (COMPLETE)

**Core Deliverables:**
1. Real-time infrastructure setup (Supabase/Pusher)
2. WebSocket connections
3. Real-time sync for check/uncheck
4. Real-time sync for additions/removals
5. Optimistic updates
6. Shareable link system
7. Public read-only view
8. Presence indicators

**Files:**
```
lib/realtime.ts
lib/hooks/useGroceryListRealtime.ts
app/api/grocery-lists/[id]/share/route.ts
app/api/grocery-lists/shared/[token]/route.ts
app/(public)/shared/[token]/page.tsx
components/grocery-lists/ShareListModal.tsx
components/grocery-lists/ActiveUsers.tsx
prisma/migrations/*_grocery_list_shares.sql
```

**Key Integration Points:**

Must work with both #12 and #13:
```typescript
// From #12 - List structure
// From #13 - Category organization and check/uncheck

// #14 ADDS real-time layer on top
// Must sync:
// - Item additions (from #12)
// - Item removals (from #12)
// - Check state (from #13)
// - Category changes (from #13)
```

**Coordination with #12 and #13 Workers:**
- Review both previous implementations thoroughly
- Understand the complete data flow
- Real-time layer must not break existing functionality
- Test with existing lists created in #12

**Infrastructure Setup:**
- Set up Supabase project OR Pusher account
- Add credentials to environment variables
- Document setup for other developers
- Create local testing guide

**Definition of Done:**
- [ ] Real-time infrastructure working
- [ ] Changes sync across clients (< 1 second)
- [ ] Optimistic updates implemented
- [ ] Rollback on error works
- [ ] Shareable links generate correctly
- [ ] Public view is read-only
- [ ] Can revoke share links
- [ ] Presence indicators working
- [ ] Tests passing (including multi-client)
- [ ] Branch merged to main

---

## Worker Handoffs

### Handoff #12 → #13

**Exit Criteria from #12:**
- [ ] All tests green
- [ ] Branch merged to main
- [ ] Database migrations applied
- [ ] Documentation written

**Entry Criteria for #13:**
- [ ] Pull latest from main
- [ ] Review #12 code thoroughly
- [ ] Understand GroceryList and GroceryListItem models
- [ ] Test list generation locally
- [ ] Confirm can create lists before starting

**Handoff Meeting (1 hour):**
- #12 worker demos the feature
- Walk through data models
- Explain generation algorithm
- Discuss any gotchas or edge cases
- #13 worker asks questions

### Handoff #13 → #14

**Exit Criteria from #13:**
- [ ] All tests green
- [ ] Branch merged to main
- [ ] Database migrations applied
- [ ] Documentation written
- [ ] Categories working correctly

**Entry Criteria for #14:**
- [ ] Pull latest from main
- [ ] Review #12 and #13 code
- [ ] Understand complete list flow
- [ ] Test organized lists locally
- [ ] Can check/uncheck items before starting

**Handoff Meeting (1 hour):**
- #13 worker demos organized lists
- Walk through category system
- Explain check/uncheck logic
- Discuss optimistic update strategy
- #14 worker asks questions

---

## Timeline & Milestones

### Week 1: Generation
- **Day 1:** Start #12, set up schema
- **Day 2:** Implement generation algorithm
- **Day 3:** Build recipe selector UI
- **Day 4:** Pantry exclusion and quantity combining
- **Day 5:** Testing, merge #12
  - **Milestone:** Can generate grocery lists

### Week 2: Organization
- **Day 6:** Start #13, add category schema
- **Day 7:** Implement auto-categorization
- **Day 8:** Build organized list view
- **Day 9:** Check/uncheck, mobile polish, merge #13
  - **Milestone:** Lists are organized and shoppable

### Week 3: Real-time
- **Day 10:** Start #14, set up real-time infrastructure
- **Day 11:** Implement sync for check/uncheck
- **Day 12:** Optimistic updates and conflict resolution
- **Day 13:** Shareable links system
- **Day 14:** Public view and presence
- **Day 15:** Testing, merge #14
  - **Milestone:** Real-time collaboration working

---

## Testing Strategy

### #12 Tests
```typescript
// Integration tests
- Generate list from 1 recipe
- Generate list from multiple recipes
- Exclude pantry items correctly
- Combine shared ingredients
- Handle different units

// E2E tests
- Select recipes → Generate list → View list
- Add manual item to list
- Remove item from list
```

### #13 Tests
```typescript
// Integration tests
- Items categorized correctly on creation
- Categories appear in correct order
- Check/uncheck persists
- Filter by category works

// E2E tests
- Generate list → View organized by category
- Collapse/expand categories
- Check items while shopping
- Show/hide checked items
```

### #14 Tests
```typescript
// Integration tests
- WebSocket connection establishes
- Changes broadcast to other clients
- Optimistic updates work
- Share links generate correctly
- Public view is read-only

// E2E tests (multi-browser)
- User A checks item, User B sees it immediately
- User A adds item, User B sees it
- Generate share link, open in incognito, verify read-only
```

---

## Risk Mitigation

### Risk: Worker change between issues
**Impact:** New worker unfamiliar with previous work
**Mitigation:**
- Comprehensive handoff meetings
- Thorough documentation from each issue
- Code walkthrough videos (optional)
- Previous worker available for questions

### Risk: Database schema changes affect previous work
**Impact:** Breaking changes to existing functionality
**Mitigation:**
- All migrations must be backward compatible
- Add new columns with defaults
- Never remove columns (mark deprecated instead)
- Test existing functionality after each migration

### Risk: Real-time setup complex, delays #14
**Impact:** Phase 3 extends beyond 15 days
**Mitigation:**
- #14 worker researches Supabase/Pusher on Day 9
- Infrastructure setup completed Day 10 morning
- Fallback: Polling mechanism if real-time blocks
- Alert if Day 12 and real-time not working

### Risk: Scope creep in any issue
**Impact:** Delays subsequent issues
**Mitigation:**
- Stick to issue specifications
- "Nice to have" features deferred to polish phase
- Daily progress check-ins
- If behind schedule, notify team immediately

---

## Communication Protocol

### Daily Check-ins
- 5 minutes, end of day
- Progress update
- On track for completion?
- Any blockers?

### Handoff Meetings
- Scheduled 1 day before next issue starts
- 1 hour, structured agenda
- Demo + Q&A
- Document action items

### Blocker Escalation
- If blocked > 2 hours, notify team
- If risk to timeline, notify project lead
- Don't wait until standup

---

## Definition of Done: Phase 3

Phase 3 is complete when:

- [ ] Users can generate grocery lists from recipes
- [ ] Lists are organized by store category
- [ ] Users can check items while shopping
- [ ] Changes sync in real-time between household members
- [ ] Lists can be shared via link
- [ ] All tests passing
- [ ] All three issues merged to main
- [ ] Documentation complete
- [ ] Ready for Phase 4 (Polish & Deploy)

---

## Handoff to Phase 4

**Exit Criteria:**
- [ ] All Phase 3 issues complete
- [ ] Integration tests pass
- [ ] E2E flows tested
- [ ] Real-time sync verified with multiple users
- [ ] Share links working

**What Phase 4 Workers Need:**
- Complete grocery list system
- All Phase 1-3 features functional
- Real-time infrastructure documented
- Share link system documented
- Ready for UI polish and testing

**Handoff Documentation:**
- Grocery list data model
- Real-time setup guide
- API documentation
- Known issues or technical debt
- Suggested improvements for polish phase

---

## Alternative: Same Worker for All Three

**Advantages:**
- Deep context retention
- No handoff overhead
- Faster overall execution
- Consistent code style

**Recommended Approach if Using Same Worker:**
- Take 1-day break between issues
- Fresh perspective reduces bugs
- Document as you go
- Don't skip handoff checklists
- Self-review code between issues

---

## Success Criteria

Phase 3 is successful when:

1. ✅ Grocery list generation is intuitive and accurate
2. ✅ Lists are well-organized for shopping
3. ✅ Real-time sync feels instantaneous
4. ✅ Sharing works seamlessly
5. ✅ All features are production-ready
6. ✅ Zero critical bugs
7. ✅ Ready for Phase 4
