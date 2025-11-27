# GitHub Issues for Recipe & Pantry Tracker

This directory contains detailed GitHub issue templates for implementing the Recipe & Pantry Tracker application based on the PRD.

## How to Use

Each markdown file in this directory represents a GitHub issue. To create the issues on GitHub:

1. Go to your repository on GitHub
2. Navigate to the "Issues" tab
3. Click "New Issue"
4. Copy the content from each file below and paste it into the issue
5. Adjust labels, assignees, and milestones as needed

## Issues by Phase

### Phase 1: Foundation (Weeks 1-3)

**Goal:** Establish core infrastructure with authentication, household management, basic recipe CRUD, and simple pantry management.

1. **[Project Setup](./01-project-setup.md)** - P0, 3 days
   - Initialize Next.js, database, dev tools, project structure

2. **[Database Schema](./02-database-schema.md)** - P0, 4 days
   - Design and implement complete database schema

3. **[Authentication System](./03-authentication-system.md)** - P0, 5 days
   - User registration, login, session management, protected routes

4. **[Household Management](./04-household-management.md)** - P0, 4 days
   - Household creation, invitation system, member management

5. **[Recipe CRUD](./05-recipe-crud.md)** - P0, 6 days
   - Complete recipe management with image upload

6. **[Pantry Management](./06-pantry-management.md)** - P0, 5 days
   - Pantry inventory with autocomplete and bulk operations

**Phase 1 Total: ~27 days (3-4 weeks with parallel work)**

---

### Phase 2: Core Features (Weeks 4-6)

**Goal:** Implement recipe web scraping, scaling, pantry-recipe matching with substitutions, and "cook recipe" functionality.

7. **[Recipe Web Import](./07-recipe-web-import.md)** - P1, 6 days
   - Recipe scraping from URLs with schema.org and HTML parsing

8. **[Recipe Scaling](./08-recipe-scaling.md)** - P0, 3 days
   - Scale recipes with fraction formatting and edge cases

9. **[Ingredient Substitutions](./09-ingredient-substitutions.md)** - P0, 4 days
   - Substitution system with ratio adjustments

10. **[Recipe Matching](./10-recipe-matching.md)** - P0, 5 days
    - "What Can I Cook?" feature with substitution support

11. **[Cook Recipe Feature](./11-cook-recipe-feature.md)** - P0, 4 days
    - Automatic pantry updates when cooking recipes

**Phase 2 Total: ~22 days (3 weeks with parallel work)**

---

### Phase 3: Grocery Lists (Weeks 7-8)

**Goal:** Implement grocery list generation, organization, household sharing, and real-time sync.

12. **[Grocery List Generation](./12-grocery-list-generation.md)** - P0, 5 days
    - Generate lists from recipes with smart quantity combining

13. **[List Organization](./13-list-organization.md)** - P0, 4 days
    - Organize by store category with mobile optimization

14. **[Real-time Sync & Sharing](./14-realtime-sync.md)** - P0, 6 days
    - Real-time collaboration and shareable links

**Phase 3 Total: ~15 days (2 weeks with parallel work)**

---

### Phase 4: Polish & Deploy (Weeks 9-10)

**Goal:** Refine UI/UX, optimize performance, comprehensive testing, and deploy to production.

15. **[UI/UX Polish](./15-ui-ux-polish.md)** - P0, 5 days
    - Loading states, error handling, accessibility, mobile optimization

16. **[Testing Suite](./16-testing-suite.md)** - P0, 7 days
    - Unit, integration, E2E, performance, and security tests

17. **[Deployment](./17-deployment.md)** - P0, 4 days
    - Production deployment with monitoring and CI/CD

**Phase 4 Total: ~16 days (2 weeks with parallel work)**

---

## Total Timeline

- **Phase 1:** 3-4 weeks
- **Phase 2:** 3 weeks
- **Phase 3:** 2 weeks
- **Phase 4:** 2 weeks

**Total: 10-11 weeks** to MVP deployment

## Priority Legend

- **P0:** Must have for MVP
- **P1:** Should have for MVP
- **P2:** Nice to have
- **P3:** Future enhancement

## Dependencies

Each issue lists its dependencies. Generally:
- Phase 2 depends on Phase 1 completion
- Phase 3 depends on Phase 1-2 completion
- Phase 4 can start in parallel with late Phase 3

## Success Metrics

### Phase 1 Success Criteria
- ✅ 100% of auth tests passing
- ✅ Users can create and join households
- ✅ 10+ recipes added manually
- ✅ 20+ pantry items tracked
- ✅ Mobile responsive on 3 devices tested

### Phase 2 Success Criteria
- ✅ Successfully import 10 recipes from different sources
- ✅ Recipe scaling accurate to 2 decimal places
- ✅ "What Can I Cook?" shows correct results in 95% of test cases
- ✅ Substitution logic works for 10+ common substitutions
- ✅ Pantry updates correctly after cooking

### Phase 3 Success Criteria
- ✅ Generate shopping lists in < 2 seconds
- ✅ Real-time sync latency < 1 second
- ✅ Shared links accessible without login
- ✅ Mobile shopping experience rated 4+ stars

### Phase 4 Success Criteria
- ✅ Lighthouse score > 90
- ✅ Test coverage > 80%
- ✅ Zero critical bugs in production
- ✅ Successful deployment with zero downtime
- ✅ 5+ users actively testing

## Additional Resources

- **PRD:** `recipe-pantry-tracker-PRD.md`
- **Implementation Plan:** `IMPLEMENTATION_PLAN.md`

## Labels Recommendation

Create these labels in your GitHub repository:

- `phase-1-foundation`
- `phase-2-core-features`
- `phase-3-grocery-lists`
- `phase-4-polish-deploy`
- `priority-p0`
- `priority-p1`
- `priority-p2`
- `backend`
- `frontend`
- `database`
- `testing`
- `documentation`

## Milestones Recommendation

Create these milestones:

1. **Phase 1: Foundation** - Due: Week 3
2. **Phase 2: Core Features** - Due: Week 6
3. **Phase 3: Grocery Lists** - Due: Week 8
4. **Phase 4: Polish & Deploy** - Due: Week 10
5. **MVP Launch** - Due: Week 11

---

**Note:** These issues provide detailed technical specifications, code examples, and acceptance criteria. They can be used as-is or adapted to your team's workflow. Each issue is designed to be actionable and includes everything needed to implement the feature.
